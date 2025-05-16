import os
import json
import requests
from datetime import date
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
HEADERS = {
    "Content-Type": "application/json",
}
REQUEST_TIMEOUT = 30
CACHE_FILE = "daily_title_cache.json"
USED_TITLES_FILE = "used_titles.txt"

def get_used_titles():
    if not os.path.exists(USED_TITLES_FILE):
        return set()
    with open(USED_TITLES_FILE, 'r', encoding='utf-8') as f:
        return set(line.strip() for line in f.readlines())

def add_title_to_used(title):
    with open(USED_TITLES_FILE, 'a', encoding='utf-8') as f:
        f.write(title.strip() + '\n')

def generate_movie_title(max_length, language="English", used_titles=None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    avoid_text = ""
    if used_titles:
        # Join all used titles with commas
        avoid_text = f"Avoid these titles that have already been used: {', '.join(sorted(used_titles))}. "
        print(f"Avoiding titles: {avoid_text}")

    prompt = (
        f"Give me the title of a random, well-known {language}-language movie from any year or genre. "
        f"Avoid picking only the most popular or recent titles. "
        f"{avoid_text}"
        f"Choose from a wide range across decades, from 1980 onwards. "
        f"but make sure the **entire** movie title is within {max_length} characters. "
        f"Do not abbreviate or truncate. If no full title fits within {max_length} characters, choose another movie. "
        f"Only return the plain movie title. Do not include quotes, formatting, or any extra text—just the movie name."
    )

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        response = requests.post(
            f"{API_URL}?key={api_key}",
            headers=HEADERS,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            cleaned = strip_symmetric_wrappers(text)
            return cleaned

        return None
    except:
        return None


def get_daily_title(is_mobile, language="English", fallback_title="Inception"):
    today = date.today().isoformat()
    cache_key = f"{today}-{language.lower()}-mobile" if is_mobile else f"{today}-{language.lower()}-desktop"

    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            cache = json.load(f)
    else:
        cache = {}

    if cache_key in cache:
        return cache[cache_key]

    used_titles = get_used_titles()
    max_length = 10 if is_mobile else 18

    for _ in range(5):
        title = generate_movie_title(max_length, language=language)
        if title and title not in used_titles:
            cache[cache_key] = title
            add_title_to_used(title)
            with open(CACHE_FILE, "w") as f:
                json.dump(cache, f, indent=2)
            return title

    cache[cache_key] = fallback_title
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)
    return fallback_title

def strip_symmetric_wrappers(text):
    text = text.strip()
    if len(text) >= 2:
        first = text[0]
        last = text[-1]
        if first == last and first in '*"\'_`~':
            return text[1:-1].strip()
    return text
