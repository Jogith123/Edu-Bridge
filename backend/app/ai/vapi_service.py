"""
Vapi AI integration for voice outreach campaigns.
"""
import httpx
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.campaign import Campaign, Lead
from app.models.student_profile import StudentProfile


async def launch_vapi_campaign(campaign: Campaign, db: AsyncSession) -> Dict[str, Any]:
    """Launch Vapi AI calling campaign for a list of leads."""
    if not settings.VAPI_API_KEY or settings.VAPI_API_KEY == "your_vapi_api_key_here":
        return {
            "status": "simulated",
            "message": "Vapi API key not configured. Campaign launched in simulation mode.",
            "calls_queued": campaign.total_students,
        }

    try:
        query = select(Lead).where(Lead.campaign_id == campaign.id, Lead.status == "pending")
        result = await db.execute(query)
        leads = result.scalars().all()

        calls_made = 0
        async with httpx.AsyncClient(timeout=30.0) as client:
            for lead in leads:
                phone_num = lead.phone
                # Normalize phone number to E.164 format (e.g. +91XXXXXXXXXX)
                cleaned_phone = "".join(c for c in phone_num if c.isdigit() or c == "+")
                if not cleaned_phone.startswith("+"):
                    if len(cleaned_phone) == 10:
                        cleaned_phone = f"+91{cleaned_phone}"
                    elif len(cleaned_phone) == 12 and cleaned_phone.startswith("91"):
                        cleaned_phone = f"+{cleaned_phone}"

                # Dynamic prompt for the student calling agent using the campaign script
                dynamic_prompt = (
                    f"{campaign.call_script}\n\n"
                    f"You are calling {lead.name or 'Student'} on behalf of EduBridge AI. "
                    f"Be extremely friendly, encouraging, and clear. "
                    f"Help guide the student to discover matched scholarships and career paths by verifying their basic academic and family details."
                )

                call_data = {
                    "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,
                    "customer": {
                        "number": cleaned_phone,
                        "name": lead.name or "Student",
                    },
                    "assistant": {
                        "firstMessage": (
                            f"Hello {lead.name or 'Student'}! This is an AI assistant calling from EduBridge AI. "
                            f"I hope you're having a good day. "
                            f"We have found some exciting new scholarship opportunities for you! "
                            f"Do you have a couple of minutes to talk about them?"
                        ),
                        "model": {
                            "provider": "groq",
                            "model": "llama3-8b-8192",
                            "systemPrompt": dynamic_prompt,
                        },
                        "voice": {
                            "provider": "deepgram",
                            "voiceId": "asteria",
                        },
                        "endCallFunctionEnabled": True,
                        "transcriber": {
                            "provider": "deepgram",
                            "model": "nova-2",
                            "language": "en-US",
                        },
                    },
                    "metadata": {
                        "lead_id": str(lead.id),
                        "campaign_id": str(campaign.id),
                    },
                }

                if settings.VAPI_WEBHOOK_URL:
                    call_data["assistant"]["serverUrl"] = settings.VAPI_WEBHOOK_URL

                response = await client.post(
                    "https://api.vapi.ai/call",
                    headers={
                        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=call_data,
                )

                if response.status_code == 201:
                    call_id = response.json().get("id")
                    lead.vapi_call_id = call_id
                    lead.status = "called"
                    db.add(lead)
                    calls_made += 1
                else:
                    print(f"Vapi API Call Failed for lead {lead.id} ({cleaned_phone}): Status {response.status_code}, Response: {response.text}")

        campaign.calls_made = calls_made
        db.add(campaign)
        await db.commit()

        return {
            "status": "launched",
            "calls_made": calls_made,
            "total_leads": len(leads),
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


async def handle_vapi_webhook(payload: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    """
    Handle Vapi AI webhook events.
    When a call ends, extract student info from transcript and update profile.
    """
    event_type = payload.get("message", {}).get("type")

    if event_type == "end-of-call-report":
        call_data = payload.get("message", {})
        transcript = call_data.get("transcript", "")
        metadata = call_data.get("call", {}).get("metadata", {})
        lead_id = metadata.get("lead_id")
        call_duration = call_data.get("durationSeconds", 0)

        if lead_id:
            try:
                l_id = int(lead_id)
            except ValueError:
                return {"status": "error", "message": "Invalid lead ID in metadata"}

            lead = await db.get(Lead, l_id)
            if lead:
                lead.call_transcript = transcript
                lead.call_duration = call_duration
                lead.status = "answered"
                lead.updated_at = datetime.utcnow()

                # Extract info from transcript using AI
                extracted = await _extract_info_from_transcript(transcript)
                lead.extracted_info = extracted

                # Update student profile if student_id exists
                if lead.student_id and extracted:
                    await _update_student_profile(lead.student_id, extracted, db)

                db.add(lead)
                await db.commit()

                # Update campaign stats
                campaign = await db.get(Campaign, lead.campaign_id)
                if campaign:
                    campaign.calls_answered += 1
                    if extracted:
                        campaign.profiles_updated += 1
                    db.add(campaign)
                    await db.commit()

        return {"status": "processed"}

    return {"status": "ignored", "event_type": event_type}


async def _extract_info_from_transcript(transcript: str) -> Dict[str, Any]:
    """Use Gemini to extract student information from call transcript."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        return {}

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        prompt = f"""
Extract student information from this call transcript. Return ONLY valid JSON with any fields that were mentioned.

Transcript:
{transcript}

Extract these fields if mentioned:
- name (string)
- state (string)
- category (sc/st/obc/ews/general)
- family_income (number in INR per year)
- current_class (10th/12th/graduation)
- stream (Science/Commerce/Arts)
- career_interests (list of strings)
- percentage_10th (number)
- percentage_12th (number)

Return JSON: {{"field": "value"}} or {{}} if nothing found.
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        import json
        return json.loads(text.strip())
    except Exception:
        return {}


async def _update_student_profile(student_id: int, data: Dict[str, Any], db: AsyncSession):
    """Update student profile with extracted call data."""
    query = select(StudentProfile).where(StudentProfile.user_id == student_id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if profile:
        for key, value in data.items():
            if hasattr(profile, key) and value:
                setattr(profile, key, value)
        profile.updated_at = datetime.utcnow()
        db.add(profile)
        await db.commit()

        # Re-run eligibility engine
        from app.ai.eligibility_engine import run_eligibility_engine
        await run_eligibility_engine(student_id, profile, db, force_refresh=True)
