// Check.js

const keyState = {};

function updateStreak(won) {
  const todayStr = new Date().toDateString();
  const lastStr = localStorage.getItem("lastCompletedDate");
  let streak = parseInt(localStorage.getItem("streak")) || 0;

  if (lastStr === todayStr) return streak;

  const lastDate = lastStr ? new Date(lastStr) : null;
  const diffDays = lastDate
    ? (new Date() - lastDate) / (1000 * 60 * 60 * 24)
    : Infinity;

  const continues =
    lastDate && diffDays < 2 && new Date().getDate() - lastDate.getDate() === 1;

  streak = won ? (continues ? streak + 1 : 1) : 0;

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastCompletedDate", todayStr);

  return streak;
}

function isGuessSegmentedValid(row) {
  const segments = [];
  let currentWord = "";

  for (const el of row.children) {
    if (el.tagName === "INPUT") {
      currentWord += el.value.toLowerCase();
    } else if (el.tagName === "SPAN") {
      if (currentWord) segments.push(currentWord);
      currentWord = "";
    }
  }

  if (currentWord) segments.push(currentWord); // add the last chunk

  return segments.every((word) => validWords.has(word));
}

function checkGuess() {
  const row = document.querySelector("#input-container .guess-row:last-child");
  if (!row) return;

  const inputs = row.querySelectorAll("input");
  const allFilled = [...inputs].every((input) => input.value.trim() !== "");

  if (!allFilled) {
    return alert("Please fill in all letters before submitting.");
  }

  // ✅ Validate segments
  if (window.currentLanguage === "english" && !isGuessSegmentedValid(row)) {
    return alert("Each word segment must be a real English word.");
  }

  const word = targetWord.toLowerCase().replace(/[^a-z]/g, "");
  const guess = [...inputs].map((i) => i.value.toLowerCase()).join("");

  const result = Array(word.length).fill("grey");
  const count = {};

  for (const char of word) count[char] = (count[char] || 0) + 1;

  for (let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) {
      result[i] = "green";
      count[guess[i]]--;
    }
  }

  for (let i = 0; i < word.length; i++) {
    if (result[i] === "grey" && count[guess[i]] > 0) {
      result[i] = "yellow";
      count[guess[i]]--;
    }
  }

  inputs.forEach((input, i) => {
    const letter = input.value.toLowerCase();
    const color = result[i];
    setTimeout(() => {
      input.classList.add("flip", color);

      // Remove any old color class
      input.classList.remove("green", "yellow", "grey");
      input.classList.add(color);

      keyState[letter] = color !== "grey" ? color : keyState[letter] || "grey";
      updateKeyboardColors();
    }, i * 300);
  });

  if (guess === word) {
    setTimeout(
      () => showPlayAgainModal(updateStreak(true)), // Call from modal.js
      word.length * 300 + 600
    );
    return;
  }

  if (guess !== word) {
    registerGuess(false);
  }

  if (document.querySelectorAll(".guess-row").length > 4) {
    showEndMessage(
      `Final guess! Click: <img src="/static/animations/hint.gif" alt="Hint icon" style="width: 35px; height: 35px; vertical-align: middle;" /> if you want help!`,
      word.length
    );
  }

  if (document.querySelectorAll(".guess-row").length > 5) {
    showEndMessage(
      // Call from modal.js
      `No more guesses! The movie was:\n${targetWord}`,
      word.length
    );
    setTimeout(
      () => showNextTimeModal(updateStreak(false)), // Call from modal.js
      word.length * 300 + 600
    );
    return;
  }

  createNewRow();
}

function updateKeyboardColors() {
  [...document.getElementsByClassName("key")].forEach((key) => {
    const letter = key.innerText.toLowerCase();
    const state = keyState[letter];
    if (state) {
      key.classList.remove("green", "yellow", "grey");
      key.classList.add(state);
    }
  });
}

function createNewRow() {
  document.querySelectorAll(".guess-row").forEach((row) =>
    setTimeout(() => {
      row.classList.remove("flip-in");
      row.classList.add("past-guess");
      hideOldRowsIfSmallViewport();
    }, targetWord.length * 300 + 300)
  );

  setTimeout(() => generateInputs(targetWord), targetWord.length * 300 + 300);
}

function hideOldRowsIfSmallViewport() {
  const allRows = document.querySelectorAll("#input-container .guess-row");
  const maxVisible = 3;

  if (window.innerHeight <= 700) {
    allRows.forEach((row, index) => {
      row.style.display = index < allRows.length - maxVisible ? "none" : "flex";
    });
  } else {
    // Ensure all rows are shown again if viewport is tall enough
    allRows.forEach((row) => {
      row.style.display = "flex";
    });
  }
}
