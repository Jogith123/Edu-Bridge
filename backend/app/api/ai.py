from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None


class EligibilityRequest(BaseModel):
    force_refresh: bool = False


@router.post("/eligibility")
async def run_eligibility(
    data: EligibilityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger the AI eligibility engine for the current student."""
    from app.ai.eligibility_engine import run_eligibility_engine

    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Please complete onboarding first.")

    recommendations = await run_eligibility_engine(
        current_user.id, profile, db, force_refresh=data.force_refresh
    )
    return {"recommendations": recommendations, "count": len(recommendations)}


@router.post("/chat")
async def ai_chat(
    request: Request,
    data: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI assistant chat for student queries."""
    from app.ai.chat_assistant import get_ai_response

    language = request.headers.get("X-Language", "en")

    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    response = await get_ai_response(data.message, profile, data.context, language=language)
    return {"response": response}


@router.post("/vapi-webhook")
async def vapi_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Vapi AI call webhooks to update student profiles."""
    from app.ai.vapi_service import handle_vapi_webhook

    payload = await request.json()
    result = await handle_vapi_webhook(payload, db)
    return result
