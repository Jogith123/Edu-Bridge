from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.campaign import Campaign, Lead
from app.models.recommendation import Recommendation
from app.core.deps import get_db, get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])


class CampaignCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    target_criteria: Dict[str, Any] = {}
    call_script: Optional[str] = None


@router.get("/students")
async def list_students(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state: Optional[str] = None,
    category: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all students with optional filters."""
    users_query = select(User).where(User.role == "student")
    users_result = await db.execute(users_query)
    users = users_result.scalars().all()

    profiles_query = select(StudentProfile)
    profiles_result = await db.execute(profiles_query)
    profiles = {p.user_id: p for p in profiles_result.scalars().all()}

    result = []
    for user in users:
        profile = profiles.get(user.id)
        if state and profile and profile.state != state:
            continue
        if category and profile and profile.category != category:
            continue
        result.append({
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "profile_completed": user.profile_completed,
            "created_at": user.created_at,
            "state": profile.state if profile else None,
            "category": profile.category if profile else None,
            "current_class": profile.current_class if profile else None,
        })

    total = len(result)
    start = (page - 1) * limit
    return {
        "students": result[start : start + limit],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/students/{student_id}")
async def get_student(
    student_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        s_id = int(student_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid student ID")

    user_query = select(User).where(User.id == s_id)
    user_res = await db.execute(user_query)
    user = user_res.scalar_one_or_none()

    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    profile_query = select(StudentProfile).where(StudentProfile.user_id == s_id)
    profile_res = await db.execute(profile_query)
    profile = profile_res.scalar_one_or_none()

    recs_query = select(Recommendation).where(Recommendation.student_id == s_id)
    recs_res = await db.execute(recs_query)
    recs = recs_res.scalars().all()

    profile_dict = None
    if profile:
        profile_dict = {c.name: getattr(profile, c.name) for c in profile.__table__.columns}

    return {
        "user": {"id": str(user.id), "name": user.name, "email": user.email, "phone": user.phone, "created_at": user.created_at},
        "profile": profile_dict,
        "recommendations_count": len(recs),
    }


@router.post("/campaigns")
async def create_campaign(
    data: CampaignCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    campaign = Campaign(
        admin_id=current_admin.id,
        name=data.name,
        description=data.description,
        target_criteria=data.target_criteria,
        call_script=data.call_script,
    )
    db.add(campaign)
    await db.flush()  # Assign ID to campaign

    target_state = data.target_criteria.get("state") if data.target_criteria else None

    # Fetch matching students
    if not target_state or target_state == "All States":
        student_query = select(User).where(User.role == "student", User.phone != None, User.phone != "")
    else:
        student_query = (
            select(User)
            .join(StudentProfile, StudentProfile.user_id == User.id)
            .where(User.role == "student", User.phone != None, User.phone != "", StudentProfile.state == target_state)
        )

    students_result = await db.execute(student_query)
    students = students_result.scalars().all()

    # Create Lead objects
    leads_count = 0
    for student in students:
        lead = Lead(
            campaign_id=campaign.id,
            student_id=student.id,
            phone=student.phone,
            name=student.name,
            status="pending",
        )
        db.add(lead)
        leads_count += 1

    campaign.total_students = leads_count
    await db.commit()
    await db.refresh(campaign)
    return {"message": f"Campaign created with {leads_count} target leads.", "campaign_id": str(campaign.id)}


@router.get("/campaigns")
async def list_campaigns(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Campaign).where(Campaign.admin_id == current_admin.id)
    result = await db.execute(query)
    campaigns = result.scalars().all()

    return {
        "campaigns": [
            {
                "id": str(c.id),
                "name": c.name,
                "status": c.status,
                "total_students": c.total_students,
                "calls_made": c.calls_made,
                "calls_answered": c.calls_answered,
                "profiles_updated": c.profiles_updated,
                "created_at": c.created_at,
            }
            for c in campaigns
        ]
    }


@router.post("/campaigns/{campaign_id}/launch")
async def launch_campaign(
    campaign_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Launch Vapi AI calling campaign."""
    from app.ai.vapi_service import launch_vapi_campaign

    try:
        c_id = int(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = await db.get(Campaign, c_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.admin_id != current_admin.id:
        raise HTTPException(status_code=403, detail="Not your campaign")

    result = await launch_vapi_campaign(campaign, db)
    campaign.status = "active"
    campaign.started_at = datetime.utcnow()
    await db.commit()
    return result


@router.post("/campaigns/{campaign_id}/reset")
async def reset_campaign(
    campaign_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Reset Vapi AI outreach campaign leads and stats to draft status."""
    try:
        c_id = int(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = await db.get(Campaign, c_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.admin_id != current_admin.id:
        raise HTTPException(status_code=403, detail="Not your campaign")

    # Reset campaign stats
    campaign.status = "draft"
    campaign.calls_made = 0
    campaign.calls_answered = 0
    campaign.profiles_updated = 0
    campaign.started_at = None
    campaign.completed_at = None

    # Reset leads status to pending
    from app.models.campaign import Lead
    query = select(Lead).where(Lead.campaign_id == campaign.id)
    result = await db.execute(query)
    leads = result.scalars().all()
    for lead in leads:
        lead.status = "pending"
        lead.vapi_call_id = None
        lead.call_duration = None
        lead.call_transcript = None
        lead.extracted_info = {}
        db.add(lead)

    db.add(campaign)
    await db.commit()
    return {"message": "Campaign reset successfully. All leads are now pending."}


@router.get("/analytics")
async def get_analytics(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get platform-wide analytics for admin dashboard."""
    students_count = await db.scalar(select(func.count(User.id)).where(User.role == "student"))
    profiles_completed = await db.scalar(
        select(func.count(User.id)).where(User.role == "student", User.profile_completed == True)
    )
    campaigns_count = await db.scalar(select(func.count(Campaign.id)).where(Campaign.admin_id == current_admin.id))
    leads_count = await db.scalar(select(func.count(Lead.id)))

    profiles_query = select(StudentProfile)
    profiles_res = await db.execute(profiles_query)
    all_profiles = profiles_res.scalars().all()

    state_distribution: Dict[str, int] = {}
    category_distribution: Dict[str, int] = {}
    for p in all_profiles:
        if p.state:
            state_distribution[p.state] = state_distribution.get(p.state, 0) + 1
        if p.category:
            category_distribution[p.category] = category_distribution.get(p.category, 0) + 1

    return {
        "overview": {
            "total_students": students_count or 0,
            "profiles_completed": profiles_completed or 0,
            "completion_rate": round((profiles_completed or 0) / max(students_count or 1, 1) * 100, 1),
            "total_campaigns": campaigns_count or 0,
            "total_leads": leads_count or 0,
        },
        "state_distribution": state_distribution,
        "category_distribution": category_distribution,
    }


@router.get("/leads")
async def list_leads(
    campaign_id: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if campaign_id:
        try:
            c_id = int(campaign_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        query = select(Lead).where(Lead.campaign_id == c_id)
    else:
        campaign_query = select(Campaign.id).where(Campaign.admin_id == current_admin.id)
        camp_result = await db.execute(campaign_query)
        campaign_ids = camp_result.scalars().all()
        query = select(Lead).where(Lead.campaign_id.in_(campaign_ids))

    result = await db.execute(query)
    leads = result.scalars().all()

    return {
        "leads": [
            {
                "id": str(lead.id),
                "campaign_id": str(lead.campaign_id),
                "name": lead.name,
                "phone": lead.phone,
                "status": lead.status,
                "call_duration": lead.call_duration,
                "created_at": lead.created_at,
            }
            for lead in leads
        ]
    }
