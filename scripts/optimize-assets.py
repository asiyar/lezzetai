from pathlib import Path

from PIL import Image


ROOT = Path("/home/ubuntu/lezzetai")
PNG_ASSETS = [
    ROOT / "assets/images/icon.png",
    ROOT / "assets/images/splash-icon.png",
    ROOT / "assets/images/favicon.png",
    ROOT / "assets/images/android-icon-foreground.png",
]
JPEG_ASSETS = [ROOT / "assets/images/food/mezze.jpg"]


def resize_in_place(path: Path, maximum: int, *, jpeg: bool = False) -> None:
    with Image.open(path) as source:
        image = source.convert("RGB")
        image.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        if jpeg:
            image.save(path, "JPEG", quality=82, optimize=True, progressive=True)
        else:
            image.save(path, "PNG", optimize=True, compress_level=9)
    print(f"{path.relative_to(ROOT)}: {path.stat().st_size // 1024} KB")


for asset in PNG_ASSETS:
    resize_in_place(asset, 640)

for asset in JPEG_ASSETS:
    resize_in_place(asset, 1400, jpeg=True)
