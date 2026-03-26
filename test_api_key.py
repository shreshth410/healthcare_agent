"""Quick diagnostic: test if the Groq API key works."""

import os
from dotenv import load_dotenv

# Explicitly load .env from this script's directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("❌ GROQ_API_KEY is not set. Check your .env file.")
    exit(1)

print(f"✅ API key found: {api_key[:8]}...{api_key[-4:]}")

try:
    from groq import Groq

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
        max_tokens=50,
    )
    print(f"✅ Groq API works! Response: {response.choices[0].message.content.strip()}")
except Exception as e:
    print(f"❌ Groq API call failed: {type(e).__name__}: {e}")
