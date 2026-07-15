"""
Database seeder -- loads JSON data files into PostgreSQL/SQLite.
Run once: python seed.py
"""
import asyncio
import json
import os
import sys

# Force UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select, inspect
from app.core.database import AsyncSessionLocal, init_db, engine
from app.models.scholarship import Scholarship
from app.models.government_scheme import GovernmentScheme
from app.models.college import College
from app.models.recommendation import CareerPath


def filter_model_fields(model_class, data_dict: dict) -> dict:
    """Return only the keys that exist as columns on the SQLAlchemy model."""
    mapper = inspect(model_class)
    valid_columns = {col.key for col in mapper.columns}
    return {k: v for k, v in data_dict.items() if k in valid_columns}


async def seed():
    # Make sure tables are created first
    await init_db()

    async with AsyncSessionLocal() as db:
        data_dir = os.path.join(os.path.dirname(__file__), "data")

        # ── Scholarships ────────────────────────────────────────────────
        scholarship_count_res = await db.execute(select(Scholarship))
        scholarship_count = len(scholarship_count_res.scalars().all())
        if scholarship_count == 0:
            with open(os.path.join(data_dir, "scholarships.json"), encoding="utf-8") as f:
                scholarships = json.load(f)
            for s in scholarships:
                db.add(Scholarship(**filter_model_fields(Scholarship, s)))
            await db.commit()
            print(f"[OK] Seeded {len(scholarships)} scholarships")
        else:
            print(f"[SKIP] Scholarships already seeded ({scholarship_count} records)")

        # ── Government Schemes ──────────────────────────────────────────
        scheme_count_res = await db.execute(select(GovernmentScheme))
        scheme_count = len(scheme_count_res.scalars().all())
        if scheme_count == 0:
            with open(os.path.join(data_dir, "schemes.json"), encoding="utf-8") as f:
                schemes = json.load(f)
            for s in schemes:
                db.add(GovernmentScheme(**filter_model_fields(GovernmentScheme, s)))
            await db.commit()
            print(f"[OK] Seeded {len(schemes)} government schemes")
        else:
            print(f"[SKIP] Schemes already seeded ({scheme_count} records)")

        # ── Colleges ────────────────────────────────────────────────────
        college_count_res = await db.execute(select(College))
        college_count = len(college_count_res.scalars().all())
        if college_count == 0:
            with open(os.path.join(data_dir, "colleges.json"), encoding="utf-8") as f:
                colleges = json.load(f)
            for c in colleges:
                db.add(College(**filter_model_fields(College, c)))
            await db.commit()
            print(f"[OK] Seeded {len(colleges)} colleges")
        else:
            print(f"[SKIP] Colleges already seeded ({college_count} records)")

        # ── Career Paths ─────────────────────────────────────────────────
        career_count_res = await db.execute(select(CareerPath))
        career_count = len(career_count_res.scalars().all())
        if career_count == 0:
            with open(os.path.join(data_dir, "careers.json"), encoding="utf-8") as f:
                careers = json.load(f)
            for c in careers:
                db.add(CareerPath(**filter_model_fields(CareerPath, c)))
            await db.commit()
            print(f"[OK] Seeded {len(careers)} career paths")
        else:
            print(f"[SKIP] Career paths already seeded ({career_count} records)")

    print("\n[DONE] Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())
