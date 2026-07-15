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
        return _customize_fallback_roadmap(profile, language)

    lang_names = {
        'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
        'bn': 'Bengali', 'mr': 'Marathi', 'kn': 'Kannada', 'pa': 'Punjabi'
    }
    lang_name = lang_names.get(language, 'English')

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

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
        return _customize_fallback_roadmap(profile, language)


def _customize_fallback_roadmap(profile: StudentProfile, language: str = 'en') -> Dict:
    """Customize the fallback roadmap with student-specific info and target language."""
    career = profile.career_interests[0] if profile.career_interests else "your chosen field"

    if language == 'hi':
        return {
            "title": f"{career.title()} के लिए आपका व्यक्तिगत रोडमैप",
            "career_focus": career,
            "phases": [
                {
                    "phase": 1,
                    "title": "बुनियाद और स्व-मूल्यांकन",
                    "duration": "1-2 महीने",
                    "tasks": [
                        "अपनी ताकत और सुधार के क्षेत्रों की पहचान करें",
                        "अपनी रुचियों के अनुरूप करियर विकल्पों पर शोध करें",
                        "NSP पोर्टल पर छात्रवृत्ति के अवसरों का पता लगाएं",
                        "किसी मेंटर या करियर काउंसलर से जुड़ें"
                    ],
                    "resources": ["राष्ट्रीय करियर सेवा पोर्टल", "NSP छात्रवृत्ति पोर्टल"]
                },
                {
                    "phase": 2,
                    "title": "शैक्षणिक तैयारी",
                    "duration": "3-6 महीने",
                    "tasks": [
                        "अपने स्ट्रीम के मुख्य विषयों पर ध्यान केंद्रित करें",
                        "पिछले वर्ष के परीक्षा पत्रों का अभ्यास करें",
                        "यदि आवश्यक हो तो कोचिंग या ऑनलाइन पाठ्यक्रमों में शामिल हों",
                        "समय सीमा से पहले छात्रवृत्ति के लिए आवेदन करें"
                    ],
                    "resources": ["दीक्षा प्लेटफॉर्म", "स्वयं (SWAYAM) पाठ्यक्रम", "NCERT ई-बुक्स"]
                },
                {
                    "phase": 3,
                    "title": "प्रवेश परीक्षा की तैयारी",
                    "duration": "6-12 महीने",
                    "tasks": [
                        "प्रासंगिक प्रवेश परीक्षाओं के लिए पंजीकरण करें",
                        "एक दैनिक अध्ययन समय सारणी बनाएं",
                        "नियमित रूप से मॉक टेस्ट लें",
                        "आवेदन की समय सीमा पर अपडेट रहें"
                    ],
                    "resources": ["NTA आधिकारिक वेबसाइट", "परीक्षा-विशिष्ट तैयारी गाइड"]
                },
                {
                    "phase": 4,
                    "title": "कॉलेज आवेदन और वित्तीय योजना",
                    "duration": "2-3 महीने",
                    "tasks": [
                        "कटऑफ के आधार पर कई कॉलेजों में आवेदन करें",
                        "सरकारी शिक्षा ऋण (विद्या लक्ष्मी) के लिए आवेदन करें",
                        "छात्रवृत्ति आवेदन पूरे करें",
                        "कॉलेज साक्षात्कार/परामर्श की तैयारी करें"
                    ],
                    "resources": ["विद्या लक्ष्मी पोर्टल", "राज्य परामर्श पोर्टल"]
                }
            ],
            "key_tips": [
                "प्रत्येक छात्रवृत्ति के लिए आवेदन करें जिसके लिए आप पात्र हैं!",
                "समय सीमा कभी न चूकें — सभी आवेदनों के लिए रिमाइंडर सेट करें",
                "संसाधनों को साझा करने और प्रेरित रहने के लिए छात्र समुदायों में शामिल हों"
            ]
        }

    elif language == 'te':
        return {
            "title": f"{career.title()} కోసం మీ వ్యక్తిగతీకరించిన రోడ్‌మ్యాప్",
            "career_focus": career,
            "phases": [
                {
                    "phase": 1,
                    "title": "పునాది & స్వీయ-అంచనా",
                    "duration": "1-2 నెలలు",
                    "tasks": [
                        "మీ బలాలు మరియు బలహీనతలను గుర్తించండి",
                        "మీ ఆసక్తులకు సరిపోయే కెరీర్ ఎంపికలపై పరిశోధన చేయండి",
                        "NSP పోర్టల్‌లో స్కాలర్‌షిప్ అవకాశాలను అన్వేషించండి",
                        "ఒక మెంటర్ లేదా కెరీర్ కౌన్సిలర్‌తో కనెక్ట్ అవ్వండి"
                    ],
                    "resources": ["నేషనల్ కెరీర్ సర్వీస్ పోర్టల్", "NSP స్కాలర్‌షిప్ పోర్టల్"]
                },
                {
                    "phase": 2,
                    "title": "విద్యాపరమైన సన్నాహాలు",
                    "duration": "3-6 నెలలు",
                    "tasks": [
                        "మీ స్ట్రీమ్ యొక్క ప్రధాన సబ్జెక్టులపై దృష్టి పెట్టండి",
                        "మునుపటి సంవత్సరం పరీక్షా పత్రాలను సాధన చేయండి",
                        "ఆన్‌లైన్ కోర్సులు లేదా కోచింగ్‌లో చేరండి",
                        "గడువు ముగిసేలోగా స్కాలర్‌షిప్‌ల కోసం దరఖాस्तु చేయండి"
                    ],
                    "resources": ["దీక్షా వేదిక", "స్వయం కోర్సులు", "NCERT ఇ-బుక్స్"]
                },
                {
                    "phase": 3,
                    "title": "ప్రవేశ పరీక్షల సన్నాహాలు",
                    "duration": "6-12 నెలలు",
                    "tasks": [
                        "సంబంధిత ప్రవేశ పరీక్షల కోసం నమోదు చేసుకోండి",
                        "రోజువారీ అధ్యయన ప్రణాళికను తయారు చేసుకోండి",
                        "క్రమం తప్పకుండా మాక్ టెస్టులు రాయండి",
                        "దరఖాस्तु గడువుల గురించి ఎప్పటికప్పుడు తెలుసుకోండి"
                    ],
                    "resources": ["NTA అధికారిక వెబ్‌సైట్", "పరీక్షల సన్నాహక గైడ్‌లు"]
                },
                {
                    "phase": 4,
                    "title": "కళాశాల దరఖాస్తు & ఆర్థిక ప్రణాళిక",
                    "duration": "2-3 నెలలు",
                    "tasks": [
                        "కట్ఆఫ్స్ ఆధారంగా కళాశాలలకు దరఖాस्तु చేసుకోండి",
                        "ప్రభుత్వ విద్యా రుణాల (విద్యా లక్ష్మి) కోసం దరఖాस्तु చేసుకోండి",
                        "స్కాలర్‌షిప్ దరఖాస్తులను పూర్తి చేయండి",
                        "కళాశాల ఇంటర్వ్యూలు/కౌన్సెలింగ్ కోసం సిద్ధం కండి"
                    ],
                    "resources": ["విద్యా లక్ష్మి పోర్టల్", "రాష్ట్ర కౌన్సెలింగ్ పోర్టల్"]
                }
            ],
            "key_tips": [
                "మీరు అర్హులైన ప్రతి స్కాలర్‌షిప్‌కు దరఖాస్తు చేసుకోండి!",
                "గడువు తేదీని ఎప్పుడూ మర్చిపోవద్దు — క్యాలెండర్ రిమైండర్‌లను సెట్ చేసుకోండి",
                "వనరులను పంచుకోవడానికి మరియు ప్రేరణ పొందేందుకు విద్యార్థి బృందాలలో చేరండి"
            ]
        }

    # Default to English
    return {
        "title": f"Your Personalized Roadmap to {career.title()}",
        "career_focus": career,
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
