"""
Personalized learning roadmap generator using Gemini AI.
"""
import json
from typing import Dict, Any, List
from app.core.config import settings
from app.models.student_profile import StudentProfile


ROADMAP_FALLBACK = {
    "title": "Your Personalized Learning Roadmap",
    "phases": [
        {
            "phase": 1,
            "title": "Foundation & Self-Assessment",
            "duration": "1-2 months",
            "tasks": [
                "Identify your strengths and areas for improvement",
                "Research career options aligned with your interests",
                "Explore scholarship opportunities on NSP portal",
                "Connect with a mentor or career counselor",
            ],
            "resources": ["National Career Service Portal", "NSP Scholarship Portal"],
        },
        {
            "phase": 2,
            "title": "Academic Preparation",
            "duration": "3-6 months",
            "tasks": [
                "Focus on core subjects for your stream",
                "Practice previous year exam papers",
                "Join coaching or online courses if needed",
                "Apply for scholarships before deadlines",
            ],
            "resources": ["DIKSHA Platform", "SWAYAM Courses", "NCERT eBooks"],
        },
        {
            "phase": 3,
            "title": "Entrance Exam Preparation",
            "duration": "6-12 months",
            "tasks": [
                "Register for relevant entrance exams",
                "Create a daily study timetable",
                "Take mock tests regularly",
                "Stay updated on application deadlines",
            ],
            "resources": ["NTA Official Website", "Exam-specific preparation guides"],
        },
        {
            "phase": 4,
            "title": "College Application & Financial Planning",
            "duration": "2-3 months",
            "tasks": [
                "Apply to multiple colleges based on cutoffs",
                "Apply for government education loans (Vidya Lakshmi)",
                "Complete scholarship applications",
                "Prepare for college interviews/counseling",
            ],
            "resources": ["Vidya Lakshmi Portal", "State counseling portals"],
        },
    ],
    "key_tips": [
        "Apply for every scholarship you're eligible for — they add up!",
        "Never miss a deadline — set calendar reminders for all applications",
        "Join student communities to share resources and stay motivated",
    ],
}


async def generate_roadmap(profile: StudentProfile, language: str = 'en') -> Dict[str, Any]:
    """Generate a personalized roadmap based on student profile."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        return _customize_fallback_roadmap(profile, ROADMAP_FALLBACK)

    lang_names = {
        'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
        'bn': 'Bengali', 'mr': 'Marathi', 'kn': 'Kannada', 'pa': 'Punjabi'
    }
    lang_name = lang_names.get(language, 'English')

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        prompt = f"""
You are EduBridge AI, an expert educational counselor for Indian students from rural and underserved communities.

Student Profile:
- Current Class: {profile.current_class}
- Stream: {profile.stream}
- State: {profile.state}
- Category: {profile.category}
- Family Income: {'₹{:,.0f}/year'.format(profile.family_income) if profile.family_income else 'Not specified'}
- Career Interests: {', '.join(profile.career_interests or ['Not specified'])}
- 12th %: {profile.percentage_12th or 'Not specified'}

IMPORTANT: Write ALL text content (titles, tasks, tips, resources) in {lang_name} language only.

Create a detailed, actionable, personalized 4-phase learning roadmap for this student.
The roadmap should help them:
1. Prepare academically for their career interests
2. Find and apply for scholarships and government schemes
3. Prepare for relevant entrance exams
4. Successfully gain admission to college

Return a JSON object with this exact structure:
{{
  "title": "Your Personalized Roadmap",
  "career_focus": "Primary career recommendation",
  "phases": [
    {{
      "phase": 1,
      "title": "Phase title",
      "duration": "Time duration",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
      "resources": ["Resource 1", "Resource 2"]
    }}
  ],
  "key_exams": ["JEE Main", "NEET", etc.],
  "key_scholarships": ["NSP", "PM YASASVI", etc.],
  "key_tips": ["Tip 1", "Tip 2", "Tip 3"]
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())

    except Exception as e:
        print(f"Roadmap generation error: {e}")
        return _customize_fallback_roadmap(profile, ROADMAP_FALLBACK)


def _customize_fallback_roadmap(profile: StudentProfile, base: Dict) -> Dict:
    """Customize the fallback roadmap with student-specific info."""
    roadmap = base.copy()
    career = profile.career_interests[0] if profile.career_interests else "your chosen field"
    roadmap["title"] = f"Your Personalized Roadmap to {career.title()}"
    roadmap["career_focus"] = career
    return roadmap
