from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from app.models.base import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft")  # draft, active, paused, completed
    target_criteria = Column(JSON, default=dict)

    # Vapi config
    vapi_assistant_id = Column(String, nullable=True)
    vapi_call_ids = Column(JSON, default=list)
    call_script = Column(Text, nullable=True)

    # Stats
    total_students = Column(Integer, default=0)
    calls_made = Column(Integer, default=0)
    calls_answered = Column(Integer, default=0)
    profiles_updated = Column(Integer, default=0)

    # Timestamps
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    phone = Column(String, nullable=False)
    name = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, called, answered, failed
    vapi_call_id = Column(String, nullable=True)

    call_duration = Column(Integer, nullable=True)
    call_transcript = Column(Text, nullable=True)
    extracted_info = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
