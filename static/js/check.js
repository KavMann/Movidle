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

function checkGuess() {
  const word = targetWord.toLowerCase().replace(/[^a-z]/g, "");
  const inputs = document.querySelectorAll(
    "#input-container .guess-row:last-child input"
  );
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
      // Call from modal.js
      `Final guess! Click: <div id="lottie-howto-icon" style="width: 35px; height: 35px"></div> If you want help!`
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
    }, targetWord.length * 300 + 300)
  );

  setTimeout(() => generateInputs(targetWord), targetWord.length * 300 + 300);
}

function fillRandomLetter() {
  const currentInputs = Array.from(
    document.querySelectorAll("#input-container .guess-row:last-child input")
  );

  // Create a mapping of input indices that correspond to valid letter positions
  const letterPositions = [...targetWord]
    .map((char, index) => (/[a-z]/i.test(char) ? index : -1))
    .filter((index) => index !== -1);

  const emptyIndexes = currentInputs
    .map((input, index) => (input.value === "" ? index : -1))
    .filter((index) => index !== -1);

  if (emptyIndexes.length === 0) {
    alert("No empty letters to fill!");
    return;
  }

  // Pick one random empty input index
  const randomEmptyIndex =
    emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

  // Map the input index to the correct letter index in targetWord
  const targetIndex = letterPositions[randomEmptyIndex];

  if (targetIndex === undefined) {
    alert("Could not determine correct letter position.");
    return;
  }

  const correctLetter = targetWord[targetIndex]?.toUpperCase();

  if (/[A-Z]/i.test(correctLetter)) {
    currentInputs[randomEmptyIndex].value = correctLetter;
  } else {
    alert("Target character is not a valid letter.");
  }
}
