from pydantic import BaseModel
from typing import List

class ResumeResult(BaseModel):
    filename: str
    text: str
    status: str

class RankRequest(BaseModel):
    job_description: str

class RankedResume(BaseModel):
    filename: str
    rank: int
    score: int
    strengths: List[str]
    weaknesses: List[str]
    red_flags: List[str]
    summary: str