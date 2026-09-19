from pydantic import BaseModel
from typing import Optional

class ThemePalette(BaseModel):
    foreground: str
    background: str
    accent: Optional[str] = None

class ThemeVisual(BaseModel):
    gradient: bool = False
    pattern: str = "standard"
    eye_style: str = "square"

class ThemeQR(BaseModel):
    error_correction: str = "H"
    margin: int = 4

class ThemeSpec(BaseModel):
    theme_name: str
    mood: str
    style: str
    palette: ThemePalette
    visual: ThemeVisual
    qr: ThemeQR

class ThemeRequest(BaseModel):
    prompt: str
