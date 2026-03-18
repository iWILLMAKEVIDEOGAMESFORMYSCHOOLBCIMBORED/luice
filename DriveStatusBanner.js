#!/usr/bin/env python3
"""Generate Juiceify app assets — icon.png, splash.png, adaptive-icon.png, favicon.png"""

from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = "/home/claude/Juiceify/assets"
os.makedirs(OUT, exist_ok=True)

# ── Palette ──────────────────────────────────────────────────
BG_DARK   = (10, 10, 15)        # #0A0A0F
PURPLE    = (155, 89, 182)       # #9B59B6
PURPLE2   = (108, 52, 131)       # #6C3483
WHITE     = (255, 255, 255)
GRAPE     = (140, 70, 160)


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_gradient_bg(draw, w, h, c1, c2):
    for y in range(h):
        t = y / h
        r = int(c1[0] + (c2[0]-c1[0])*t)
        g = int(c1[1] + (c2[1]-c1[1])*t)
        b = int(c1[2] + (c2[2]-c1[2])*t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_grape_clusters(draw, cx, cy, r, color, alpha_scale=1.0):
    """Draw simple circular grape cluster"""
    grape_r = r * 0.18
    positions = [
        (cx, cy - r*0.32),
        (cx - r*0.22, cy - r*0.12),
        (cx + r*0.22, cy - r*0.12),
        (cx - r*0.35, cy + r*0.10),
        (cx,          cy + r*0.10),
        (cx + r*0.35, cy + r*0.10),
        (cx - r*0.18, cy + r*0.32),
        (cx + r*0.18, cy + r*0.32),
        (cx, cy + r*0.52),
    ]
    # Shadow grapes
    for px, py in positions:
        draw.ellipse([px-grape_r-2, py-grape_r-2, px+grape_r+2, py+grape_r+2],
                     fill=(60, 20, 80))
    # Main grapes
    for i, (px, py) in enumerate(positions):
        shade = lerp_color(PURPLE, PURPLE2, i / len(positions))
        draw.ellipse([px-grape_r, py-grape_r, px+grape_r, py+grape_r], fill=shade)
        # Highlight
        hr = grape_r * 0.35
        draw.ellipse([px-hr*0.6, py-grape_r*0.6, px+hr*0.2, py-grape_r*0.1],
                     fill=(200, 150, 220))
    # Stem
    draw.line([(cx, cy - r*0.42), (cx, cy - r*0.55)], fill=(100, 160, 60), width=max(2, int(r*0.04)))
    # Leaf
    leaf_cx = cx + r*0.10
    leaf_cy = cy - r*0.52
    leaf_r = r * 0.10
    draw.ellipse([leaf_cx-leaf_r, leaf_cy-leaf_r*0.5,
                  leaf_cx+leaf_r, leaf_cy+leaf_r*0.5], fill=(80, 150, 50))


def draw_sound_wave(draw, cx, cy, r, color):
    """Draw equalizer / sound-wave bars"""
    bars = 5
    bar_w = r * 0.09
    heights = [0.28, 0.50, 0.75, 0.50, 0.28]
    total_w = bars * bar_w + (bars-1) * bar_w * 0.4
    start_x = cx - total_w / 2
    for i in range(bars):
        bx = start_x + i * (bar_w + bar_w * 0.4)
        bh = r * heights[i]
        draw.rounded_rectangle(
            [bx, cy - bh, bx + bar_w, cy + bh],
            radius=bar_w * 0.4,
            fill=color
        )


# ─────────────────────────────────────────────────────────────
# 1. ICON  1024×1024
# ─────────────────────────────────────────────────────────────
def make_icon(size=1024):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)

    # Rounded-rect background
    margin = int(size * 0.03)
    radius = int(size * 0.22)
    draw_gradient_bg(draw, size, size, (26, 10, 46), BG_DARK)

    # Outer glow ring
    glow_r = int(size * 0.38)
    cx, cy = size//2, size//2
    for i in range(18, 0, -1):
        alpha = int(60 * (i/18))
        col = (*PURPLE, alpha)
        try:
            draw.ellipse([cx-glow_r-i*3, cy-glow_r-i*3,
                          cx+glow_r+i*3, cy+glow_r+i*3],
                         outline=col, width=2)
        except:
            pass

    # White circle bg
    cr = int(size * 0.36)
    draw.ellipse([cx-cr, cy-cr-int(size*0.04), cx+cr, cy+cr-int(size*0.04)],
                 fill=(25, 12, 40))

    # Grape cluster
    draw_grape_clusters(draw, cx, cy - int(size*0.04), int(size*0.32), PURPLE)

    # "J" letter watermark at bottom
    font_size = int(size * 0.10)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()

    draw.text((cx, cy + int(size*0.38)), "JUICEIFY",
              fill=(200, 150, 220), font=font, anchor="mm")

    return img


# ─────────────────────────────────────────────────────────────
# 2. SPLASH  1284×2778
# ─────────────────────────────────────────────────────────────
def make_splash(w=1284, h=2778):
    img = Image.new("RGB", (w, h), BG_DARK)
    draw = ImageDraw.Draw(img)
    draw_gradient_bg(draw, w, h, (26, 10, 46), BG_DARK)

    cx, cy = w//2, h//2 - int(h*0.05)

    # Glow
    for i in range(30, 0, -1):
        alpha = int(40 * (i/30))
        try:
            draw.ellipse([cx-250-i*8, cy-250-i*8, cx+250+i*8, cy+250+i*8],
                         outline=(*PURPLE, alpha), width=3)
        except:
            pass

    # Big grape logo
    draw_grape_clusters(draw, cx, cy, int(w*0.28), PURPLE)

    # App name
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(w*0.12))
        font_sub   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      int(w*0.042))
    except:
        font_title = ImageFont.load_default()
        font_sub   = font_title

    draw.text((cx, cy + int(w*0.35)), "Juiceify",
              fill=WHITE, font=font_title, anchor="mm")
    draw.text((cx, cy + int(w*0.48)), "All Juice WRLD. All the time.",
              fill=(155, 89, 182), font=font_sub, anchor="mm")

    # Sound wave at bottom
    draw_sound_wave(draw, cx, h - int(h*0.12), int(w*0.18), PURPLE)

    return img


# ─────────────────────────────────────────────────────────────
# 3. ADAPTIVE ICON foreground  432×432
# ─────────────────────────────────────────────────────────────
def make_adaptive(size=432):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size//2, size//2
    draw_grape_clusters(draw, cx, cy, int(size*0.40), PURPLE)
    return img


# ─────────────────────────────────────────────────────────────
# 4. FAVICON  48×48
# ─────────────────────────────────────────────────────────────
def make_favicon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Solid background circle
    draw.ellipse([0,0,size,size], fill=PURPLE2)
    cx, cy = size//2, size//2
    # Mini grape cluster (just 3 circles)
    r = size * 0.15
    for dx, dy in [(0,-5),(−4,2),(4,2)]:
        draw.ellipse([cx+dx-r, cy+dy-r, cx+dx+r, cy+dy+r], fill=WHITE)
    return img


# ─────────────────────────────────────────────────────────────
# Save all assets
# ─────────────────────────────────────────────────────────────
print("Generating icon.png …")
icon = make_icon(1024)
icon.save(f"{OUT}/icon.png", "PNG")

print("Generating splash.png …")
splash = make_splash()
splash.save(f"{OUT}/splash.png", "PNG")

print("Generating adaptive-icon.png …")
adaptive = make_adaptive(432)
adaptive.save(f"{OUT}/adaptive-icon.png", "PNG")

print("Generating favicon.png …")
# Simple purple circle with grape blob
fav = Image.new("RGBA", (48,48), (0,0,0,0))
fd = ImageDraw.Draw(fav)
fd.ellipse([0,0,47,47], fill=PURPLE2)
draw_grape_clusters(fd, 24, 24, 18, WHITE)
fav.save(f"{OUT}/favicon.png", "PNG")

print("✅ All assets saved to", OUT)
for f in os.listdir(OUT):
    size_kb = os.path.getsize(f"{OUT}/{f}") // 1024
    print(f"  {f:30s}  {size_kb} KB")
