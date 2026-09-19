from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import re

router = APIRouter()

class ContentRequest(BaseModel):
    text: str

class ContentResponse(BaseModel):
    type: str
    confidence: float
    entities: dict

# Load model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'content', 'intent_model.joblib')

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Failed to load content model: {e}")

# Simple regex entity extractors
def extract_entities(text: str, intent: str) -> dict:
    entities = {}
    
    if intent == 'URL':
        # Basic URL extraction
        urls = re.findall(r'(https?://[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', text)
        if urls:
            entities['url'] = urls[0]
            if not entities['url'].startswith('http'):
                entities['url'] = 'https://' + entities['url']
                
    elif intent == 'EMAIL':
        emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if emails:
            entities['email'] = emails[0]
            
    elif intent == 'PHONE':
        phones = re.findall(r'(\+?\d[\d\-\s()]{7,}\d)', text)
        if phones:
            entities['phone'] = phones[0].strip()
            
    elif intent == 'WIFI':
        # Heuristics: Look for words after wifi, network, etc.
        # This is basic and can be improved
        parts = text.split()
        if 'wifi' in [p.lower() for p in parts]:
            idx = [p.lower() for p in parts].index('wifi')
            if idx + 1 < len(parts):
                entities['ssid'] = parts[idx+1]
        elif 'network' in [p.lower() for p in parts]:
            idx = [p.lower() for p in parts].index('network')
            if idx + 1 < len(parts):
                entities['ssid'] = parts[idx+1]
                
    elif intent == 'TEXT':
        # Exclude common trigger words, grab the rest
        text_clean = re.sub(r'(?i)(create|make|encode|generate|qr|code|for|message|text)', '', text)
        entities['text'] = text_clean.strip() or text
        
    return entities

@router.post("/ai/content", response_model=ContentResponse)
async def analyze_content(request: ContentRequest):
    if not model:
        # Fallback if model not loaded
        raise HTTPException(status_code=503, detail="Content ML model is not available.")
    
    text = request.text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
    try:
        # Predict intent
        probabilities = model.predict_proba([text])[0]
        classes = model.classes_
        
        # Get highest probability
        max_prob_idx = probabilities.argmax()
        intent = classes[max_prob_idx]
        confidence = float(probabilities[max_prob_idx])
        
        # Extract entities based on intent
        entities = extract_entities(text, intent)
        
        return ContentResponse(
            type=intent.lower(),
            confidence=confidence,
            entities=entities
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
