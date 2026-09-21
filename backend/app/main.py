from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health
from app.api import content
from app.api import theme
from app.api import reliability
from app.api import poster

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
app.include_router(content.router, prefix="/api", tags=["Content"])
app.include_router(theme.router, prefix="/api", tags=["Theme"])
app.include_router(reliability.router, prefix="/api", tags=["Reliability"])
app.include_router(poster.router, prefix="/api", tags=["Poster"])

@app.get("/")
def root():
    return {"message": "QR Studio AI Backend is running. See /docs for API documentation."}
