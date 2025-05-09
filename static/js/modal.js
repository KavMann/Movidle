// modal.js

// howto.js

document.addEventListener("DOMContentLoaded", () => {
  const howtoIconContainer = document.getElementById("lottie-howto-icon");
  let howtoAnimation;
  const defaultFrame = 61; // Define the default frame

  function loadHowtoAnimation() {
    howtoAnimation = lottie.loadAnimation({
      container: howtoIconContainer,
      renderer: "svg",
      loop: false, // Ensure it doesn't loop
      autoplay: false,
      path: "/static/animations/howto.json", // Adjust path if needed
      initialSegment: [defaultFrame, defaultFrame], // Start and stop at defaultFrame
    });
  }

  loadHowtoAnimation(); // Initialize the animation

  howtoIconContainer.addEventListener("mouseenter", () => {
    if (howtoAnimation) {
      howtoAnimation.playSegments([0, 61], true); // Play from defaultFrame to 120
      howtoIconContainer.style.transform = "scale(1.2)"; // Scale on hover (optional)
    }
  });

  howtoIconContainer.addEventListener("mouseleave", () => {
    if (howtoAnimation) {
      howtoAnimation.goToAndStop(defaultFrame, true); // Go back to defaultFrame
      howtoIconContainer.style.transform = "scale(1)"; // Reset scale (optional)
    }
  });
});

function showModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "play-again-modal";
  modal.innerHTML = `
        <div class="modal-content">
          <h2>${title}</h2>
          <p>${content}</p>
          <div class="modal-button-wrapper">
          <button id="closeModalButton">OK</button>
        </div>
        </div>
    `;
  document.body.appendChild(modal);

  const closeModalButton = document.getElementById("closeModalButton");
  closeModalButton.addEventListener("click", closeModal);
}

function closeModal() {
  document.querySelector(".play-again-modal")?.remove();
}

function showhowModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "how-to-modal";
  modal.innerHTML = `
      <div class="modal-content">
        <h2 style="font-size: 25px">${title}</h2>
        <p>${content}</p>
        <div class="modal-button-wrapper">
          <button id="closeModalButton">OK</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  const closeModalButton = document.getElementById("closeModalButton");
  closeModalButton.addEventListener("click", closeModall);
}

function closeModall() {
  document.querySelector(".how-to-modal")?.remove();
}

function showEndMessage(msg, wordLength) {
  const box = document.createElement("div");
  box.className = "message-box";
  box.innerHTML = msg;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), wordLength * 300 + 500);
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

function showHowToPlayModal() {
  const howToPlayTitle = "How To Play Movidle";
  const howToPlayContent = `<br>
        Guess the movie in 6 tries.<br>
        - Each guess must be a valid movie title/word.<br>
        - Hit the enter button to submit.<br>
        - After each guess, the color of the tiles will change to show how close your guess was to the movie.
        <br><br>
        <b>Examples</b><br>
        F is in the title and in the correct spot.<br>
        <div class="example-row">
            <span class="list-example flip green">F</span>
            <span class="list-example">I</span>
            <span class="list-example">G</span>
            <span class="list-example">H</span>
            <span class="list-example">T</span>
        </div><br>
        V is in the title but in the wrong spot.<br>
        <div class="example-row">
            <span class="list-example">A</span>
            <span class="list-example flip yellow">V</span>
            <span class="list-example">A</span>
            <span class="list-example">T</span>
            <span class="list-example">A</span>
        </div><br>
        N is not in the title in any spot.<br>
        <div class="example-row">
            <span class="list-example">T</span>
            <span class="list-example">I</span>
            <span class="list-example">T</span>
            <span class="list-example">A</span>
            <span class="list-example flip grey">N</span>
        </div><br><br>

    <b>Additional Features</b><br>
    <!-- Language button description -->
<div class="inline-flex items-center mb-2">
  <img src="/static/animations/language.gif" alt="Language icon" style="width: 35px; height: 35px; margin-right: 8px;" />
  <span>This button allows you to change the language in order to get language/region-specific titles.</span>
</div><br>

<!-- Hint button description -->
<div class="inline-flex items-center mb-2">
  <img src="/static/animations/hint.gif" alt="Hint icon" style="width: 35px; height: 35px; margin-right: 8px;" />
  <span>Click this button for a hint related to the movie title you are guessing.</span>
</div>

  `;
  showhowModal(howToPlayTitle, howToPlayContent);
}

// Show the How to Play modal on page load
document.addEventListener("DOMContentLoaded", showHowToPlayModal);

const howToPlayButtonElement = document.getElementById("howToPlayButton");
if (howToPlayButtonElement) {
  howToPlayButtonElement.addEventListener("click", showHowToPlayModal);
}

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const howToBtn = document.getElementById("howToPlayButton");
  const mobilePlaceholder = document.getElementById("mobile-howto-placeholder");

  if (isMobile && howToBtn && mobilePlaceholder) {
    mobilePlaceholder.appendChild(howToBtn); // Move the button into the dropdown
  }
});
