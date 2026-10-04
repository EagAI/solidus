"""Regenerate web images from the source PNGs in src/assets.

Run after replacing robot.png or solidus-logo.png:

    python scripts/build-images.py

- robot-hero.webp  : robot.png with the eyes painted out (the hero draws live
                     eyes on top), sized for the hero (~510 CSS px @2x).
- robot.webp       : small robot for the panel mascot / login card.
- solidus-logo.webp: header/footer logo (shown at 232 CSS px).
- aura-blue-purple.webp: CTA glow behind the bottom button.

EYES are measured on robot.png (1254x1254). If the new robot.png has its eyes
elsewhere, update EYES here and the matching % in HomePage.css (.hero__eye*).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ASSETS = Path(__file__).resolve().parent.parent / "src" / "assets"

# Eye arc bounding boxes (x0, y0, x1, y1) in robot.png pixels.
EYES = [(618, 292, 729, 349), (826, 295, 936, 348)]
VISOR = (1, 1, 4, 252)


def resized(im: Image.Image, width: int) -> Image.Image:
    if im.width <= width:
        return im
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def robot_without_eyes(im: Image.Image) -> Image.Image:
    mask = Image.new("L", im.size, 0)
    draw = ImageDraw.Draw(mask)
    for x0, y0, x1, y1 in EYES:
        draw.rounded_rectangle((x0 - 22, y0 - 22, x1 + 22, y1 + 24), radius=40, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(6))
    return Image.composite(Image.new("RGBA", im.size, VISOR), im, mask)


def save_webp(im: Image.Image, name: str, quality: int = 86) -> None:
    out = ASSETS / name
    im.save(out, "WEBP", quality=quality, method=6)
    print(f"{name}: {im.width}x{im.height}, {out.stat().st_size // 1024} KB")


def main() -> None:
    robot = Image.open(ASSETS / "robot.png").convert("RGBA")
    save_webp(resized(robot_without_eyes(robot), 1024), "robot-hero.webp")
    save_webp(resized(robot, 512), "robot.webp")

    logo = Image.open(ASSETS / "solidus-logo.png").convert("RGBA")
    save_webp(resized(logo, 480), "solidus-logo.webp", quality=90)

    aura = Image.open(ASSETS / "aura-blue-purple.jpg").convert("RGB")
    save_webp(resized(aura, 1920), "aura-blue-purple.webp", quality=80)


if __name__ == "__main__":
    main()
