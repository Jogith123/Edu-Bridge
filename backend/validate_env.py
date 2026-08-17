"""
Environment validation script - Run before deployment to check configuration
Usage: python validate_env.py
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def validate_environment():
    """Validate all required environment variables."""
    errors = []
    warnings = []
    
    # Required variables
    required = {
        'DATABASE_URL': 'Database connection string',
        'SECRET_KEY': 'JWT secret key',
        'GEMINI_API_KEY': 'Google Gemini API key',
    }
    
    # Optional but recommended
    optional = {
        'CORS_ORIGINS': 'Allowed frontend origins',
        'VAPI_API_KEY': 'VAPI voice AI key (optional)',
    }
    
    print("=" * 60)
    print("ENVIRONMENT VALIDATION")
    print("=" * 60)
    
    # Check required variables
    print("\n[REQUIRED VARIABLES]")
    for var, description in required.items():
        value = os.getenv(var)
        if not value:
            errors.append(f"✗ {var} is missing - {description}")
            print(f"✗ {var}: MISSING")
        else:
            # Check for default/example values that should be changed
            if var == 'SECRET_KEY' and ('secret' in value.lower() or 'change' in value.lower() or len(value) < 32):
                warnings.append(f"⚠ {var} appears to be a default value - use a strong random key")
                print(f"⚠ {var}: SET (but appears to be default/weak)")
            elif var == 'DATABASE_URL' and value.startswith('sqlite'):
                warnings.append(f"⚠ {var} is using SQLite - PostgreSQL recommended for production")
                print(f"⚠ {var}: SET (SQLite - use PostgreSQL for production)")
            elif var == 'GEMINI_API_KEY' and (len(value) < 20 or 'your' in value.lower()):
                errors.append(f"✗ {var} appears to be invalid")
                print(f"✗ {var}: INVALID")
            else:
                print(f"✓ {var}: OK")
    
    # Check optional variables
    print("\n[OPTIONAL VARIABLES]")
    for var, description in optional.items():
        value = os.getenv(var)
        if not value:
            print(f"⚠ {var}: NOT SET - {description}")
        else:
            print(f"✓ {var}: SET")
    
    # Security checks
    print("\n[SECURITY CHECKS]")
    secret_key = os.getenv('SECRET_KEY', '')
    if len(secret_key) < 32:
        warnings.append("⚠ SECRET_KEY should be at least 32 characters")
        print(f"⚠ SECRET_KEY length: {len(secret_key)} (recommend 64+)")
    else:
        print(f"✓ SECRET_KEY length: {len(secret_key)}")
    
    # Database check
    database_url = os.getenv('DATABASE_URL', '')
    if database_url:
        if database_url.startswith('postgresql://'):
            print("✓ Database: PostgreSQL (recommended for production)")
        elif database_url.startswith('sqlite'):
            print("⚠ Database: SQLite (use PostgreSQL for production)")
        else:
            print(f"? Database: {database_url.split(':')[0]}")
    
    # CORS check
    cors_origins = os.getenv('CORS_ORIGINS', '')
    if cors_origins:
        origins = [o.strip() for o in cors_origins.split(',')]
        print(f"✓ CORS Origins: {len(origins)} configured")
        for origin in origins:
            print(f"  - {origin}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if errors:
        print(f"\n❌ ERRORS ({len(errors)}):")
        for error in errors:
            print(f"  {error}")
    
    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for warning in warnings:
            print(f"  {warning}")
    
    if not errors:
        if warnings:
            print("\n✓ Configuration is valid but has warnings")
            print("  Review warnings above before deploying to production")
            return 0
        else:
            print("\n✓ All checks passed! Ready for deployment")
            return 0
    else:
        print("\n✗ Configuration has errors - fix them before deployment")
        return 1

if __name__ == '__main__':
    sys.exit(validate_environment())
