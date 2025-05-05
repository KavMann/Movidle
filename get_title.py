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

def generate_movie_title():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    prompt = (
    "Give me the title of a random, well-known English-language movie from any year or genre. "
    "Avoid picking only the most popular or recent titles. "
    "Choose from a wide range across decades, with the oldest being from 1980. "
    "The movie title should not exceed 18 characters in length. "
    "Only return the plain movie title, with no punctuation, formatting, or extra text. "
    "Do not include quotes or anything else—just the movie name."
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
            return text.strip().strip('"')
        return None
    except:
        return None

def get_daily_title(fallback_title="Inception"):
    today = date.today().isoformat()

    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            cache = json.load(f)
    else:
        cache = {}

    # Return cached title if already selected
    if today in cache:
        return cache[today]

    used_titles = get_used_titles()

    # Try generating a new unique title
    for _ in range(5):
        title = generate_movie_title()
        if title and title not in used_titles and len(title) < 30:
            cache[today] = title
            add_title_to_used(title)
            with open(CACHE_FILE, "w") as f:
                json.dump(cache, f, indent=2)
            return title

    # Fallback if generation fails
    cache[today] = fallback_title
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)
    return fallback_title
