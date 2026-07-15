from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Request
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.recommendation import Recommendation
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/student", tags=["student"])


class ProfileUpdateRequest(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    category: Optional[str] = None
    religion: Optional[str] = None
    family_income: Optional[float] = None
    bpl_card: Optional[bool] = None
    current_class: Optional[str] = None
    stream: Optional[str] = None
    percentage_10th: Optional[float] = None
    percentage_12th: Optional[float] = None
    percentage_graduation: Optional[float] = None
    institution_name: Optional[str] = None
    board: Optional[str] = None
    career_interests: Optional[List[str]] = None
    preferred_states: Optional[List[str]] = None
    disability: Optional[bool] = None
    disability_type: Optional[str] = None
    parent_occupation: Optional[str] = None
    languages: Optional[List[str]] = None


@router.post("/profile")
async def create_or_update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    profile.updated_at = datetime.utcnow()
    await db.commit()

    # Mark profile as completed if key fields are filled
    required = ["state", "category", "family_income", "current_class"]
    if all(getattr(profile, f) for f in required):
        current_user.profile_completed = True
        db.add(current_user)
        await db.commit()

    # Convert model to dict for response
    profile_dict = {c.name: getattr(profile, c.name) for c in profile.__table__.columns}
    return {"message": "Profile updated successfully", "profile": profile_dict}


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        return {"profile": None}

    profile_dict = {c.name: getattr(profile, c.name) for c in profile.__table__.columns}
    return {"profile": profile_dict}


@router.post("/parse-document")
async def parse_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Use Gemini Vision to extract profile data from an uploaded document image."""
    from app.ai.document_scanner import scan_document

    language = request.headers.get("X-Language", "en")

    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload JPG, PNG, or PDF."
        )

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Please upload an image smaller than 10MB."
        )

    mime_type = file.content_type
    # For PDF, treat as image/jpeg for Gemini (it handles PDF inline_data)
    if mime_type == "application/pdf":
        mime_type = "application/pdf"

    result = await scan_document(image_bytes, mime_type, language, filename=file.filename, student_name=current_user.name)
    return result


@router.get("/recommendations")
async def get_recommendations(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-generated recommendations for the student."""
    from app.ai.eligibility_engine import run_eligibility_engine

    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile first",
        )

    recommendations = await run_eligibility_engine(current_user.id, profile, db)
    return {"recommendations": recommendations}


@router.get("/roadmap")
async def get_roadmap(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized learning roadmap."""
    from app.ai.roadmap_generator import generate_roadmap

    language = request.headers.get("X-Language", "en")

    query = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile first",
        )

    roadmap = await generate_roadmap(profile, language=language)
    return {"roadmap": roadmap}


@router.get("/timeline")
async def get_timeline(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get action timeline with deadlines."""
    query = select(Recommendation).where(Recommendation.student_id == current_user.id)
    result = await db.execute(query)
    recs = result.scalars().all()

    timeline = []
    for rec in recs:
        if rec.deadline:
            timeline.append({
                "title": rec.item_name,
                "type": rec.type,
                "deadline": rec.deadline,
                "action_items": rec.action_items,
                "match_score": rec.match_score,
            })

    timeline.sort(key=lambda x: x.get("deadline", ""), reverse=False)
    return {"timeline": timeline}


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get summary stats for the student dashboard."""
    query = select(Recommendation).where(Recommendation.student_id == current_user.id)
    result = await db.execute(query)
    recs = result.scalars().all()

    stats = {
        "total_opportunities": len(recs),
        "scholarships": len([r for r in recs if r.type == "scholarship"]),
        "schemes": len([r for r in recs if r.type == "scheme"]),
        "colleges": len([r for r in recs if r.type == "college"]),
        "careers": len([r for r in recs if r.type == "career"]),
        "avg_match_score": round(
            sum(r.match_score for r in recs) / len(recs) * 100 if recs else 0, 1
        ),
    }
    return stats
