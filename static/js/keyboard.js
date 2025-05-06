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
    flex items-center justify-center select-none
    font-bold text-white text-sm sm:text-base
    rounded-md shadow transition transform
    ${
      ["↵", "⌫"].includes(key)
        ? "flex-[1.5] max-w-[100px] text-lg bg-neutral-600 hover:bg-neutral-700"
        : "flex-1 min-w-[36px] max-w-[65px] aspect-[1/1.3] bg-neutral-500 hover:bg-neutral-600"
    }
  `;
  btn.className += " touch-manipulation";
  btn.textContent = key;
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
