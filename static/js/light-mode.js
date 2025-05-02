// Light-mode.js
document.addEventListener("DOMContentLoaded", function () {
  const lightModeStylesheet = document.getElementById("light-mode-css");

  const isLight = localStorage.getItem("mode") === "light";
  let isInLightMode = isLight;

  const animation = lottie.loadAnimation({
    container: document.getElementById("lottie-theme-icon"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "/static/animations/theme-toggle.json",
  });

  const DARK_MODE_FRAME = 274;
  const LIGHT_MODE_FRAME = 0;
  const FRAME_END = 481;

  animation.setSpeed(2); // 🔹 Double the speed

  animation.addEventListener("DOMLoaded", () => {
    if (isInLightMode) {
      animation.goToAndStop(LIGHT_MODE_FRAME, true);
      document.body.classList.add("light-mode");
      lightModeStylesheet.disabled = false;
    } else {
      animation.goToAndStop(DARK_MODE_FRAME, true);
      document.body.classList.remove("light-mode");
      lightModeStylesheet.disabled = true;
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    if (isInLightMode) {
      animation.playSegments([LIGHT_MODE_FRAME, DARK_MODE_FRAME], true);
      document.body.classList.remove("light-mode");
      lightModeStylesheet.disabled = true;
      localStorage.removeItem("mode");
    } else {
      animation.playSegments([DARK_MODE_FRAME, FRAME_END], true);
      document.body.classList.add("light-mode");
      lightModeStylesheet.disabled = false;
      localStorage.setItem("mode", "light");
    }

    isInLightMode = !isInLightMode;
  });
});
