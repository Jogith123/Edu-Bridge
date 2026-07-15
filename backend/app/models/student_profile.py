from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, JSON
from app.models.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Personal details
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)

    # Location details
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    # Social & economic details
    category = Column(String, nullable=True)  # general, sc, st, obc, ews
    religion = Column(String, nullable=True)
    family_income = Column(Float, nullable=True)
    bpl_card = Column(Boolean, default=False)

    # Academic details
    current_class = Column(String, nullable=True)
    stream = Column(String, nullable=True)
    percentage_10th = Column(Float, nullable=True)
    percentage_12th = Column(Float, nullable=True)
    percentage_graduation = Column(Float, nullable=True)
    institution_name = Column(String, nullable=True)
    board = Column(String, nullable=True)

    # Lists stored as JSON columns
    career_interests = Column(JSON, default=list)
    preferred_states = Column(JSON, default=list)
    languages = Column(JSON, default=list)
    extra_info = Column(JSON, default=dict)

    # Physical details
    disability = Column(Boolean, default=False)
    disability_type = Column(String, nullable=True)
    parent_occupation = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
