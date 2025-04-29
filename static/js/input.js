function generateInputs(characterName) {
  const inputContainer = document.getElementById("input-container");

  if (!inputContainer) {
    console.error("input-container not found!");
    return;
  }

  const newRow = document.createElement("div");
  newRow.classList.add("guess-row");

  for (let i = 0; i < characterName.length; i++) {
    const char = characterName[i];

    if (char.match(/[A-Za-z]/)) {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("letter-input");
      input.maxLength = 1;
      input.id = `letter-${
        inputContainer.querySelectorAll("input").length + 1
      }`;
      input.placeholder = " ";
      newRow.appendChild(input);

      input.addEventListener("input", handleInput);
      input.addEventListener("keydown", handleKeyDown); // Handle keydown for validation
    } else {
      const span = document.createElement("span");
      span.classList.add("pre-filled");
      span.textContent = char;
      newRow.appendChild(span);
    }
  }

  inputContainer.appendChild(newRow);

  // Focus on the first input after adding inputs
  const firstInput = newRow.querySelector("input");
  if (firstInput) firstInput.focus();
}

function handleInput(event) {
  const currentInput = event.target;

  if (currentInput.value !== "") {
    let next = currentInput.nextElementSibling;
    while (next && next.tagName !== "INPUT") {
      next = next.nextElementSibling; // Skip over spans
    }
    if (next) next.focus();
  }
}

// Handle Backspace behavior
function handleBackspace(event) {
  const currentInput = event.target;

  let prev = currentInput.previousElementSibling;
  while (prev && prev.tagName !== "INPUT") {
    prev = prev.previousElementSibling; // Skip over spans
  }

  if (prev) {
    prev.focus(); // Focus on the previous input
    prev.value = ""; // Clear the current input
  }
}

// Validate key presses to ensure only allowed keys
function handleKeyDown(event) {
  const validKeys = [
    "Backspace",
    "Enter",
    ...Array.from(
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    ), // Only allow a-z, A-Z, 0-9
  ];

  // If the key is invalid, prevent the default behavior
  if (!validKeys.includes(event.key)) {
    event.preventDefault();
  }

  // Handle Backspace: remove character and focus previous input
  if (event.key === "Backspace") {
    event.preventDefault(); // Prevent default browser backspace behavior
    handleBackspace(event);
  }

  // Handle Enter: submit guess (or any other action)
  if (event.key === "Enter") {
    event.preventDefault();
    checkGuess(); // Your guess check function
  }
}

document.addEventListener("DOMContentLoaded", () => {
  generateInputs(targetWord); // Example usage
});
