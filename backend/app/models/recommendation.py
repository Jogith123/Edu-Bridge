from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, Text, ForeignKey
from app.models.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # scholarship, scheme, college, career, roadmap
    item_id = Column(String, nullable=True)
    item_name = Column(String, nullable=False)
    item_data = Column(JSON, default=dict)
    ai_explanation = Column(Text, default="")
    match_score = Column(Float, default=0.0)
    is_eligible = Column(Boolean, default=True)
    action_items = Column(JSON, default=list)
    deadline = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, default="")
    required_subjects = Column(JSON, default=list)
    entrance_exams = Column(JSON, default=list)
    avg_salary = Column(String, nullable=True)
    growth_prospects = Column(Text, default="")
    top_colleges = Column(JSON, default=list)
    related_schemes = Column(JSON, default=list)
    roadmap_steps = Column(JSON, default=list)
    tags = Column(JSON, default=list)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
