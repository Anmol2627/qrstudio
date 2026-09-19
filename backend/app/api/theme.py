from fastapi import APIRouter, HTTPException
from app.schemas.theme import ThemeRequest, ThemeSpec, ThemePalette, ThemeVisual, ThemeQR
import re

router = APIRouter()

# Semantic attribute mappings
COLOR_MAP = {
    'red': '#DC2626', 'crimson': '#991B1B', 'fire': '#EA580C',
    'blue': '#2563EB', 'ocean': '#0369A1', 'water': '#0284C7', 'navy': '#1E3A8A',
    'green': '#16A34A', 'forest': '#14532D', 'nature': '#15803D',
    'yellow': '#CA8A04', 'sun': '#EAB308', 'gold': '#D97706',
    'purple': '#9333EA', 'royal': '#6B21A8', 'magic': '#7E22CE',
    'black': '#000000', 'dark': '#111827', 'charcoal': '#1F2937',
    'white': '#FFFFFF', 'light': '#F9FAFB', 'cream': '#FEFCE8'
}

MOOD_MAP = {
    'energetic': {'margin': 2, 'error_correction': 'M', 'pattern': 'angular'},
    'calm': {'margin': 4, 'error_correction': 'L', 'pattern': 'standard'},
    'professional': {'margin': 4, 'error_correction': 'Q', 'pattern': 'standard'},
    'playful': {'margin': 3, 'error_correction': 'M', 'pattern': 'rounded'},
    'elegant': {'margin': 5, 'error_correction': 'H', 'pattern': 'standard'},
    'futuristic': {'margin': 2, 'error_correction': 'H', 'pattern': 'angular'}
}

@router.post("/ai/theme", response_model=ThemeSpec)
async def generate_theme(request: ThemeRequest):
    text = request.prompt.lower()
    
    # Defaults
    fg = '#1B4332'
    bg = '#FFFFFF'
    mood = 'professional'
    
    # 1. Extract explicit hex colors if present
    hex_match = re.findall(r'(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})', text)
    if len(hex_match) >= 1:
        fg = hex_match[0].upper()
    if len(hex_match) >= 2:
        bg = hex_match[1].upper()
        
    # 2. Extract semantic colors
    found_colors = []
    for word, hex_val in COLOR_MAP.items():
        if word in text:
            found_colors.append((word, hex_val))
            
    if found_colors and len(hex_match) == 0:
        # If we found at least one semantic color
        fg = found_colors[0][1]
        # If the color is very light (like white or cream), swap it to background
        if found_colors[0][0] in ['white', 'light', 'cream']:
            bg = fg
            fg = '#111827' # Default dark fg
            
        # If we found multiple colors, use the second as background
        if len(found_colors) > 1:
            bg = found_colors[1][1]

    # 3. Extract semantic moods
    for m in MOOD_MAP.keys():
        if m in text:
            mood = m
            break
            
    # Some extra semantic fallbacks for unseen themes using keywords
    if 'luxury' in text or 'wedding' in text:
        mood = 'elegant'
        fg = COLOR_MAP.get('gold', fg)
    if 'sport' in text or 'gym' in text:
        mood = 'energetic'
    if 'tech' in text or 'cyber' in text:
        mood = 'futuristic'
        bg = COLOR_MAP.get('dark', bg)

    # 4. Construct ThemeSpec
    mood_props = MOOD_MAP[mood]
    
    spec = ThemeSpec(
        theme_name=f"{mood.title()} Theme",
        mood=mood,
        style="modern",
        palette=ThemePalette(
            foreground=fg,
            background=bg
        ),
        visual=ThemeVisual(
            gradient=False,
            pattern=mood_props['pattern']
        ),
        qr=ThemeQR(
            error_correction=mood_props['error_correction'],
            margin=mood_props['margin']
        )
    )
    
    return spec
