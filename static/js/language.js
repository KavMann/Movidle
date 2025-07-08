document.addEventListener("DOMContentLoaded", () => {
  // Create and inject the modal HTML structure
  const modalHTML = `
      <div
        id="languageModal"
        class="fixed inset-0 hidden z-50 bg-black bg-opacity-80 flex items-center justify-center backdrop-blur-sm dark:bg-opacity-80 dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-gray-900 p-6 rounded-md w-96 relative text-white">
          <button
            id="closeLanguageModal"
            class="absolute top-2 right-2 text-white text-lg"
            aria-label="Close language modal"
          >
            &times;
          </button>
          <p class="mb-4">Enter language to pick movie language</p>
          <input
            type="text"
            id="language-input"
            placeholder="Enter custom language..."
            aria-label="Enter custom language"
            class="w-full mb-3 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            autofocus
            inputmode="text"
          />
          <button
            id="setLanguageButton"
            class="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded dark:bg-green-700 dark:hover:bg-green-600"
          >
            Set Language
          </button>
        </div>
      </div>
    `;

  // Append the modal to the body of the document
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Open modal button logic
  const openModalButton = document.getElementById("openLanguageModal");
  const closeModalButton = document.getElementById("closeLanguageModal");
  const languageModal = document.getElementById("languageModal");
  const setLanguageButton = document.getElementById("setLanguageButton");
  const languageInput = document.getElementById("language-input");

  // Open the modal
  openModalButton?.addEventListener("click", () => {
  languageModal?.classList.remove("hidden");

  setTimeout(() => {
  const input = document.getElementById("language-input");
  if (input) {
    input.focus();
    input.click(); // simulate user tap for Android
  }

  if (window.AndroidInterface?.triggerKeyboard) {
    window.AndroidInterface.triggerKeyboard();
  }
}, 150);
  });


  // Close the modal
  closeModalButton?.addEventListener("click", () => {
    languageModal?.classList.add("hidden");
  });

  // Close modal on ESC key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") languageModal?.classList.add("hidden");
  });

  // Close modal if clicked outside
  languageModal?.addEventListener("click", (e) => {
    if (e.target === languageModal) {
      languageModal.classList.add("hidden");
    }
  });

  window.currentLanguage = "english"; // default to English
  // Set language logic
  setLanguageButton?.addEventListener("click", () => {
    const customLanguage = languageInput.value.trim();
    if (!customLanguage) return;

    window.currentLanguage = customLanguage.toLowerCase();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    fetch(`/change_language?lang=${customLanguage}&is_mobile=${isMobile}`)
      .then((res) => res.json())
      .then((data) => {
        const newTitle = data.title;
        window.targetWord = newTitle.toUpperCase();
        console.log("New movie title:", window.targetWord);

        fetch(
          `/get_hints?title=${encodeURIComponent(
            newTitle
          )}&lang=${customLanguage}`
        )
          .then((res) => res.json())
          .then((hintData) => {
            window.gameHints = hintData.hints || [];
            console.log("New hints:", window.gameHints);
            resetGame();
            languageModal.classList.add("hidden"); // Close the modal
          })
          .catch((err) => {
            console.error("Error fetching hints:", err);
            window.gameHints = ["Could not load hints."];
            resetGame();
            languageModal.classList.add("hidden");
          });
      })

      .catch((err) => console.error("Error fetching movie title:", err));
  });

  // Reset the game
  function resetGame() {
    // Reset hint logic
    currentHint = 0;
    incorrectGuesses = 0;
    displayedHints = [];
    getHintButton.disabled = true;
    fillLetterButton.disabled = true;
    getHintButton.textContent = "Get Hint";

    const container = document.getElementById("input-container");
    if (!container) return console.error("input-container not found!");
    container.innerHTML = ""; // Clear old rows
    generateInputs(window.targetWord); // Regenerate inputs for the new word

    // Reset keyboard colors
    resetKeyboardColors();
  }

  function resetKeyboardColors() {
    if (typeof keyState === "object") {
      for (const key in keyState) {
        delete keyState[key];
      }
    }

    [...document.getElementsByClassName("key")].forEach((key) => {
      key.classList.remove("green", "yellow", "grey");
    });
  }

  // Load Lottie language icon animation
  const langIconContainer = document.getElementById("lottie-lang-icon");
  let langAnimation;
  const defaultLangFrame = 0;

  langAnimation = lottie.loadAnimation({
    container: langIconContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "/static/animations/language.json",
    initialSegment: [defaultLangFrame, defaultLangFrame],
  });

  openModalButton?.addEventListener("mouseenter", () => {
    langAnimation?.playSegments([1, 74], true);
  });

  openModalButton?.addEventListener("mouseleave", () => {
    langAnimation?.goToAndStop(defaultLangFrame, true);
  });
});
