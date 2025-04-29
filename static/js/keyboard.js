const layout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

let lastFocusedInput = null;

layout.forEach((row, rowIndex) => {
  const rowDiv = document.getElementById("row" + (rowIndex + 1));
  row.forEach((key) => {
    const keyButton = document.createElement("div");
    keyButton.classList.add("key");

    if (key === "ENTER" || key === "⌫") {
      keyButton.classList.add("special");
    }

    keyButton.innerText = key;

    keyButton.addEventListener("click", () => {
      handleKeyClick(key);
    });

    rowDiv.appendChild(keyButton);
  });
});

// Use this in input.js when creating input elements:
document.addEventListener("focusin", (event) => {
  if (event.target.tagName === "INPUT") {
    lastFocusedInput = event.target;
  }
});

function handleKeyClick(key) {
  if (!lastFocusedInput || lastFocusedInput.tagName !== "INPUT") return;

  const activeInput = lastFocusedInput;

  if (key === "⌫") {
    // Handle backspace
    let prev = activeInput.previousElementSibling;
    while (prev && prev.tagName !== "INPUT") {
      prev = prev.previousElementSibling; // Skip over spans
    }

    if (prev) {
      prev.focus(); // Focus on the previous input
      prev.value = "";
    } else {
      activeInput.focus(); // If no previous input, stay on the current input
    }
  } else if (key === "ENTER") {
    checkGuess();
  } else {
    activeInput.value = key;
    const inputs = Array.from(
      activeInput.closest(".guess-row").querySelectorAll("input")
    );
    const currentIndex = inputs.indexOf(activeInput);
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }
}
