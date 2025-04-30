# hints.py
# hints.py
import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()

# --- Constants ---
# It's generally recommended to use the stable v1 endpoint
# --- Constants ---
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
# Set a reasonable timeout for API requests (e.g., 30 seconds)
REQUEST_TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

# --- Main Function ---

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
        print("Error: GEMINI_API_KEY not found in environment variables.")
        return ["Configuration error: API key not found."]

    # Construct the prompt for the Gemini API
    prompt = (
        f"Generate 4 progressively more precise hints for the movie '{movie_title}'. "
        f"Each hint should be a single sentence. Do not reveal the movie title. Also don't repeat the same concept in multiple hints. "
        f"Make the first hint very vague, and each subsequent hint should be more specific. "
        f"Include the genre in the second hint, and the main actor in the third hint. "        
        f"Include the release year in first clue."
        f"Return the hints as a numbered list (e.g., '1. Hint one.', '2. Hint two.', etc.)."
    )

    # Structure the payload for the API request
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        # Optional: Add generation configuration if needed
        # "generationConfig": {
        #   "temperature": 0.7,
        #   "maxOutputTokens": 200
        # },
        # Optional: Add safety settings if needed
        # "safetySettings": [
        #    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
        # ]
    }

    try:
        # Make the POST request to the Gemini API
        response = requests.post(
            f"{API_URL}?key={api_key}",
            headers=HEADERS,
            json=payload,
            timeout=REQUEST_TIMEOUT  # Add timeout here
        )

        # Check if the API call was successful (HTTP 200 OK)
        if response.status_code == 200:
            try:
                # Attempt to parse the JSON response
                response_data = response.json()
                # Extract the generated text
                text = response_data["candidates"][0]["content"]["parts"][0]["text"]

                # Parse the hints from the text using regex for flexibility
                hints = []
                # Regex: matches lines starting with optional space, number, optional punctuation/space, then captures the rest
                hint_pattern = re.compile(r"^\s*\d+\s*[.)-]?\s*(.*)")
                for line in text.splitlines(): # Use splitlines() to handle different line endings
                    match = hint_pattern.match(line.strip())
                    if match:
                        hint_text = match.group(1).strip()
                        if hint_text: # Ensure the captured hint is not empty
                            hints.append(hint_text)

                if not hints:
                    # Handle case where API response was OK but no hints were parsed
                    print(f"Warning: No hints parsed from response text:\n{text}")
                    return ["Sorry, hints could not be parsed from the response."]

                # Return the first 5 parsed hints (or fewer if less were generated/parsed)
                return hints[:5]

            # Handle specific errors during JSON parsing or accessing expected keys
            except (requests.exceptions.JSONDecodeError, KeyError, IndexError, AttributeError) as e:
                print(f"Response parsing error: {e}")
                # It can be helpful to log the raw response text for debugging
                # print(f"Raw response text for parsing error: {response.text}")
                return ["Sorry, failed to parse hints from the API response."]
            except Exception as e: # Catch any other unexpected error during processing
                print(f"Unexpected error during response processing: {e}")
                return ["Sorry, an unexpected error occurred while processing hints."]

        # Handle non-200 HTTP status codes (API errors)
        else:
            error_message = f"API Error {response.status_code}: Could not generate hints."
            try:
                # Try to get a more specific error message from the API response body
                error_details = response.json().get('error', {}).get('message', response.text)
                print(f"Gemini API error: {response.status_code} - {error_details}")
                # You might refine the user-facing message based on the details if needed
            except requests.exceptions.JSONDecodeError:
                # If the error response isn't valid JSON, just use the status code and raw text
                print(f"Gemini API error: {response.status_code} - {response.text}")

            return [error_message]

    # Handle network errors or other issues with the request itself
    except requests.exceptions.RequestException as e:
        print(f"Network or request error: {e}")
        return ["Sorry, there was a problem communicating with the hint service."]
    except Exception as e: # Catch any other unexpected error (e.g., during setup)
        print(f"An unexpected error occurred: {e}")
        return ["Sorry, an unexpected error occurred."]

# --- Example Usage (Optional) ---
if __name__ == "__main__":
    # Ensure you have a .env file with your GEMINI_API_KEY
    # or that the environment variable is set system-wide.
    test_movie = "Inception"
    print(f"Generating hints for: {test_movie}")
    generated_hints = generate_hints(test_movie)

    if len(generated_hints) == 1 and "Sorry" in generated_hints[0]:
        print(f"Error: {generated_hints[0]}")
    else:
        print("Generated Hints:")
        for i, hint in enumerate(generated_hints, 1):
            print(f"{i}. {hint}")