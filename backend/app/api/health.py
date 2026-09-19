from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    service: str
    models: dict[str, bool]

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for the ML backend.
    Checks if the service is running and models are loaded.
    """
    # For now, we mock the model loading status until models are actually loaded
    return HealthResponse(
        status="ok",
        service="qr-studio-ml",
        models={
            "content": False,  # Will be true when NLP model is loaded
            "theme": False,
            "reliability": False
        }
    )
