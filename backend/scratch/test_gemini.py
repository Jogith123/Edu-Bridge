import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key}")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Hello, write a 1-word response.")
    print("gemini-2.5-flash response:", response.text.strip())
except Exception as e:
    print("gemini-2.5-flash failed:", e)

try:
    model = genai.GenerativeModel("gemini-3.5-flash")
    response = model.generate_content("Hello, write a 1-word response.")
    print("gemini-3.5-flash response:", response.text.strip())
except Exception as e:
    print("gemini-3.5-flash failed:", e)
