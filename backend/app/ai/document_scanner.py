"""
AI Document Intelligence Scanner — uses Gemini Vision to extract student profile
data from uploaded Aadhaar cards, Marksheets, or Income Certificates.
"""
import base64
import json
import re
from typing import Optional
from app.core.config import settings

LANGUAGE_NAMES = {
    'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
    'bn': 'Bengali', 'mr': 'Marathi', 'kn': 'Kannada', 'pa': 'Punjabi'
}


async def scan_document(
    image_bytes: bytes,
    mime_type: str,
    language: str = 'en'
) -> dict:
    """
    Analyse an image document using Gemini Vision and extract student profile fields.
    Returns a dict of extracted fields; empty/None values for undetected fields.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        return {"error": "no_key", "fields": {}}

    lang_name = LANGUAGE_NAMES.get(language, 'English')

    prompt = f"""You are an expert document reader for Indian educational documents.
Carefully examine this document image and extract the following information if visible.

Document types you may encounter:
- Aadhaar Card: Contains name, date of birth, gender, address (state, district, pincode)
- School/College Marksheet: Contains name, class/grade, subject marks, percentage, institution name, board
- Income Certificate: Contains family name, annual income amount
- Caste/Category Certificate: Contains category (SC/ST/OBC/General/EWS)

Extract ONLY what is clearly visible in the document. Return a JSON object with these exact fields:
{{
  "document_type": "<aadhaar|marksheet|income_certificate|category_certificate|unknown>",
  "confidence": "<high|medium|low>",
  "fields": {{
    "name": "<full name or null>",
    "dob": "<YYYY-MM-DD format or null>",
    "gender": "<male|female|other or null>",
    "state": "<Indian state name or null>",
    "district": "<district name or null>",
    "pincode": "<6-digit pincode or null>",
    "category": "<general|sc|st|obc|ews or null>",
    "family_income": "<number in rupees per year or null>",
    "current_class": "<10th|12th|graduation|post_graduation or null>",
    "percentage_10th": "<number between 0-100 or null>",
    "percentage_12th": "<number between 0-100 or null>",
    "institution_name": "<school/college name or null>",
    "board": "<CBSE|ICSE|State Board name or null>"
  }},
  "summary": "<One-sentence summary of what was found, written in {lang_name}>"
}}

IMPORTANT:
- Return ONLY valid JSON, no markdown, no extra text
- If a field is not visible or unclear, use null
- For income, convert to annual amount in rupees (e.g. if monthly is shown, multiply by 12)
- Percentage should be a float (e.g. 78.5 not "78.5%")
- For pincode, return only digits
"""

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        image_b64 = base64.b64encode(image_bytes).decode('utf-8')
        image_part = {
            "inline_data": {
                "mime_type": mime_type,
                "data": image_b64
            }
        }

        response = model.generate_content([prompt, image_part])
        raw_text = response.text.strip()

        # Strip markdown code fences if present
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)

        result = json.loads(raw_text)
        return result

    except json.JSONDecodeError:
        return {
            "error": "parse_error",
            "fields": {},
            "summary": "Could not parse AI response"
        }
    except Exception as e:
        print(f"Document scan error: {e}")
        return {
            "error": "scan_failed",
            "fields": {},
            "summary": str(e)
        }
