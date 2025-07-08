// input.js
// Function to check if the device is mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function generateInputs(word) {
  const container = document.getElementById("input-container");
  if (!container) return console.error("input-container not found!");

  const row = document.createElement("div");
  row.className = "guess-row";

  const isMobile = isMobileDevice(); // Check if device is mobile

  [...word].forEach((char) => {
    if (/[A-Za-z]/.test(char)) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "letter-input";
      input.maxLength = 1;
      input.placeholder = " ";
      input.id = `letter-${container.querySelectorAll("input").length + 1}`;

      // Set readOnly based on device type
      input.readOnly = isMobile; // Set to true if mobile, false if desktop

      input.addEventListener("input", handleInput);
      input.addEventListener("keydown", handleKeyDown);

      row.appendChild(input);
    } else {
      const span = document.createElement("span");
      span.className = "pre-filled";
      span.textContent = char;
      row.appendChild(span);
    }
  });

  container.appendChild(row);
  row.querySelector("input")?.focus();
}

function handleInput(e) {
  const inputs = Array.from(
    e.target.closest(".guess-row").querySelectorAll("input")
  );
  const currentIndex = inputs.indexOf(e.target);

  if (e.target.value) {
    for (let i = currentIndex + 1; i < inputs.length; i++) {
      if (!inputs[i].value) {
        inputs[i].focus();
        break;
      }
    }
  }
}

function handleBackspace(e) {
  e.target.value = "";
  const prev = findPreviousInput(e.target);
  if (prev) {
    prev.focus();
    prev.value = "";
  } else if (!next) prev.focus();
}

function handleKeyDown(e) {
  const isLetter = /^[a-zA-Z]$/.test(e.key);
  const isControl = ["Backspace", "Enter"].includes(e.key);

  if (!isLetter && !isControl) return e.preventDefault();

  if (e.key === "Backspace") {
    e.preventDefault();
    handleBackspace(e);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const row = e.target.closest(".guess-row");
    const allFilled = [...row.querySelectorAll("input")].every(
      (input) => input.value.trim() !== ""
    );
    allFilled
      ? checkGuess()
      : alert("Please fill in all letters before submitting.");
  }
}

function findPreviousInput(el) {
  let prev = el.previousElementSibling;
  while (prev && prev.tagName !== "INPUT") prev = prev.previousElementSibling;
  return prev;
}

function findNextInput(el) {
  let next = el.nextElementSibling;
  while (next && next.tagName !== "INPUT") next = next.nextElementSibling;
  return next;
}

document.addEventListener("DOMContentLoaded", () => generateInputs(targetWord));

document.addEventListener("click", (e) => {
  // ⛔ Exit if language modal is open
  const modal = document.getElementById("languageModal");
  if (modal && !modal.classList.contains("hidden")) {
    e.stopPropagation(); // ✅ block further bubbling
    return;
  }

  // Ignore clicks on modals, buttons inside modals, or other focusable elements
  const ignoredSelectors = [
    ".play-again-modal",
    ".play-again-modal *",
    ".message-box",
    "a",
    "input", // Don't refocus if user clicked on an input
    ".key", // Allow focusing even when user clicks keyboard buttons if needed
    "#language-toggle",
    "#languageDropdown",
  ];

  for (const selector of ignoredSelectors) {
    if (e.target.closest(selector)) return;
  }

  // Focus the first empty input in the last guess row, or last input if all are filled
  const activeRow = document.querySelector(
    "#input-container .guess-row:last-child"
  );
  if (!activeRow) return;

  const inputs = activeRow.querySelectorAll("input");
  const emptyInput = [...inputs].find((input) => input.value === "");

  (emptyInput || inputs[inputs.length - 1])?.focus();
});
