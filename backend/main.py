from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.resumes import router as resume_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "resume screener is running"}