from flask import Flask, render_template
import csv, os
from datetime import date
from hints import generate_hints

app = Flask(__name__)

hint_cache = {}  # Cache for generated hints

def get_movie_titles():
    with open('movies.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        return [row[0] for row in reader if row and len(row[0]) < 20]  # Assuming first column is title

@app.route('/')
def index():
    all_titles = get_movie_titles()
    today = date.today()

    # Create a reproducible index based on the date
    index_for_today = today.toordinal() % len(all_titles)
    chosen_title = all_titles[index_for_today]

    # Generate and cache hints if not already done
    if chosen_title not in hint_cache:
        hint_cache[chosen_title] = generate_hints(chosen_title)

    return render_template('index.html', word=chosen_title, hints=hint_cache[chosen_title])

if __name__ == '__main__':
    app.run(debug=True)