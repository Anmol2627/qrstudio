from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health

app = FastAPI(
    title="QR Studio AI Backend",
    description="ML and Computer Vision backend for QR Studio intelligent features.",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])

@app.get("/")
def root():
    return {"message": "QR Studio AI Backend is running. See /docs for API documentation."}
