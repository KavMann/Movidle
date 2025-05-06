from flask import Flask, render_template, request
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
    is_mobile = is_mobile_request()
    chosen_title = get_daily_title(is_mobile)

    if chosen_title not in hint_cache:
        hint_cache[chosen_title] = generate_hints(chosen_title)

    return render_template('index.html', word=chosen_title, hints=hint_cache[chosen_title])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
