let validWords = new Set();

fetch("static/merged_words.txt")
  .then((response) => response.text())
  .then((text) => {
    validWords = new Set(
      text.split("\n").map((word) => word.trim().toLowerCase())
    );
  })
  .catch((error) => console.error("Error loading word list:", error));
