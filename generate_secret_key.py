"""
Generate a secure SECRET_KEY for production use
Usage: python generate_secret_key.py
"""
import secrets

def generate_secret_key(length=64):
    """Generate a cryptographically secure random key."""
    return secrets.token_hex(length)

if __name__ == '__main__':
    print("=" * 70)
    print("SECRET KEY GENERATOR")
    print("=" * 70)
    print("\nGenerating secure random key...\n")
    
    key = generate_secret_key()
    
    print(f"Your SECRET_KEY:\n")
    print(f"  {key}\n")
    print("=" * 70)
    print("\nAdd this to your Render environment variables:")
    print("  1. Go to Render Dashboard → Your Service")
    print("  2. Click 'Environment' tab")
    print("  3. Add SECRET_KEY with the value above")
    print("  4. Save (service will redeploy)")
    print("\n⚠️  IMPORTANT: Keep this key secret and never commit it to git!")
    print("=" * 70)
