from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, Text
from app.models.base import Base


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    type = Column(String, default="central")  # central, state, private, ngo
    amount = Column(String, nullable=True)
    amount_value = Column(Float, nullable=True)

    # Filter arrays stored as JSON
    eligible_categories = Column(JSON, default=list)
    eligible_states = Column(JSON, default=list)
    eligible_classes = Column(JSON, default=list)
    eligible_streams = Column(JSON, default=list)
    documents_required = Column(JSON, default=list)
    tags = Column(JSON, default=list)

    # Filtering values
    min_income = Column(Float, nullable=True)
    max_income = Column(Float, nullable=True)
    min_percentage = Column(Float, nullable=True)
    gender_specific = Column(String, nullable=True)  # male, female
    disability_required = Column(Boolean, default=False)

    # Description text fields
    description = Column(Text, default="")
    benefits = Column(Text, default="")
    apply_url = Column(String, nullable=True)
    application_portal = Column(String, nullable=True)
    deadline = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
