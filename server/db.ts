import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { FamilyListItem, FamilyPantryItem, InsertUser, familyListItems, familyLists, familyPantryItems, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateFamilyList(input: { inviteCode?: string; title: string; ownerName: string; seedItems: string[] }) {
  const db = await getDb();
  if (!db) throw new Error("Aile listesi veritabanı şu an kullanılamıyor.");
  let list = input.inviteCode ? (await db.select().from(familyLists).where(eq(familyLists.inviteCode, input.inviteCode)).limit(1))[0] : undefined;
  if (!list) {
    const inviteCode = input.inviteCode || crypto.randomUUID();
    const result = await db.insert(familyLists).values({ inviteCode, title: input.title, ownerName: input.ownerName });
    list = { id: Number(result[0].insertId), inviteCode, title: input.title, ownerName: input.ownerName, createdAt: new Date(), updatedAt: new Date() };
    const uniqueSeed = [...new Set(input.seedItems.map((item) => item.trim()).filter(Boolean))].slice(0, 80);
    if (uniqueSeed.length) await db.insert(familyListItems).values(uniqueSeed.map((name) => ({ listId: list!.id, name, checked: false, updatedBy: input.ownerName })));
  }
  const items = await db.select().from(familyListItems).where(eq(familyListItems.listId, list.id));
  return { list, items };
}

export async function updateFamilyListItem(input: { inviteCode: string; name: string; checked: boolean; updatedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Aile listesi veritabanı şu an kullanılamıyor.");
  const list = (await db.select().from(familyLists).where(eq(familyLists.inviteCode, input.inviteCode)).limit(1))[0];
  if (!list) throw new Error("Paylaşılan liste bulunamadı.");
  const current = (await db.select().from(familyListItems).where(eq(familyListItems.listId, list.id))).find((item) => item.name === input.name);
  if (current) await db.update(familyListItems).set({ checked: input.checked, updatedBy: input.updatedBy, updatedAt: new Date() }).where(eq(familyListItems.id, current.id));
  else await db.insert(familyListItems).values({ listId: list.id, name: input.name, checked: input.checked, updatedBy: input.updatedBy });
  await db.update(familyLists).set({ updatedAt: new Date() }).where(eq(familyLists.id, list.id));
  return getFamilyListByCode(input.inviteCode);
}

export async function getFamilyListByCode(inviteCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Aile listesi veritabanı şu an kullanılamıyor.");
  const list = (await db.select().from(familyLists).where(eq(familyLists.inviteCode, inviteCode)).limit(1))[0];
  if (!list) throw new Error("Bu davet koduyla eşleşen aile listesi bulunamadı.");
  const items = await db.select().from(familyListItems).where(eq(familyListItems.listId, list.id));
  return { list, items };
}

export async function getFamilyPantryByCode(inviteCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Ortak kiler veritabanı şu an kullanılamıyor.");
  const list = (await db.select().from(familyLists).where(eq(familyLists.inviteCode, inviteCode)).limit(1))[0];
  if (!list) throw new Error("Bu davet koduyla eşleşen aile alanı bulunamadı.");
  const items = await db.select().from(familyPantryItems).where(eq(familyPantryItems.listId, list.id));
  return { list, items };
}

export async function upsertFamilyPantryItem(input: { inviteCode: string; name: string; quantity: number; unit: string; expiresOn?: string; barcode?: string; updatedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Ortak kiler veritabanı şu an kullanılamıyor.");
  const list = (await db.select().from(familyLists).where(eq(familyLists.inviteCode, input.inviteCode)).limit(1))[0];
  if (!list) throw new Error("Paylaşılan aile alanı bulunamadı.");
  const normalizedName = input.name.trim();
  const items = await db.select().from(familyPantryItems).where(eq(familyPantryItems.listId, list.id));
  const current = items.find((item) => item.name.toLocaleLowerCase("tr-TR") === normalizedName.toLocaleLowerCase("tr-TR"));
  const values = { name: normalizedName, quantity: Math.max(0, Math.round(input.quantity)), unit: input.unit.slice(0, 16), expiresOn: input.expiresOn || null, barcode: input.barcode || null, updatedBy: input.updatedBy, updatedAt: new Date() };
  if (current) await db.update(familyPantryItems).set(values).where(eq(familyPantryItems.id, current.id));
  else await db.insert(familyPantryItems).values({ listId: list.id, ...values });
  await db.update(familyLists).set({ updatedAt: new Date() }).where(eq(familyLists.id, list.id));
  return getFamilyPantryByCode(input.inviteCode);
}

export async function removeFamilyPantryItem(input: { inviteCode: string; name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Ortak kiler veritabanı şu an kullanılamıyor.");
  const list = (await db.select().from(familyLists).where(eq(familyLists.inviteCode, input.inviteCode)).limit(1))[0];
  if (!list) throw new Error("Paylaşılan aile alanı bulunamadı.");
  const items = await db.select().from(familyPantryItems).where(eq(familyPantryItems.listId, list.id));
  const current = items.find((item) => item.name.toLocaleLowerCase("tr-TR") === input.name.trim().toLocaleLowerCase("tr-TR"));
  if (current) await db.delete(familyPantryItems).where(eq(familyPantryItems.id, current.id));
  return getFamilyPantryByCode(input.inviteCode);
}
