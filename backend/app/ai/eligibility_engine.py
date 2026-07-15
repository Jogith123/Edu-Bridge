"""
EduBridge AI – Eligibility Engine
Uses LangChain + Gemini to match student profiles with scholarships,
government schemes, colleges, and career paths.
"""
import json
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.models.government_scheme import GovernmentScheme
from app.models.college import College
from app.models.recommendation import Recommendation, CareerPath


async def run_eligibility_engine(
    student_id: int,
    profile: StudentProfile,
    db: AsyncSession,
    force_refresh: bool = False,
) -> List[Dict[str, Any]]:
    """
    Main eligibility engine. Returns a list of AI-explained recommendations.
    Steps:
    1. Rule-based pre-filtering from database
    2. AI scoring and explanation via Gemini
    3. Save recommendations to database
    4. Return sorted results
    """
    # Check for cached recommendations
    if not force_refresh:
        query = select(Recommendation).where(Recommendation.student_id == student_id)
        result = await db.execute(query)
        existing = result.scalars().all()
        if existing:
            return [
                {c.name: getattr(r, c.name) for c in r.__table__.columns}
                for r in existing
            ]

    # Step 1: Rule-based filtering
    scholarships = await _filter_scholarships(profile, db)
    schemes = await _filter_schemes(profile, db)
    colleges = await _filter_colleges(profile, db)
    careers = await _match_careers(profile, db)

    # Step 2: AI scoring and explanations
    all_recs = []

    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        all_recs = await _ai_score_and_explain(student_id, profile, scholarships, schemes, colleges, careers)
    else:
        # Fallback: use rule-based scoring without AI
        all_recs = _rule_based_recommendations(student_id, scholarships, schemes, colleges, careers)

    # Step 3: Delete old and save new recommendations
    delete_query = delete(Recommendation).where(Recommendation.student_id == student_id)
    await db.execute(delete_query)

    if all_recs:
        for rec_data in all_recs:
            rec = Recommendation(**rec_data)
            db.add(rec)
        await db.commit()

    return all_recs


async def _filter_scholarships(profile: StudentProfile, db: AsyncSession) -> List[Scholarship]:
    """Filter scholarships based on student profile using rules."""
    query = select(Scholarship).where(Scholarship.is_active == True)
    result = await db.execute(query)
    scholarships = result.scalars().all()

    filtered_scholarships = []
    for s in scholarships:
        # Category check
        if profile.category and s.eligible_categories:
            if "all" not in s.eligible_categories and profile.category not in s.eligible_categories:
                continue
        # Income check
        if s.max_income and profile.family_income and profile.family_income > s.max_income:
            continue
        # State check
        if s.eligible_states and profile.state and profile.state not in s.eligible_states:
            continue
        # Class check
        if s.eligible_classes and profile.current_class and profile.current_class not in s.eligible_classes:
            continue
        # Percentage check
        student_pct = profile.percentage_12th or profile.percentage_10th or 0
        if s.min_percentage and student_pct < s.min_percentage:
            continue
        filtered_scholarships.append(s)

    return filtered_scholarships[:15]  # Limit to top 15


async def _filter_schemes(profile: StudentProfile, db: AsyncSession) -> List[GovernmentScheme]:
    """Filter government schemes based on profile."""
    query = select(GovernmentScheme).where(GovernmentScheme.is_active == True)
    res = await db.execute(query)
    schemes = res.scalars().all()

    filtered_schemes = []
    for s in schemes:
        if s.max_income and profile.family_income and profile.family_income > s.max_income:
            continue
        if s.eligible_states and profile.state and profile.state not in s.eligible_states:
            continue
        if s.gender_specific and profile.gender and s.gender_specific != profile.gender:
            continue
        filtered_schemes.append(s)
    return filtered_schemes[:12]


async def _filter_colleges(profile: StudentProfile, db: AsyncSession) -> List[College]:
    """Filter colleges based on stream and category cutoffs."""
    query = select(College).where(College.is_active == True)
    res = await db.execute(query)
    colleges = res.scalars().all()

    filtered_colleges = []
    for c in colleges:
        if profile.stream and c.streams and profile.stream not in c.streams:
            continue
        # Cutoff check
        student_pct = profile.percentage_12th or 0
        if profile.category in ["sc", "st"]:
            cutoff = c.cutoff_sc or c.cutoff_general or 0
        elif profile.category == "obc":
            cutoff = c.cutoff_obc or c.cutoff_general or 0
        else:
            cutoff = c.cutoff_general or 0

        if cutoff and student_pct and student_pct < cutoff - 10:  # 10% grace
            continue
        filtered_colleges.append(c)
    return filtered_colleges[:10]


async def _match_careers(profile: StudentProfile, db: AsyncSession) -> List[CareerPath]:
    """Match career paths with student interests."""
    query = select(CareerPath).where(CareerPath.is_active == True)
    res = await db.execute(query)
    careers = res.scalars().all()

    if not careers:
        return []
    if profile.career_interests:
        matched = [
            c for c in careers
            if any(tag in profile.career_interests for tag in c.tags)
        ]
        return matched[:8] if matched else careers[:8]
    return careers[:8]


async def _ai_score_and_explain(
    student_id: int,
    profile: StudentProfile,
    scholarships: List,
    schemes: List,
    colleges: List,
    careers: List,
) -> List[Dict[str, Any]]:
    """Use Gemini to score and generate explanations for each opportunity."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        profile_summary = f"""
Student Profile:
- State: {profile.state}, District: {profile.district}
- Category: {profile.category}
- Family Income: {'₹{:,.0f}/year'.format(profile.family_income) if profile.family_income else 'Not specified'}
- Class: {profile.current_class}, Stream: {profile.stream}
- 10th %: {profile.percentage_10th}, 12th %: {profile.percentage_12th}
- Career Interests: {', '.join(profile.career_interests or [])}
- BPL Card: {'Yes' if profile.bpl_card else 'No'}
- Disability: {'Yes' if profile.disability else 'No'}
"""

        all_recs = []

        # Score scholarships
        for s in scholarships[:10]:
            prompt = f"""
{profile_summary}

Scholarship: {s.name}
Provider: {s.provider}
Amount: {s.amount}
Description: {s.description}
Eligible Categories: {s.eligible_categories}
Max Income: {s.max_income}

Task: Give a match score (0.0 to 1.0) and a brief, encouraging 2-sentence explanation in simple English for why this student qualifies or partially qualifies for this scholarship. Be specific about their category/income/academics.

Respond in JSON: {{"score": 0.85, "explanation": "...", "action_items": ["Step 1", "Step 2", "Step 3"]}}
"""
            try:
                response = model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                data = json.loads(text.strip())
                all_recs.append({
                    "student_id": student_id,
                    "type": "scholarship",
                    "item_id": str(s.id),
                    "item_name": s.name,
                    "item_data": {
                        "provider": s.provider,
                        "amount": s.amount,
                        "deadline": s.deadline,
                        "apply_url": s.apply_url,
                        "documents_required": s.documents_required,
                        "description": s.description,
                        "type": s.type,
                    },
                    "ai_explanation": data.get("explanation", ""),
                    "match_score": float(data.get("score", 0.7)),
                    "action_items": data.get("action_items", []),
                    "deadline": s.deadline,
                })
            except Exception:
                all_recs.append(_build_basic_rec(student_id, "scholarship", s))

        # Score schemes (batch prompt)
        for s in schemes[:8]:
            all_recs.append(_build_basic_rec(student_id, "scheme", s))

        # Score colleges
        for c in colleges[:8]:
            all_recs.append(_build_basic_rec(student_id, "college", c))

        # Score careers
        for c in careers[:6]:
            all_recs.append(_build_basic_rec(student_id, "career", c))

        return sorted(all_recs, key=lambda x: x["match_score"], reverse=True)

    except Exception as e:
        print(f"AI scoring error: {e}")
        return _rule_based_recommendations(student_id, scholarships, schemes, colleges, careers)


def _build_basic_rec(student_id: int, rec_type: str, item) -> Dict[str, Any]:
    """Build a basic recommendation without AI scoring."""
    name = getattr(item, "name", "Unknown")
    base = {
        "student_id": student_id,
        "type": rec_type,
        "item_id": str(item.id),
        "item_name": name,
        "match_score": 0.75,
        "ai_explanation": f"Based on your profile, you may be eligible for {name}. Please review the eligibility criteria and apply before the deadline.",
        "action_items": ["Review eligibility criteria", "Gather required documents", "Apply before deadline"],
        "deadline": getattr(item, "deadline", None),
    }
    if rec_type == "scholarship":
        base["item_data"] = {
            "provider": getattr(item, "provider", ""),
            "amount": getattr(item, "amount", ""),
            "apply_url": getattr(item, "apply_url", ""),
            "documents_required": getattr(item, "documents_required", []),
            "description": getattr(item, "description", ""),
            "type": getattr(item, "type", ""),
        }
    elif rec_type == "scheme":
        base["item_data"] = {
            "ministry": getattr(item, "ministry", ""),
            "benefits": getattr(item, "benefits", ""),
            "benefit_amount": getattr(item, "benefit_amount", ""),
            "apply_url": getattr(item, "apply_url", ""),
            "description": getattr(item, "description", ""),
        }
    elif rec_type == "college":
        base["item_data"] = {
            "type": getattr(item, "type", ""),
            "state": getattr(item, "state", ""),
            "city": getattr(item, "city", ""),
            "nirf_rank": getattr(item, "nirf_rank", None),
            "annual_fee": getattr(item, "annual_fee", ""),
            "courses": getattr(item, "courses", []),
            "entrance_exams": getattr(item, "entrance_exams", []),
            "website": getattr(item, "website", ""),
        }
    elif rec_type == "career":
        base["item_data"] = {
            "category": getattr(item, "category", ""),
            "description": getattr(item, "description", ""),
            "avg_salary": getattr(item, "avg_salary", ""),
            "entrance_exams": getattr(item, "entrance_exams", []),
            "top_colleges": getattr(item, "top_colleges", []),
        }
    return base


def _rule_based_recommendations(student_id, scholarships, schemes, colleges, careers):
    """Build recommendations without AI when Gemini key is not configured."""
    recs = []
    for s in scholarships[:8]:
        recs.append(_build_basic_rec(student_id, "scholarship", s))
    for s in schemes[:6]:
        recs.append(_build_basic_rec(student_id, "scheme", s))
    for c in colleges[:6]:
        recs.append(_build_basic_rec(student_id, "college", c))
    for c in careers[:5]:
        recs.append(_build_basic_rec(student_id, "career", c))
    return recs
