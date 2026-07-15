"""Drop all tables and recreate with the latest schema."""
import asyncio
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine
from app.models.base import Base
# Import every model so it registers itself on Base.metadata
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.models.government_scheme import GovernmentScheme
from app.models.college import College
from app.models.recommendation import Recommendation, CareerPath
from app.models.campaign import Campaign, Lead


async def reset():
    async with engine.begin() as conn:
        print("Dropping all existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables with updated schema...")
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Schema reset complete.")


if __name__ == "__main__":
    asyncio.run(reset())
