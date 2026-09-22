"""
Artistic QR Code Generator
==========================

Generates QR codes with embedded image themes or full artistic patterns using Reed-Solomon error correction tolerance (ERROR_CORRECT_H).
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import Response
from app.utils.image_processing import get_dominant_colors
import qrcode
from PIL import Image
import io
import numpy as np

router = APIRouter()

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6: return (0, 0, 0)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_luminance(rgb):
    r, g, b = [x / 255.0 for x in rgb]
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def get_contrast_ratio(rgb1, rgb2):
    l1 = get_luminance(rgb1)
    l2 = get_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def smart_center_crop(img: Image.Image) -> Image.Image:
    """
    Crops the image to a square using center crop.
    This preserves the most important part of most images (the subject).
    """
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    return img.crop((left, top, left + min_dim, top + min_dim))


@router.post("/ai/poster-qr")
async def generate_themed_qr(
    url: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Uses the uploaded image as a COLOR REFERENCE ONLY.
    Extracts dominant colors and generates a standalone styled QR code.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        colors = get_dominant_colors(contents, k=5)

        bg_rgb = (255, 255, 255)
        fg_rgb = (0, 0, 0)

        for color_hex in colors:
            rgb = hex_to_rgb(color_hex)
            lum = get_luminance(rgb)
            contrast = get_contrast_ratio(rgb, bg_rgb)
            if 0.04 < lum < 0.7 and contrast >= 4.5:
                fg_rgb = rgb
                break

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=12,
            border=3,
        )
        qr.add_data(url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color=fg_rgb, back_color=bg_rgb).convert("RGB")

        img_byte_arr = io.BytesIO()
        qr_img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Themed QR generation failed: {str(e)}")


@router.post("/ai/artistic-qr")
async def generate_artistic_qr(
    url: str = Form(...),
    file: UploadFile = File(...),
    output_size: int = Form(600),
    lum_threshold: float = Form(0.40),  # dark module sensitivity
    light_tint: float = Form(0.25),     # 0.0=pure white gaps, 1.0=full image in gaps
):
    """
    Generates an ARTISTIC QR code where the image's colors BECOME the QR modules.

    Parameters:
    - url:            The URL to encode
    - file:           The source image (e.g. Spiderman, poster)
    - output_size:    Final image size in pixels (default 600)
    - lum_threshold:  Luminance cutoff for dark modules (0.1–0.7).
                      Lower = more original image colors preserved.
                      Higher = more aggressive darkening.
    - light_tint:     How much of the image color bleeds into LIGHT modules (0.0–1.0).
                      0.0 = pure white gaps (current behaviour)
                      0.25 = subtle image tint in gaps (recommended)
                      0.6+ = heavy tint — more image visible but risks scan failure
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")

    output_size = max(300, min(output_size, 1200))
    lum_threshold = max(0.1, min(lum_threshold, 0.7))
    light_tint = max(0.0, min(light_tint, 0.65))  # cap at 0.65 — beyond that contrast fails

    try:
        contents = await file.read()

        # ── Step 1: Build QR and get the boolean module matrix ───────────────
        # We use border=0 here because we handle the quiet zone ourselves
        # box_size=1 means each module = 1px in the internal image; 
        # we do our own scaling via numpy
        qr = qrcode.QRCode(
            version=5,  # Higher version = finer grid = higher resolution image
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            border=1,   # Minimal padding
        )
        qr.add_data(url)
        qr.make(fit=True)

        # get_matrix() returns a list of lists of booleans
        # True = dark module, False = light module
        matrix = qr.get_matrix()
        N = len(matrix)  # Total modules including border

        # Convert to numpy for fast operations
        qr_matrix = np.array(matrix, dtype=bool)  # shape: (N, N)

        # ── Step 2: Prepare the source image ─────────────────────────────────
        source = Image.open(io.BytesIO(contents)).convert("RGB")

        # Smart center crop → square
        source = smart_center_crop(source)

        # Resize to our output canvas
        source = source.resize((output_size, output_size), Image.Resampling.LANCZOS)
        source_arr = np.array(source, dtype=np.float32)  # float for math

        # ── Step 3: Build the artistic QR pixel-by-pixel ─────────────────────
        result_arr = np.ones((output_size, output_size, 3), dtype=np.float32) * 255.0

        # Each module maps to a region of (output_size / N) x (output_size / N) pixels
        module_px = output_size / N

        for row in range(N):
            for col in range(N):
                # Pixel bounds for this module on the output canvas
                y0 = int(row * module_px)
                y1 = int((row + 1) * module_px)
                x0 = int(col * module_px)
                x1 = int((col + 1) * module_px)

                # Guard against empty slices at edges
                if y1 <= y0 or x1 <= x0:
                    continue

                # Sample the average color from the source image in this region
                region = source_arr[y0:y1, x0:x1]  # shape: (h, w, 3)\n
                avg_color = region.mean(axis=(0, 1))  # shape: (3,) — [R, G, B]

                if qr_matrix[row, col]:
                    # ── DARK module ──────────────────────────────────────────
                    # Use the ACTUAL image color so the QR looks like the image.
                    # We only darken IF the sampled color is too light (luminance
                    # > 0.5), to guarantee enough contrast against the white
                    # light modules.  Dark image regions (reds, deep blues, blacks)
                    # are used as-is — their natural darkness IS the QR module.
                    R, G, B = avg_color
                    lum = (0.2126*(R/255)**2.2 + 0.7152*(G/255)**2.2 + 0.0722*(B/255)**2.2)
                    if lum > lum_threshold:
                        # Too light — darken while preserving hue
                        factor = 0.35
                        blended = avg_color * factor
                    else:
                        # Dark enough — use the real image color!
                        blended = avg_color
                else:
                    # ── LIGHT module ─────────────────────────────────────────
                    # Instead of pure white, blend the image color into the gap.
                    # Formula: image_color * light_tint + white * (1 - light_tint)
                    # At light_tint=0.25: 25% image, 75% white → soft visible tint
                    # At light_tint=0.50: 50/50 → image clearly visible everywhere
                    #
                    # This is the KEY improvement: the image now shows through BOTH
                    # the dark AND the light modules. The QR still scans because:
                    #   dark module luminance ≈ low (image's dark areas)
                    #   light module luminance ≈ high (heavily white-tinted)
                    #   → sufficient contrast ratio maintained
                    #
                    # Lift the image color towards white (avoid RGB channels clipping)
                    lifted = avg_color * light_tint + 255.0 * (1.0 - light_tint)
                    blended = lifted

                result_arr[y0:y1, x0:x1] = blended

        # ── Step 4: Convert back to uint8 and encode as PNG ──────────────────
        result_arr = np.clip(result_arr, 0, 255).astype(np.uint8)
        result_img = Image.fromarray(result_arr, mode="RGB")

        img_byte_arr = io.BytesIO()
        result_img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        return Response(content=img_byte_arr.getvalue(), media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Artistic QR generation failed: {str(e)}")
