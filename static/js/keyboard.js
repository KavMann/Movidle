// keyboard.js
const layout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

let lastFocusedInput = null;

const createKeyButton = (key) => {
  const btn = document.createElement("div");
  if (key === "ENTER") {
    btn.className = "key special1";
  } else if (key === "⌫") {
    btn.className = "key special2";
  } else {
    btn.className = "key";
  }
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
  } else if (key === "ENTER") {
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
