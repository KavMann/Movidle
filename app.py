from flask import Flask, render_template
import csv, os
from datetime import date

app = Flask(__name__)

def get_movie_titles():
    with open('movies.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        return [row[0] for row in reader if row]  # Assuming first column is title

@app.route('/')
def index():
    all_titles = get_movie_titles()
    today = date.today()

    # Create a reproducible index based on the date
    index_for_today = today.toordinal() % len(all_titles)
    chosen_title = all_titles[index_for_today]

    return render_template('index.html', word=chosen_title)

if __name__ == '__main__':
    app.run(debug=True)
