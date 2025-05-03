# hints.py
import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
REQUEST_TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

def generate_hints(movie_title):
    """
    Generates progressively easier hints for a given movie title using the Google Gemini API.

    Args:
        movie_title (str): The title of the movie to generate hints for.

    Returns:
        list[str]: A list containing up to 4 hint strings,
                   or a list with a single error message string if generation fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return ["Configuration error: API key not found."]

    prompt = (
        f"Generate 4 progressively more precise hints for the movie '{movie_title}'. "
        f"Each hint should be a single sentence. Do not reveal the movie title. Also don't repeat the same concept in multiple hints. "
        f"Make the first hint very vague, and each subsequent hint should be more specific. "
        f"Include the genre in the second hint, and the main actor in the third hint. "
        f"Include the release year in first clue."
        f"Return the hints as a numbered list (e.g., '1. Hint one.', '2. Hint two.', etc.)."
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
            try:
                response_data = response.json()
                text = response_data["candidates"][0]["content"]["parts"][0]["text"]

                hints = []
                hint_pattern = re.compile(r"^\s*\d+\s*[.)-]?\s*(.*)")
                for line in text.splitlines():
                    match = hint_pattern.match(line.strip())
                    if match:
                        hint_text = match.group(1).strip()
                        if hint_text:
                            hints.append(hint_text)

                if not hints:
                    return ["Sorry, hints could not be parsed from the response."]

                return hints[:5]

            except (requests.exceptions.JSONDecodeError, KeyError, IndexError, AttributeError):
                return ["Sorry, failed to parse hints from the API response."]
            except Exception:
                return ["Sorry, an unexpected error occurred while processing hints."]
        else:
            return [f"API Error {response.status_code}: Could not generate hints."]

    except requests.exceptions.RequestException:
        return ["Sorry, there was a problem communicating with the hint service."]
    except Exception:
        return ["Sorry, an unexpected error occurred."]
