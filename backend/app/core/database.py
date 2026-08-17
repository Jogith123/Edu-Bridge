from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.models.base import Base

# SQLAlchemy Engine Configuration
database_url = settings.DATABASE_URL
connect_args = {}
pool_config = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif database_url.startswith("postgresql"):
    # PostgreSQL production configuration
    pool_config = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_pre_ping": True,  # Verify connections before using
        "pool_recycle": 3600,   # Recycle connections after 1 hour
    }

engine = create_async_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
    **pool_config
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
