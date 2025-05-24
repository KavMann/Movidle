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
    """Read the set of used movie titles from file."""
    if not os.path.exists(USED_TITLES_FILE):
        return set()
    with open(USED_TITLES_FILE, 'r', encoding='utf-8') as f:
        return set(line.strip() for line in f.readlines())

def add_title_to_used(title):
    """Add a new title to used list, keeping only the last 100 unique titles."""
    titles = list(get_used_titles())
    titles.append(title.strip())
    # Keep only last 100 unique titles
    titles = list(dict.fromkeys(titles))[-100:]
    with open(USED_TITLES_FILE, 'w', encoding='utf-8') as f:
        for t in titles:
            f.write(t + '\n')

def generate_movie_title(max_length, language="English", used_titles=None):
    """
    Call Gemini API to generate a movie title,
    explicitly avoiding titles in `used_titles`.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    avoid_text = ""
    if used_titles:
        avoid_text = f"IMPORTANT: Do NOT return any movie title from this list of previously used titles: {', '.join(sorted(used_titles))}. "

    prompt = (
        f"Provide the exact title of a well-known {language}-language movie from any year or genre, "
        f"from 1980 onward. The title must be within {max_length} characters long, without abbreviation or truncation. "
        f"Do NOT include quotes, formatting, or any extra text—only the movie title. "
        f"{avoid_text}"
        f"Avoid selecting only the most popular or recent movies. Choose titles from a wide range across decades. "
        f"If no suitable title fits the length restriction, select another."
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

        print(f"Gemini API error: Status code {response.status_code}")
        return None
    except Exception as e:
        print(f"Exception during Gemini API call: {e}")
        return None

def get_daily_title(is_mobile, language="English", fallback_title="Inception"):
    """
    Return a daily unique movie title for given device type and language.
    Cache results and keep track of used titles to avoid duplicates.
    """
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

    for _ in range(10):  # Increased attempts for uniqueness
        title = generate_movie_title(max_length, language=language, used_titles=used_titles)
        if title and title not in used_titles:
            cache[cache_key] = title
            add_title_to_used(title)
            with open(CACHE_FILE, "w") as f:
                json.dump(cache, f, indent=2)
            return title

    # If no unique title found after retries, fallback
    cache[cache_key] = fallback_title
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)
    return fallback_title

def strip_symmetric_wrappers(text):
    """
    Remove symmetric wrapping characters like quotes, asterisks, etc.
    from start and end of text.
    """
    text = text.strip()
    if len(text) >= 2:
        first = text[0]
        last = text[-1]
        if first == last and first in '*"\'_`~':
            return text[1:-1].strip()
    return text
