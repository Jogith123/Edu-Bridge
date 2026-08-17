"""
Post-deployment verification script
Tests your live deployment to ensure everything works
Usage: python verify_deployment.py <backend_url> <frontend_url>
Example: python verify_deployment.py https://edubridge-backend.onrender.com https://edubridge.vercel.app
"""
import sys
import requests
import json

def test_backend(backend_url):
    """Test backend API endpoints."""
    print("\n" + "=" * 70)
    print("BACKEND TESTS")
    print("=" * 70)
    
    all_passed = True
    
    # Test 1: Root endpoint
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Root endpoint OK")
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ✗ Root endpoint failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"   ✗ Root endpoint error: {e}")
        all_passed = False
    
    # Test 2: Health check
    print("\n2. Testing health endpoint...")
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Health check OK")
            print(f"   Status: {data.get('status')}")
            print(f"   Database: {data.get('database')}")
            if data.get('database') != 'connected':
                print("   ⚠ Database not connected!")
                all_passed = False
        else:
            print(f"   ✗ Health check failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"   ✗ Health check error: {e}")
        all_passed = False
    
    # Test 3: API docs
    print("\n3. Testing API documentation...")
    try:
        response = requests.get(f"{backend_url}/docs", timeout=10)
        if response.status_code == 200:
            print(f"   ✓ API docs accessible at {backend_url}/docs")
        else:
            print(f"   ✗ API docs failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"   ✗ API docs error: {e}")
        all_passed = False
    
    # Test 4: CORS headers
    print("\n4. Testing CORS configuration...")
    try:
        response = requests.options(
            f"{backend_url}/api/auth/register",
            headers={'Origin': 'https://example.com'},
            timeout=10
        )
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        if cors_header:
            print(f"   ✓ CORS configured: {cors_header}")
        else:
            print(f"   ⚠ CORS headers not found (might need to update CORS_ORIGINS)")
    except Exception as e:
        print(f"   ⚠ CORS check error: {e}")
    
    return all_passed

def test_frontend(frontend_url):
    """Test frontend deployment."""
    print("\n" + "=" * 70)
    print("FRONTEND TESTS")
    print("=" * 70)
    
    all_passed = True
    
    # Test 1: Homepage loads
    print("\n1. Testing homepage...")
    try:
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            print(f"   ✓ Homepage loads successfully")
            if 'EduBridge' in response.text or 'Edu-Bridge' in response.text:
                print(f"   ✓ Content detected")
            else:
                print(f"   ⚠ Expected content not found")
        else:
            print(f"   ✗ Homepage failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"   ✗ Homepage error: {e}")
        all_passed = False
    
    # Test 2: Static assets
    print("\n2. Testing static assets...")
    try:
        response = requests.get(f"{frontend_url}/favicon.svg", timeout=10)
        if response.status_code == 200:
            print(f"   ✓ Static assets loading")
        else:
            print(f"   ⚠ Favicon not found (may be ok)")
    except Exception as e:
        print(f"   ⚠ Static assets check: {e}")
    
    return all_passed

def main():
    if len(sys.argv) < 3:
        print("Usage: python verify_deployment.py <backend_url> <frontend_url>")
        print("Example: python verify_deployment.py https://edubridge-backend.onrender.com https://edubridge.vercel.app")
        sys.exit(1)
    
    backend_url = sys.argv[1].rstrip('/')
    frontend_url = sys.argv[2].rstrip('/')
    
    print("=" * 70)
    print("DEPLOYMENT VERIFICATION")
    print("=" * 70)
    print(f"\nBackend URL: {backend_url}")
    print(f"Frontend URL: {frontend_url}")
    
    # Test backend
    backend_passed = test_backend(backend_url)
    
    # Test frontend
    frontend_passed = test_frontend(frontend_url)
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    if backend_passed and frontend_passed:
        print("\n✓ All tests passed! Your deployment is working correctly.")
        print("\nNext steps:")
        print("1. Test user registration and login")
        print("2. Verify AI features work")
        print("3. Check database is properly seeded")
        print("4. Monitor logs for any errors")
        return 0
    else:
        print("\n⚠ Some tests failed. Please review the errors above.")
        print("\nCommon fixes:")
        print("- Ensure all environment variables are set in Render/Vercel")
        print("- Update CORS_ORIGINS to include your frontend URL")
        print("- Check service logs for detailed error messages")
        print("- Wait 30-60 seconds if backend just woke up from sleep")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nVerification cancelled.")
        sys.exit(1)
