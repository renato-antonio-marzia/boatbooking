"""Generate BoatBooking app icons (favicon + PWA + Apple touch).

Design: white anchor on navy rounded square, supersampled 4x for crisp edges.
Run: python tools/generate_icons.py
"""

from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

NAVY = (30, 58, 138, 255)   # #1e3a8a (matches manifest theme_color)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

SUPERSAMPLE = 4


def draw_anchor(img: Image.Image, color=WHITE) -> None:
    """Draw a centered anchor on a square RGBA image."""
    W, H = img.size
    cx = W / 2
    s = min(W, H)
    draw = ImageDraw.Draw(img)

    # Ring at top
    ring_cy = H * 0.20
    r_outer = s * 0.085
    r_inner = s * 0.052
    draw.ellipse(
        [cx - r_outer, ring_cy - r_outer, cx + r_outer, ring_cy + r_outer],
        fill=color,
    )
    draw.ellipse(
        [cx - r_inner, ring_cy - r_inner, cx + r_inner, ring_cy + r_inner],
        fill=TRANSPARENT,
    )

    # Vertical shaft
    shaft_w = s * 0.07
    shaft_top = ring_cy + r_outer * 0.7
    shaft_bot = H * 0.78
    draw.rectangle(
        [cx - shaft_w / 2, shaft_top, cx + shaft_w / 2, shaft_bot],
        fill=color,
    )

    # Stock (horizontal crossbar) with tapered tips
    stock_w = s * 0.42
    stock_h = s * 0.055
    stock_cy = H * 0.36
    draw.rectangle(
        [cx - stock_w / 2, stock_cy - stock_h / 2,
         cx + stock_w / 2, stock_cy + stock_h / 2],
        fill=color,
    )
    # Small triangular caps at stock ends for nautical detail
    cap = s * 0.025
    draw.polygon([
        (cx - stock_w / 2, stock_cy - stock_h / 2 - cap),
        (cx - stock_w / 2, stock_cy + stock_h / 2 + cap),
        (cx - stock_w / 2 - cap * 1.5, stock_cy),
    ], fill=color)
    draw.polygon([
        (cx + stock_w / 2, stock_cy - stock_h / 2 - cap),
        (cx + stock_w / 2, stock_cy + stock_h / 2 + cap),
        (cx + stock_w / 2 + cap * 1.5, stock_cy),
    ], fill=color)

    # U-shaped arms (thick arc)
    arc_w = max(int(s * 0.08), 2)
    arc_box = [cx - s * 0.32, H * 0.46, cx + s * 0.32, H * 0.86]
    draw.arc(arc_box, start=0, end=180, fill=color, width=arc_w)

    # Flukes (triangular tips at end of arms)
    fluke = s * 0.10
    arm_y = H * 0.66
    # Left fluke
    lx = cx - s * 0.32
    draw.polygon([
        (lx - fluke * 1.3, arm_y),
        (lx + fluke * 0.2, arm_y - fluke * 0.7),
        (lx + fluke * 0.2, arm_y + fluke * 0.6),
    ], fill=color)
    # Right fluke
    rx = cx + s * 0.32
    draw.polygon([
        (rx + fluke * 1.3, arm_y),
        (rx - fluke * 0.2, arm_y - fluke * 0.7),
        (rx - fluke * 0.2, arm_y + fluke * 0.6),
    ], fill=color)


def make_icon(size: int, *, with_bg: bool = True) -> Image.Image:
    """Render a square icon at the given pixel size."""
    big = size * SUPERSAMPLE
    img = Image.new("RGBA", (big, big), TRANSPARENT)

    if with_bg:
        draw = ImageDraw.Draw(img)
        radius = int(big * 0.22)
        draw.rounded_rectangle([0, 0, big, big], radius=radius, fill=NAVY)

    draw_anchor(img, color=WHITE)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)

    # Apple touch icon (iOS home screen)
    make_icon(180).save(PUBLIC / "apple-touch-icon.png", "PNG")

    # PWA / Android Chrome
    make_icon(192).save(PUBLIC / "android-chrome-192x192.png", "PNG")
    make_icon(512).save(PUBLIC / "android-chrome-512x512.png", "PNG")

    # Modern PNG favicons
    make_icon(32).save(PUBLIC / "favicon-32x32.png", "PNG")
    make_icon(16).save(PUBLIC / "favicon-16x16.png", "PNG")

    # Multi-size ICO (browser tab)
    base = make_icon(64)
    base.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )

    # Maskable icon for Android adaptive icons (safe zone = inner 80%)
    # PWA installable: bg fills the whole square so OS can crop
    make_icon(512).save(PUBLIC / "maskable-512.png", "PNG")

    print("Generated icons:")
    for f in sorted(PUBLIC.glob("*.png")) + [PUBLIC / "favicon.ico"]:
        print(f"  {f.name:35s} {f.stat().st_size:>7d} B")


if __name__ == "__main__":
    main()
