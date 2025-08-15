import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key={API_KEY}"

PROMPT = "based on the image give me european portuguese text that would be used to search on a marketplace. examples: 'casaco de cabedal', 'iphone 11', 'telemóvel', 'camara canon', 'vestido longo rosa', 'barbeadora', your answer should only contain the european portuguese text and only one. do not be overly specific for example 'sapatilhas nike air max 90 brancas' is preferable to 'sapatilhas nike air max 90 brancas pretas e cinzentas'"

async def get_marketplace_label(image_bytes: bytes, mime_type: str) -> str:
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": image_base64}},
                    {"text": PROMPT}
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(ENDPOINT, json=payload)
        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

