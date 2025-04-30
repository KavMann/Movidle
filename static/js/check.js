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
      () => showPlayAgainModal(updateStreak(true)),
      word.length * 300 + 600
    );
    return;
  }

  if (document.querySelectorAll(".guess-row").length > 5) {
    showEndMessage(`No more guesses! The movie was:\n${targetWord}`);
    revealAnswer(targetWord.toLowerCase());
    setTimeout(
      () => showNextTimeModal(updateStreak(false)),
      word.length * 300 + 600
    );
    return;
  }

  createNewRow();
}

function revealAnswer(answer) {
  const row = document.createElement("div");
  row.className = "guess-row";

  for (const char of answer) {
    const el = /[A-Za-z]/.test(char)
      ? Object.assign(document.createElement("input"), {
          type: "text",
          className: "letter-input green",
          value: char.toUpperCase(),
          disabled: true,
        })
      : Object.assign(document.createElement("span"), {
          className: "pre-filled",
          textContent: char,
        });
    row.appendChild(el);
  }

  document.getElementById("input-container").appendChild(row);
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

  setTimeout(() => generateInputs(targetWord), targetWord.length * 300 + 600);
}

function showEndMessage(msg) {
  const box = document.createElement("div");
  box.className = "message-box";
  box.innerText = msg;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function showPlayAgainModal(streak) {
  showModal(
    "🎉 Congratulations!",
    `Come back tomorrow for a new movie!<br><strong>Current Streak:</strong> ${streak} 🔥`
  );
}

function showNextTimeModal(streak) {
  showModal(
    "💔 Unlucky! Next Time",
    `Come back tomorrow for a new movie!<br><strong>Current Streak:</strong> ${streak} 🔥`
  );
}

function showModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "play-again-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${content}</p>
      <button onclick="closeModal()">OK</button>
    </div>`;
  document.body.appendChild(modal);
}

function closeModal() {
  document.querySelector(".play-again-modal")?.remove();
}
