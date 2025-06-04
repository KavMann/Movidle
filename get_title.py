import os
import json
import requests
from datetime import date
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
HEADERS = {"Content-Type": "application/json"}
REQUEST_TIMEOUT = 30
FALLBACK_TITLE = "Inception"

# Connect to MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# Ensure necessary tables exist
def setup_db():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS used_titles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) UNIQUE,
        used_on DATE DEFAULT CURRENT_DATE
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_titles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE,
        title VARCHAR(255),
        created_on DATE DEFAULT CURRENT_DATE
    )""")
    db.commit()
    cursor.close()
    db.close()

setup_db()

def get_used_titles():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT title FROM used_titles ORDER BY used_on DESC LIMIT 100")
    titles = set(row[0] for row in cursor.fetchall())
    cursor.close()
    db.close()
    return titles

def add_title_to_used(title):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT IGNORE INTO used_titles (title) VALUES (%s)", (title,))
        db.commit()
    finally:
        cursor.close()
        db.close()

def get_cached_title(cache_key):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT title FROM daily_titles WHERE cache_key = %s AND created_on = CURDATE()", (cache_key,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    return row[0] if row else None

def cache_daily_title(cache_key, title):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO daily_titles (cache_key, title, created_on)
            VALUES (%s, %s, CURDATE())
            ON DUPLICATE KEY UPDATE title = VALUES(title)
        """, (cache_key, title))
        db.commit()
    finally:
        cursor.close()
        db.close()

def strip_symmetric_wrappers(text):
    text = text.strip()
    if len(text) >= 2:
        first = text[0]
        last = text[-1]
        if first == last and first in '*"\'_`~':
            return text[1:-1].strip()
    return text

def generate_movie_title(max_length, language="English", used_titles=None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    avoid_text = ""
    if used_titles:
        avoid_text = f"Do NOT use these titles: {', '.join(sorted(used_titles))}. "

    prompt = (
        f"Provide the exact title of a well-known {language}-language movie from any year or genre, "
        f"from 1990 onward. The title must be within {max_length} characters long, without abbreviation or truncation. "
        f"Do NOT include quotes, formatting, or any extra text—only the movie title. "
        f"{avoid_text}"
        f"Avoid selecting only the most popular or recent movies. Choose titles from a wide range across decades. "
        f"If no suitable title fits the length restriction, select another."
    )

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(
            f"{API_URL}?key={api_key}",
            headers=HEADERS,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            return strip_symmetric_wrappers(text)
        return None
    except Exception as e:
        print("API call error:", e)
        return None

def get_daily_title(is_mobile, language="English", fallback_title=FALLBACK_TITLE):
    today = date.today().isoformat()
    cache_key = f"{today}-{language.lower()}-mobile" if is_mobile else f"{today}-{language.lower()}-desktop"

    cached = get_cached_title(cache_key)
    if cached:
        return cached

    used_titles = get_used_titles()
    max_length = 10 if is_mobile else 18

    for _ in range(10):
        title = generate_movie_title(max_length, language=language, used_titles=used_titles)
        if title and title not in used_titles:
            cache_daily_title(cache_key, title)
            add_title_to_used(title)
            append_title_words_to_dictionary(title)
            return title

    cache_daily_title(cache_key, fallback_title)
    return fallback_title

def append_title_words_to_dictionary(title):
    file_path = os.path.join("static", "merged_words.txt")
    if not os.path.exists(file_path):
        open(file_path, 'w').close()

    with open(file_path, 'r+', encoding='utf-8') as f:
        existing_words = set(word.strip().lower() for word in f.readlines())
        new_words = [word.strip() for word in title.split() if word.strip().lower() not in existing_words]

        if new_words:
            f.write('\n' + '\n'.join(new_words))
