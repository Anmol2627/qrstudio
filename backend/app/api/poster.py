from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import Response
from app.utils.image_processing import get_dominant_colors
import qrcode
from PIL import Image, ImageDraw
import io
import math

router = APIRouter()

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6: return (0, 0, 0)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

@router.post("/ai/poster-qr")
async def generate_poster_qr(
    url: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Takes an event poster image and a URL.
    Generates a QR code with colors derived from the poster,
    and composites the QR code onto the bottom right corner of the poster.
    Returns the composited image.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")
        
    try:
        # 1. Read poster
        contents = await file.read()
        poster = Image.open(io.BytesIO(contents)).convert("RGBA")
        
        # 2. Extract colors
        colors = get_dominant_colors(contents, k=3)
        fg_hex = colors[0]
        bg_hex = colors[1] if len(colors) > 1 else '#FFFFFF'
        
        # Ensure contrast (basic check, if both are dark, force white bg)
        # For a robust system we'd use the reliability module here, but we'll do a quick check
        # Force background to be white for safety if it's too dark
        bg_rgb = hex_to_rgb(bg_hex)
        if sum(bg_rgb) < 300: 
            bg_hex = '#FFFFFF'
            bg_rgb = (255, 255, 255)
            
        fg_rgb = hex_to_rgb(fg_hex)

        # 3. Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Create QR image with extracted colors
        qr_img = qr.make_image(fill_color=fg_rgb, back_color=bg_rgb).convert("RGBA")
        
        # 4. Composite QR onto poster
        # Calculate size (e.g., 20% of poster width)
        qr_size = int(poster.width * 0.2)
        # Ensure it's not too small or too big
        qr_size = max(100, min(qr_size, 400))
        
        qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
        
        # Position: Bottom Right with margin
        margin = int(poster.width * 0.05)
        x = poster.width - qr_size - margin
        y = poster.height - qr_size - margin
        
        # Paste using alpha compositing
        poster.paste(qr_img, (x, y), qr_img)
        
        # 5. Return as image/png response
        img_byte_arr = io.BytesIO()
        poster.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Poster generation failed: {str(e)}")
