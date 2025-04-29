// Global variable to track the color states of the keys
const keyState = {};

function updateStreak(won) {
  const today = new Date();
  const todayStr = today.toDateString();
  const lastCompletedStr = localStorage.getItem("lastCompletedDate");
  const lastCompleted = lastCompletedStr ? new Date(lastCompletedStr) : null;

  let currentStreak = parseInt(localStorage.getItem("streak")) || 0;

  if (lastCompletedStr === todayStr) return currentStreak;

  let streakContinues = false;
  if (lastCompleted) {
    const diffTime = today - lastCompleted;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    streakContinues =
      diffDays < 2 && today.getDate() - lastCompleted.getDate() === 1;
  }

  currentStreak = won ? (streakContinues ? currentStreak + 1 : 1) : 0;
  localStorage.setItem("streak", currentStreak);
  localStorage.setItem("lastCompletedDate", todayStr);

  return currentStreak;
}

function checkGuess() {
  const rawWord = targetWord.toLowerCase();
  const word = rawWord.replace(/[^a-z]/g, "");
  let guess = "";
  const colorMap = {
    green: "green",
    yellow: "rgb(129, 129, 22)",
    grey: "rgb(46, 46, 46)",
  };

  const inputContainer = document.getElementById("input-container");
  const mostRecentRow = inputContainer.lastElementChild;
  const inputs = mostRecentRow.querySelectorAll("input");

  for (let i = 0; i < word.length; i++) {
    guess += inputs[i].value.toLowerCase();
  }

  const guessArray = guess.split("");
  const wordArray = word.split("");
  const resultColors = Array(word.length).fill("grey");
  const letterCount = {};

  // Count each letter in the word
  for (let char of wordArray) {
    letterCount[char] = (letterCount[char] || 0) + 1;
  }

  // Mark green (correct letter, correct position)
  for (let i = 0; i < word.length; i++) {
    if (guessArray[i] === wordArray[i]) {
      resultColors[i] = "green";
      letterCount[guessArray[i]] -= 1;
    }
  }

  // Mark yellow (correct letter, wrong position)
  for (let i = 0; i < word.length; i++) {
    if (resultColors[i] !== "green" && letterCount[guessArray[i]] > 0) {
      resultColors[i] = "yellow";
      letterCount[guessArray[i]] -= 1;
    }
  }

  // Apply colors and update keyState
  for (let i = 0; i < word.length; i++) {
    const input = inputs[i];
    const letter = guessArray[i];
    const color = resultColors[i];

    setTimeout(() => {
      input.style.backgroundColor = colorMap[color];
      input.classList.add("flip");
      keyState[letter] = color !== "grey" ? color : keyState[letter] || "grey";
      updateKeyboardColors();
    }, i * 300); // delay each flip
  }

  if (guess === word) {
    const streak = updateStreak(true);
    setTimeout(() => {
      showPlayAgainModal(streak);
    }, guess.length * 300 + 600);
    return;
  }

  if (document.querySelectorAll(".guess-row").length > 5 && guess !== word) {
    const streak = updateStreak(false);
    showEndMessage(`No more guesses! The movie was:\n${targetWord}`);
    revealAnswer(rawWord);
    setTimeout(() => {
      showNextTimeModal(streak);
    }, guess.length * 300 + 600);
    return;
  }

  createNewRow();
}

function revealAnswer(answer) {
  const inputContainer = document.getElementById("input-container");
  const answerRow = document.createElement("div");
  answerRow.classList.add("guess-row");

  for (let i = 0; i < answer.length; i++) {
    const char = answer[i];

    if (char.match(/[A-Za-z]/)) {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("letter-input");
      input.value = char.toUpperCase();
      input.disabled = true;
      input.style.backgroundColor = "green";
      answerRow.appendChild(input);
    } else {
      const span = document.createElement("span");
      span.classList.add("pre-filled");
      span.textContent = char;
      answerRow.appendChild(span);
    }
  }

  inputContainer.appendChild(answerRow);
}

function updateKeyboardColors() {
  const keyboard = document.getElementsByClassName("key");
  for (let i = 0; i < keyboard.length; i++) {
    const key = keyboard[i];
    const keyLetter = key.innerText.toLowerCase();
    const state = keyState[keyLetter];

    if (state) {
      key.style.backgroundColor =
        state === "green"
          ? "green"
          : state === "yellow"
          ? "rgb(212, 212, 0)"
          : "rgb(46, 46, 46)";
    }
  }
}

function createNewRow() {
  const allRows = document.querySelectorAll(".guess-row");
  allRows.forEach((row) => {
    // Add the past-guess class after the flip animation has finished
    setTimeout(() => {
      row.classList.remove("flip-in");
      row.classList.add("past-guess");
    }, targetWord.length * 300 + 300); // Adjust the timeout to match the flip animation duration
  });

  setTimeout(() => {
    generateInputs(targetWord);
  }, targetWord.length * 300 + 600); // Delay to ensure past-guess effect is applied first
}

function showEndMessage(message) {
  const msgBox = document.createElement("div");
  msgBox.innerText = message;
  msgBox.className = "message-box";
  document.body.appendChild(msgBox);

  setTimeout(() => {
    msgBox.remove();
  }, 3000);
}

function showPlayAgainModal(streak) {
  const modal = document.createElement("div");
  modal.className = "play-again-modal";
  modal.innerHTML = ```
    <div class="modal-content">
      <h2>🎉 Congratulations!</h2>
      <p>Come back tomorrow for a new movie!</p>
      <p><strong>Current Streak:</strong> ${streak} 🔥</p>
      <button onclick="closeModal()">OK</button>
    </div>
  ```;
  document.body.appendChild(modal);
}

function showNextTimeModal(streak) {
  const modal = document.createElement("div");
  modal.className = "play-again-modal";
  modal.innerHTML = ```
    <div class="modal-content">
      <h2>💔 Unlucky! Next Time</h2>
      <p>Come back tomorrow for a new movie!</p>
      <p><strong>Current Streak:</strong> ${streak} 🔥</p>
      <button onclick="closeModal()">OK</button>
    </div>
  ```;
  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.querySelector(".play-again-modal, .next-time-modal");
  if (modal) modal.remove();
}
