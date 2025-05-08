// keyboard.js
const layout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["↵", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

let lastFocusedInput = null;

const createKeyButton = (key) => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute(
    "aria-label",
    key === "↵" ? "Enter" : key === "⌫" ? "Delete" : `Letter ${key}`
  );
  btn.className = `
    key flex items-center justify-center select-none
    font-bold text-white text-sm sm:text-base
    rounded-md shadow transition transform
    ${
      ["↵", "⌫"].includes(key)
        ? "flex-[1.5] max-w-[100px] aspect-[1.5/1] text-lg bg-neutral-600 hover:bg-neutral-700"
        : "flex-1 min-w-[36px] max-w-[65px] aspect-[1/1.3] bg-neutral-500 hover:bg-neutral-600"
    }
  `;
  btn.className +=
    " touch-manipulation focus:outline focus:outline-2 focus:outline-yellow-400";

  // Add icon or letter
  if (key === "↵") {
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 7v4H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21V7z"/>
      </svg>
    `;
  } else if (key === "⌫") {
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
      </svg>
    `;
  } else {
    btn.textContent = key;
  }

  btn.addEventListener("click", () => handleKeyClick(key));
  return btn;
};

layout.forEach((row, rowIndex) => {
  const rowDiv = document.getElementById(`row${rowIndex + 1}`);
  row.forEach((key) => rowDiv.appendChild(createKeyButton(key)));
});

document.addEventListener("focusin", (e) => {
  if (e.target.tagName === "INPUT") lastFocusedInput = e.target;
});

function handleKeyClick(key) {
  if (!lastFocusedInput || lastFocusedInput.tagName !== "INPUT") return;

  const row = lastFocusedInput.closest(".guess-row");
  const inputs = Array.from(row.querySelectorAll("input"));
  const currentIndex = inputs.indexOf(lastFocusedInput);

  if (key === "⌫") {
    lastFocusedInput.value = "";
    const prev = findPreviousInput(lastFocusedInput);
    if (prev) {
      prev.focus();
      prev.value = "";
    }
  } else if (key === "↵") {
    const allFilled = inputs.every((input) => input.value.trim() !== "");
    allFilled
      ? checkGuess()
      : alert("Please fill in all letters before submitting.");
  } else {
    lastFocusedInput.value = key;
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }
}

function findPreviousInput(el) {
  let prev = el.previousElementSibling;
  while (prev && prev.tagName !== "INPUT") {
    prev = prev.previousElementSibling;
  }
  return prev;
}
