from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.models.base import Base

# SQLAlchemy Engine Configuration
database_url = settings.DATABASE_URL
connect_args = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Initializes tables on backend startup."""
    # Import all models to register them on Base metadata
    from app.models.user import User
    from app.models.student_profile import StudentProfile
    from app.models.scholarship import Scholarship
    from app.models.government_scheme import GovernmentScheme
    from app.models.college import College
    from app.models.recommendation import Recommendation, CareerPath
    from app.models.campaign import Campaign, Lead

    async with engine.begin() as conn:
        # Create all tables (e.g. SQLite file or PostgreSQL schema tables)
        await conn.run_sync(Base.metadata.create_all)

    print("[OK] Database tables initialized successfully")
