"""
AI Chat Assistant for student queries about scholarships, careers, and education.
"""
from typing import Optional
from app.core.config import settings
from app.models.student_profile import StudentProfile

SYSTEM_PROMPT = """You are EduBridge AI, a friendly and knowledgeable educational counselor helping Indian students from rural and underserved communities. 

You help students with:
- Finding scholarships and government schemes they're eligible for
- Career guidance and subject selection
- College admission information
- Entrance exam preparation advice
- Document requirements for applications

Always be:
- Encouraging and supportive
- Specific about Indian scholarships, portals (NSP, Vidya Lakshmi, PM YASASVI)
- Clear about deadlines and steps
- Simple in language (avoid jargon)

If you don't know something specific, direct them to official portals like scholarships.gov.in or nsp.gov.in.
"""


async def get_ai_response(
    message: str,
    profile: Optional[StudentProfile],
    context: Optional[str] = None,
) -> str:
    """Get AI response for student query."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        return _get_fallback_response(message)

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash-exp", system_instruction=SYSTEM_PROMPT)

        student_context = ""
        if profile:
            student_context = f"""
Student Context:
- State: {profile.state}
- Category: {profile.category}
- Class: {profile.current_class}, Stream: {profile.stream}
- Career Interests: {', '.join(profile.career_interests or [])}
- Family Income: ₹{profile.family_income:,.0f}/year if {profile.family_income} else 'Not provided'
"""

        full_message = f"{student_context}\n\nStudent Question: {message}"
        response = model.generate_content(full_message)
        return response.text

    except Exception as e:
        print(f"Chat error: {e}")
        return _get_fallback_response(message)


def _get_fallback_response(message: str) -> str:
    """Simple keyword-based fallback response."""
    message_lower = message.lower()

    if any(w in message_lower for w in ["scholarship", "scholarship", "fund", "money", "financial"]):
        return """Here are some key scholarships you should explore:

1. **NSP (National Scholarship Portal)** - scholarships.gov.in
   - Post-Matric Scholarship for SC/ST/OBC students
   - Apply every year by October-November

2. **PM YASASVI Scheme** - OBC/EWS students in class 9 and 11
   - Up to ₹75,000/year for day scholars

3. **INSPIRE Scholarship** - For science stream students in top 1%
   - ₹80,000/year + ₹20,000 mentorship

4. **Vidyasaarathi** - Private sector scholarships at vidyasaarathi.co.in

Please complete your profile on EduBridge AI for personalized matches! 🎓"""

    elif any(w in message_lower for w in ["career", "job", "work", "future", "interest"]):
        return """Great question! Here's a quick career guidance overview:

**Top Career Paths in India:**
- 🔬 **Engineering** → JEE Main/Advanced → IITs, NITs
- 🏥 **Medicine** → NEET UG → AIIMS, medical colleges
- ⚖️ **Law** → CLAT → NLUs
- 📊 **Commerce/CA** → CA Foundation → ICAI
- 🏛️ **Government Services** → UPSC/State PSC
- 💻 **Technology** → B.Tech/BCA → IT sector

Tell me your interests and I'll give you a more personalized recommendation!"""

    elif any(w in message_lower for w in ["college", "admission", "university", "institute"]):
        return """For college admissions in India:

**Key entrance exams:**
- JEE Main & Advanced (Engineering)
- NEET (Medical)
- CUET (Central Universities)
- CLAT (Law)

**Important portals:**
- NTA official website for JEE/NEET
- JOSAA for IIT/NIT seat allotment
- CSAB for NIT/IIIT counseling

I'd recommend completing your EduBridge AI profile to get personalized college recommendations based on your marks and category! 🏛️"""

    else:
        return """I'm EduBridge AI, your educational guide! I can help you with:

- 🎓 **Scholarships** - Find scholarships you're eligible for
- 🏛️ **Colleges** - Discover colleges matching your profile
- 💼 **Career Guidance** - Explore career options
- 📋 **Government Schemes** - Access educational benefits
- 📚 **Study Roadmap** - Create your personalized plan

Please complete your profile first, and I'll give you personalized recommendations! What would you like to know more about?"""
