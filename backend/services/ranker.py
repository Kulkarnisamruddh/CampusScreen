from groq import Groq
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()


client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def rank_resumes(job_description: str, resumes: list) -> list:
    resume_text = ""
    for i, resume in enumerate(resumes):
        resume_text += f"\n\nResume {i+1} - {resume['filename']}:\n{resume['text']}"

    prompt = f"""You are a senior recruiter. Analyze these resumes for the following job description and rank them.

Job Description:
{job_description}

Resumes:
{resume_text}

For each resume provide:
1. Rank (1 being best)
2. Score out of 100
3. Top 3 strengths
4. Top 3 weaknesses
5. Red flags (if any)
6. One line summary

Respond in this exact JSON format:
[
  {{
    "filename": "resume filename here",
    "rank": 1,
    "score": 85,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "red_flags": ["red flag if any"],
    "summary": "one line summary"
  }}
]

Return only JSON, nothing else."""

    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
    )

    clean = chat_completion.choices[0].message.content
    clean = clean.replace("```json", "").replace("```", "").strip()
    result = json.loads(clean)
    return result