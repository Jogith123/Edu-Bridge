from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, Text
from app.models.base import Base


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ministry = Column(String, nullable=False)
    type = Column(String, default="welfare")  # scholarship, skill, loan, stipend, etc.

    # Filtering parameters
    eligible_categories = Column(JSON, default=list)
    eligible_states = Column(JSON, default=list)
    max_income = Column(Float, nullable=True)
    min_percentage = Column(Float, nullable=True)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    gender_specific = Column(String, nullable=True)

    # Detailed info
    description = Column(Text, default="")
    benefits = Column(Text, default="")
    benefit_amount = Column(String, nullable=True)
    documents_required = Column(JSON, default=list)
    apply_url = Column(String, nullable=True)
    deadline = Column(String, nullable=True)

    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
