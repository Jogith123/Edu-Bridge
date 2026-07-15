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


LANGUAGE_NAMES = {
    'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
    'bn': 'Bengali', 'mr': 'Marathi', 'kn': 'Kannada', 'pa': 'Punjabi'
}

async def get_ai_response(
    message: str,
    profile: Optional[StudentProfile],
    context: Optional[str] = None,
    language: str = 'en',
) -> str:
    """Get AI response for student query."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        return _get_fallback_response(message)

    lang_name = LANGUAGE_NAMES.get(language, 'English')
    lang_instruction = f"\n\nIMPORTANT: Always respond in {lang_name} language only. Do not use English unless the user writes in English."

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=SYSTEM_PROMPT + lang_instruction)

        student_context = ""
        if profile:
            income_str = '₹{:,.0f}/year'.format(profile.family_income) if profile.family_income else 'Not provided'
            student_context = f"""
Student Context:
- State: {profile.state}
- Category: {profile.category}
- Class: {profile.current_class}, Stream: {profile.stream}
- Career Interests: {', '.join(profile.career_interests or [])}
- Family Income: {income_str}
"""

        full_message = f"{student_context}\n\nStudent Question: {message}"
        response = model.generate_content(full_message)
        return response.text

    except Exception as e:
        print(f"Chat error: {e}")
        return _get_fallback_response(message, language)


def _get_fallback_response(message: str, language: str = 'en') -> str:
    """Simple keyword-based fallback response."""
    message_lower = message.lower()

    if language == 'hi':
        if any(w in message_lower for w in ["scholarship", "छात्रवृत्ति", "पैसे", "मदद", "वित्तीय"]):
            return """यहाँ कुछ प्रमुख छात्रवृत्तियाँ हैं जिन्हें आपको खोजना चाहिए:

1. **NSP (राष्ट्रीय छात्रवृत्ति पोर्टल)** - scholarships.gov.in
   - SC/ST/OBC छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति
   - हर साल अक्टूबर-नवंबर तक आवेदन करें

2. **PM YASASVI योजना** - कक्षा 9 और 11 में OBC/EWS छात्र
   - प्रति वर्ष ₹75,000 तक की सहायता

3. **INSPIRE छात्रवृत्ति** - शीर्ष 1% में आने वाले विज्ञान वर्ग के छात्रों के लिए
   - ₹80,000/वर्ष + ₹20,000 मेंटरशिप

4. **विद्यासारथी** - निजी क्षेत्र की छात्रवृत्तियाँ vidyasaarathi.co.in पर

कृपया व्यक्तिगत मिलान के लिए EduBridge AI पर अपनी प्रोफ़ाइल पूरी करें! 🎓"""

        elif any(w in message_lower for w in ["career", "करियर", "नौकरी", "काम", "भविष्य"]):
            return """अच्छा सवाल है! यहाँ एक त्वरित करियर मार्गदर्शन अवलोकन है:

**भारत में शीर्ष करियर पथ:**
- 🔬 **इंजीनियरिंग** → JEE Main/Advanced → IITs, NITs
- 🏥 **चिकित्सा (NEET)** → AIIMS, मेडिकल कॉलेज
- ⚖️ **कानून (CLAT)** → NLUs
- 📊 **वाणिज्य/CA** → CA फाउंडेशन → ICAI
- 🏛️ **सरकारी सेवाएं** → UPSC/State PSC

मुझे अपनी रुचियां बताएं और मैं आपको अधिक व्यक्तिगत सिफारिश दूंगा!"""

        elif any(w in message_lower for w in ["college", "कॉलेज", "प्रवेश", "विश्वविद्यालय"]):
            return """भारत में कॉलेज प्रवेश के लिए:

**प्रमुख प्रवेश परीक्षाएं:**
- JEE Main और Advanced (इंजीनियरिंग)
- NEET (मेडिकल)
- CUET (केंद्रीय विश्वविद्यालय)
- CLAT (कानून)

मैं आपके अंकों और श्रेणी के आधार पर व्यक्तिगत कॉलेज सिफारिशें प्राप्त करने के लिए अपनी EduBridge AI प्रोफ़ाइल पूरी करने की सलाह दूंगा! 🏛️"""

        else:
            return """मैं EduBridge AI हूँ, आपका शैक्षिक मार्गदर्शक! मैं आपकी मदद कर सकता हूँ:

- 🎓 **छात्रवृत्ति** - आपके लिए उपयुक्त छात्रवृत्तियाँ खोजें
- 🏛️ **कॉलेज** - आपकी प्रोफ़ाइल से मेल खाने वाले कॉलेज खोजें
- 💼 **करियर मार्गदर्शन** - करियर विकल्पों का पता लगाएं
- 📋 **सरकारी योजनाएं** - शैक्षिक लाभों का लाभ उठाएं
- 📚 **अध्ययन रोडमैप** - अपनी व्यक्तिगत योजना बनाएं

कृपया पहले अपनी प्रोफ़ाइल पूरी करें, और मैं आपको व्यक्तिगत सिफारिशें दूंगा! आप किसके बारे में अधिक जानना चाहते हैं?"""

    elif language == 'te':
        if any(w in message_lower for w in ["scholarship", "స్కాలర్‌షిప్", "డబ్బు", "సహాయం", "ఆర్థిక"]):
            return """మీరు అన్వేషించవలసిన కొన్ని ముఖ్యమైన స్కాలర్‌షిప్‌లు ఇక్కడ ఉన్నాయి:

1. **NSP (నేషనల్ స్కాలర్‌షిప్ పోర్టల్)** - scholarships.gov.in
   - SC/ST/OBC విద్యార్థుల కోసం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్
   - ప్రతి సంవత్సరం అక్టోబర్-నవంబర్ నాటికి దరఖాస్తు చేసుకోండి

2. **PM YASASVI పథకం** - 9 మరియు 11 తరగతులలోని OBC/EWS విద్యార్థుల కోసం
   - సంవత్సరానికి ₹75,000 వరకు సహాయం

3. **INSPIRE స్కాలర్‌షిప్** - టాప్ 1% లో ఉన్న సైన్స్ విద్యార్థుల కోసం
   - ₹80,000/సంవత్సరానికి + ₹20,000 మెంటార్‌షిప్

4. **విద్యాసారథి** - vidyasaarathi.co.in లో ప్రైవేట్ స్కాలర్‌షిప్‌లు

దయచేసి వ్యక్తిగతీకరించిన సరిపోలికల కోసం EduBridge AI లో మీ ప్రొఫైల్‌ను పూర్తి చేయండి! 🎓"""

        elif any(w in message_lower for w in ["career", "కెరీర్", "ఉద్యోగం", "పని", "భవిష్యత్తు"]):
            return """మంచి ప్రశ్న! ఇక్కడ శీఘ్ర కెరీర్ మార్గదర్శకత్వం అవలోకనం ఉంది:

**భారతదేశంలో అగ్ర కెరీర్ మార్గాలు:**
- 🔬 **ఇంజనీరింగ్** → JEE Main/Advanced → IITs, NITs
- 🏥 **వైద్యం (NEET)** → AIIMS, మెడికల్ కాలేజీలు
- ⚖️ **చట్టం (CLAT)** → NLUs
- 📊 **కామర్స్/CA** → CA ఫౌండేషన్ → ICAI
- 🏛️ **ప్రభుత్వ సేవలు** → UPSC/State PSC

మీ ఆసక్తులను నాకు చెప్పండి మరియు నేను మీకు మరింత వ్యక్తిగతీకరించిన సిఫార్సును అందిస్తాను!"""

        elif any(w in message_lower for w in ["college", "కళాశాల", "ప్రవేశం", "యూనివర్సిటీ"]):
            return """భారతదేశంలో కళాశాల ప్రవేశాల కోసం:

**ముఖ్యమైన ప్రవేశ పరీక్షలు:**
- JEE Main & Advanced (ఇంజనీరింగ్)
- NEET (మెడికల్)
- CUET (సెంట్రల్ యూనివర్సిటీలు)
- CLAT (లా)

మీ మార్కులు మరియు కేటగిరీ ఆధారంగా వ్యక్తిగతీకరించిన కళాశాల సిఫార్సులను పొందడానికి మీ EduBridge AI ప్రొఫైల్‌ను పూర్తి చేయాల్సిందిగా నేను సిఫార్సు చేస్తున్నాను! 🏛️"""

        else:
            return """నేను EduBridge AI, మీ విద్యా మార్గదర్శిని! నేను మీకు సహాయం చేయగలను:

- 🎓 **స్కాలర్‌షిప్‌లు** - మీ అర్హత గల స్కాలర్‌షిప్‌లను కనుగొనండి
- 🏛️ **కళాశాలలు** - మీ ప్రొఫైల్‌కు సరిపోయే కళాశాలలను కనుగొనండి
- 💼 **కెరీర్ మార్గదర్శకత్వం** - కెరీర్ ఎంపికలను అన్వేషించండి
- 📋 **ప్రభుత్వ పథకాలు** - విద్యా ప్రయోజనాలను పొందండి
- 📚 **అధ్యయన రోడ్‌మ్యాప్** - మీ వ్యక్తిగతీకరించిన ప్రణాళికను సృష్టించండి

దయచేసి మొదట మీ ప్రొఫైల్‌ను పూర్తి చేయండి, నేను మీకు వ్యక్తిగతీకరించిన సిఫార్సులను అందిస్తాను! మీరు దేని గురించి మరింత తెలుసుకోవాలనుకుంటున్నారు?"""

    # Default to English fallback
    if any(w in message_lower for w in ["scholarship", "fund", "money", "financial"]):
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
