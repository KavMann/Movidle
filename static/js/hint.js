const hints = document.querySelectorAll(".hint-item");
const showHintButton = document.getElementById("show-hint");
let currentHint = 0;
let incorrectGuesses = 0;

showHintButton.disabled = true;
// This function should be called when a guess is submitted
// Update this call in your game logic (likely inside check.js)
function registerGuess(isCorrect) {
  if (!isCorrect) {
    incorrectGuesses++;
    updateHintButtonState();
  }
}

function updateHintButtonState() {
  // Disable hint button until 2 incorrect guesses are made
  if (incorrectGuesses < 2) {
    showHintButton.disabled = true;
  } else {
    showHintButton.disabled = false;
  }
}

showHintButton.addEventListener("click", () => {
  if (currentHint < hints.length && currentHint < incorrectGuesses - 1) {
    hints[currentHint].classList.add("show");
    currentHint++;
    updateHintButtonState();
  }

  if (currentHint >= hints.length) {
    showHintButton.disabled = true;
    showHintButton.textContent = "No more hints";
  }
});
