"""
Pre-deployment test script
Tests that all configurations are correct before deploying
Usage: python test_deployment.py
"""
import os
import json
import sys

def check_file_exists(filepath, description):
    """Check if a file exists."""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description} MISSING: {filepath}")
        return False

def check_json_valid(filepath):
    """Check if JSON file is valid."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"  ✓ Valid JSON: {filepath}")
        return True
    except json.JSONDecodeError as e:
        print(f"  ✗ Invalid JSON in {filepath}: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error reading {filepath}: {e}")
        return False

def main():
    print("=" * 70)
    print("DEPLOYMENT READINESS CHECK")
    print("=" * 70)
    
    all_passed = True
    
    # Backend files
    print("\n[BACKEND FILES]")
    backend_files = [
        ('backend/main.py', 'Main application'),
        ('backend/requirements.txt', 'Python dependencies'),
        ('backend/Dockerfile', 'Docker configuration'),
        ('backend/Procfile', 'Render startup config'),
        ('backend/runtime.txt', 'Python version'),
        ('backend/seed.py', 'Database seeder'),
        ('backend/.env.example', 'Environment template'),
    ]
    
    for filepath, description in backend_files:
        if not check_file_exists(filepath, description):
            all_passed = False
    
    # Backend data files
    print("\n[BACKEND DATA FILES]")
    data_files = [
        'backend/data/scholarships.json',
        'backend/data/schemes.json',
        'backend/data/colleges.json',
        'backend/data/careers.json',
    ]
    
    for filepath in data_files:
        if check_file_exists(filepath, os.path.basename(filepath)):
            if not check_json_valid(filepath):
                all_passed = False
        else:
            all_passed = False
    
    # Frontend files
    print("\n[FRONTEND FILES]")
    frontend_files = [
        ('frontend/package.json', 'Package configuration'),
        ('frontend/vite.config.ts', 'Vite configuration'),
        ('frontend/vercel.json', 'Vercel configuration'),
        ('frontend/.env.example', 'Environment template'),
        ('frontend/.env.production', 'Production environment'),
        ('frontend/index.html', 'HTML entry point'),
        ('frontend/src/main.tsx', 'App entry point'),
    ]
    
    for filepath, description in frontend_files:
        if not check_file_exists(filepath, description):
            all_passed = False
    
    # Deployment files
    print("\n[DEPLOYMENT FILES]")
    deployment_files = [
        ('render.yaml', 'Render blueprint'),
        ('DEPLOYMENT_GUIDE.md', 'Deployment guide'),
        ('DEPLOYMENT_CHECKLIST.md', 'Deployment checklist'),
        ('QUICK_START_DEPLOYMENT.md', 'Quick start guide'),
    ]
    
    for filepath, description in deployment_files:
        if not check_file_exists(filepath, description):
            all_passed = False
    
    # Check git status
    print("\n[GIT STATUS]")
    if os.path.exists('.git'):
        print("✓ Git repository initialized")
        # Check if there's a remote
        if os.system('git remote -v > nul 2>&1') == 0:
            print("✓ Git remote configured")
        else:
            print("⚠ Git remote not configured (needed for Render/Vercel)")
    else:
        print("✗ Git repository not initialized")
        all_passed = False
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    if all_passed:
        print("\n✓ All checks passed!")
        print("\nNext steps:")
        print("1. Review .env.example files and set your actual values")
        print("2. Run: python backend/validate_env.py")
        print("3. Push code to GitHub")
        print("4. Follow QUICK_START_DEPLOYMENT.md")
        return 0
    else:
        print("\n✗ Some checks failed - fix issues above before deploying")
        return 1

if __name__ == '__main__':
    sys.exit(main())
