from flask import Flask, render_template, request, jsonify
from hints import generate_hints
from get_title import get_daily_title

app = Flask(__name__)
hint_cache = {}

def is_mobile_request():
    user_agent = request.headers.get("User-Agent", "").lower()
    mobile_keywords = ["mobi", "android", "iphone", "ipad"]
    return any(keyword in user_agent for keyword in mobile_keywords)

@app.route('/')
def index():
    language = request.args.get('lang', 'English')

    is_mobile = is_mobile_request()
    chosen_title = get_daily_title(is_mobile, language=language)

    cache_key = f"{language}:{chosen_title}"
    if cache_key not in hint_cache:
        hint_cache[cache_key] = generate_hints(chosen_title)

    return render_template('index.html', word=chosen_title, hints=hint_cache[cache_key])

@app.route('/change_language')
def change_language():
    language = request.args.get('lang', 'English')
    is_mobile = request.args.get('is_mobile', 'false').lower() == 'true'

    chosen_title = get_daily_title(is_mobile, language=language)
    return jsonify({"title": chosen_title})

@app.route('/get_hints')
def get_hints():
    title = request.args.get('title')
    language = request.args.get('lang', 'English')

    if not title:
        return jsonify({"error": "Missing title"}), 400

    cache_key = f"{language}:{title}"
    if cache_key not in hint_cache:
        hint_cache[cache_key] = generate_hints(title)

    return jsonify({"hints": hint_cache[cache_key]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
