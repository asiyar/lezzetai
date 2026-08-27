export function normalizeBarcodeInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^\d{8,14}$/.test(digits) ? digits : null;
}
