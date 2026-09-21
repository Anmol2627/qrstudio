from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import math

router = APIRouter()

class ReliabilityRequest(BaseModel):
    size: int
    margin: int
    error_correction: str
    foreground_color: str
    background_color: str

class ReliabilityResponse(BaseModel):
    score: float
    scannable: bool
    issues: list[str]
    recommendations: dict

# Load model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'reliability', 'reliability_model.joblib')

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Failed to load reliability model: {e}")

def get_relative_luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6: return 1.0
    try:
        r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    except ValueError:
        return 1.0
        
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

EC_MAP = {'L': 1, 'M': 2, 'Q': 3, 'H': 4}

@router.post("/ai/reliability", response_model=ReliabilityResponse)
async def analyze_reliability(request: ReliabilityRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Reliability ML model is not available.")
        
    fg_lum = get_relative_luminance(request.foreground_color)
    bg_lum = get_relative_luminance(request.background_color)
    
    L1 = max(fg_lum, bg_lum)
    L2 = min(fg_lum, bg_lum)
    contrast = (L1 + 0.05) / (L2 + 0.05)
    
    ec_level = EC_MAP.get(request.error_correction, 4)
    
    # Feature array for Random Forest: ['size', 'margin', 'ec_level', 'fg_lum', 'bg_lum', 'contrast']
    features = [[
        request.size,
        request.margin,
        ec_level,
        fg_lum,
        bg_lum,
        contrast
    ]]
    
    try:
        score = float(model.predict(features)[0])
        score = max(0.0, min(1.0, score)) # clamp
        
        scannable = score >= 0.7
        
        # Analyze issues based on the features that drag the score down
        issues = []
        recommendations = {}
        
        if contrast < 3.0:
            issues.append("Critically low contrast. The QR code may not scan.")
            recommendations["colors"] = {"foreground": "#111827", "background": "#FFFFFF"}
        elif contrast < 4.5:
            issues.append("Low contrast. Scanning in poor lighting may fail.")
            
        if fg_lum > bg_lum:
            issues.append("Inverted colors. Many scanners cannot read light codes on dark backgrounds.")
            # Swap recommendation
            recommendations["colors"] = {"foreground": request.background_color, "background": request.foreground_color}
            
        if request.size < 200:
            issues.append("QR code is very small. High density data might blur.")
            recommendations["size"] = max(200, request.size + 100)
            
        if request.margin < 2:
            issues.append("Quiet zone (margin) is too small. Scanners need empty space around the code.")
            recommendations["margin"] = 4
            
        return ReliabilityResponse(
            score=score,
            scannable=scannable,
            issues=issues,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
