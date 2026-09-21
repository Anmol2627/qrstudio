import pandas as pd
import numpy as np
import os
import random

# Ensure the output directory exists
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

# We will generate a synthetic dataset mapping QR design parameters to a scannability score (0.0 to 1.0)
# and a boolean 'scannable' flag.

# Features:
# - size (px)
# - margin (modules)
# - error_correction (L=1, M=2, Q=3, H=4)
# - fg_luminance (0.0 to 1.0)
# - bg_luminance (0.0 to 1.0)

def calculate_relative_luminance(hex_color):
    """Simplified relative luminance calculation for synthetic dataset"""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6: return 1.0
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

data = []

# Generate random colors
colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#CCCCCC', '#333333', '#1B4332', '#FACC15', '#DC2626']

for _ in range(2000):
    size = random.randint(100, 1000)
    margin = random.randint(0, 10)
    ec_level = random.choice([1, 2, 3, 4]) # L, M, Q, H
    fg = random.choice(colors)
    bg = random.choice(colors)
    
    fg_lum = calculate_relative_luminance(fg)
    bg_lum = calculate_relative_luminance(bg)
    
    # Calculate Contrast Ratio
    L1 = max(fg_lum, bg_lum)
    L2 = min(fg_lum, bg_lum)
    contrast = (L1 + 0.05) / (L2 + 0.05)
    
    # Ground truth rules for our synthetic dataset
    score = 1.0
    
    # Contrast penalty
    if contrast < 3.0:
        score -= 0.6
    elif contrast < 4.5:
        score -= 0.2
        
    # Inverted colors penalty (QR codes expect dark on light)
    if fg_lum > bg_lum:
        score -= 0.4
        
    # Size penalty
    if size < 200:
        score -= 0.3
        
    # Margin penalty
    if margin < 2:
        score -= 0.2
        
    # Error correction bonus
    score += (ec_level - 1) * 0.05
    
    # Add some random noise
    score += random.uniform(-0.1, 0.1)
    
    # Clamp
    score = max(0.0, min(1.0, score))
    scannable = 1 if score >= 0.7 else 0
    
    data.append({
        'size': size,
        'margin': margin,
        'ec_level': ec_level,
        'fg_lum': fg_lum,
        'bg_lum': bg_lum,
        'contrast': contrast,
        'score': score,
        'scannable': scannable
    })

df = pd.DataFrame(data)
df.to_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reliability_dataset.csv'), index=False)
print(f"Generated {len(df)} synthetic QR scannability samples.")
