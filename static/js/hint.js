const hints = window.gameHints;
const helpToggle = document.getElementById("help-toggle");
const hintDropdown = document.getElementById("hintDropdown");
const getHintButton = document.getElementById("getHintButton");
const fillLetterButton = document.getElementById("fillLetterButton");
const helpIconContainer = document.getElementById("lottie-help-icon");
const defaultFrame = 120; // Define the default frame

let currentHint = 0;
let incorrectGuesses = 0;
let displayedHints = [];
let helpAnimation = null;

getHintButton.disabled = true;
fillLetterButton.disabled = true;

function registerGuess(isCorrect) {
  if (!isCorrect) {
    incorrectGuesses++;
    updateHintButtonState();
  }
}

function updateHintButtonState() {
  if (incorrectGuesses < 2) {
    getHintButton.disabled = true;
    fillLetterButton.disabled = true;
  } else {
    getHintButton.disabled = false;
    fillLetterButton.disabled = false;
  }
}

function showHintModal(content) {
  if (!content) {
    console.warn("hint.js:    showHintModal called with empty content!");
  }

  displayedHints.push(content);

  const box = document.createElement("div");
  box.className = "hint-box";
  let hintList = displayedHints.map((hint) => `<p>${hint}</p>`).join("");
  box.innerHTML = `
        <div class="hint-content">
            ${hintList}
            <button id="closeHintButton">OK</button>
        </div>
    `;
  document.body.appendChild(box);

  const closeButton = document.getElementById("closeHintButton");
  closeButton.addEventListener("click", closeHintModal);
}

function closeHintModal() {
  const box = document.querySelector(".hint-box");
  if (box) {
    box.remove();
  }
}

function loadHelpAnimation() {
  helpAnimation = lottie.loadAnimation({
    container: helpIconContainer,
    renderer: "svg",
    loop: false, // Set loop to false for a single play on hover
    autoplay: false,
    path: "/static/animations/help.json", // Corrected path
    initialSegment: [defaultFrame, defaultFrame], // Set initial frame
  });
}

loadHelpAnimation();

helpToggle.addEventListener("mouseenter", () => {
  if (helpAnimation) {
    helpAnimation.playSegments([1, 120], true); // Play from frame 1 to 120 once
  }
});

helpToggle.addEventListener("mouseleave", () => {
  if (helpAnimation) {
    helpAnimation.goToAndStop(defaultFrame, true); // Go back to the default frame
  }
});

getHintButton.addEventListener("click", () => {
  if (currentHint < hints.length && currentHint < incorrectGuesses) {
    showHintModal(hints[currentHint]);
    currentHint++;
    updateHintButtonState();
    if (currentHint >= hints.length) {
      getHintButton.disabled = true;
      getHintButton.textContent = "No more hints";
    }
  }
  hintDropdown.classList.remove("show");
});

fillLetterButton.addEventListener("click", () => {
  fillRandomLetter();
  fillLetterButton.disabled = true;
  getHintButton.disabled = true;
  hintDropdown.classList.remove("show");
});

// Keep the click event to toggle the dropdown
helpToggle.addEventListener("click", () => {
  hintDropdown.classList.toggle("show");
});

window.addEventListener("click", (event) => {
  if (
    !event.target.matches(".dropbtn") &&
    !event.target.matches("#getHintButton") &&
    !event.target.matches("#fillLetterButton")
  ) {
    if (hintDropdown.classList.contains("show")) {
      hintDropdown.classList.remove("show");
    }
  }
});

updateHintButtonState();
