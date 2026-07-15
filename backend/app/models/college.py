from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, Text
from app.models.base import Base


class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=True)
    type = Column(String, default="state")  # iit, nit, central, state, private

    state = Column(String, nullable=False)
    city = Column(String, nullable=False)

    nirf_rank = Column(Integer, nullable=True)
    naac_grade = Column(String, nullable=True)

    # Lists stored as JSON
    courses = Column(JSON, default=list)
    streams = Column(JSON, default=list)
    entrance_exams = Column(JSON, default=list)
    tags = Column(JSON, default=list)

    # Cutoffs
    cutoff_general = Column(Float, nullable=True)
    cutoff_obc = Column(Float, nullable=True)
    cutoff_sc = Column(Float, nullable=True)
    cutoff_st = Column(Float, nullable=True)

    # Fees & amenities
    annual_fee = Column(String, nullable=True)
    annual_fee_value = Column(Float, nullable=True)
    hostel_available = Column(Boolean, default=True)
    scholarship_info = Column(Text, nullable=True)

    description = Column(Text, default="")
    website = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
