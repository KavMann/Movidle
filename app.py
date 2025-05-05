from flask import Flask, render_template
from hints import generate_hints
from get_title import get_daily_title

app = Flask(__name__)
hint_cache = {}  # Cache for generated hints

@app.route('/')
def index():
    chosen_title = get_daily_title()

    # Generate and cache hints if not already done
    if chosen_title not in hint_cache:
        hint_cache[chosen_title] = generate_hints(chosen_title)

    return render_template('index.html', word=chosen_title, hints=hint_cache[chosen_title])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
