const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".nav-dot"));
const overviewButtons = Array.from(document.querySelectorAll("[data-target]"));
const currentIndex = document.getElementById("currentIndex");
const totalIndex = document.getElementById("totalIndex");
const overviewPanel = document.getElementById("overviewPanel");
const overviewToggle = document.getElementById("overviewToggle");
const overviewClose = document.getElementById("overviewClose");

let activeSlideId = slides[0]?.id || "";

totalIndex.textContent = String(slides.length).padStart(2, "0");

const formatIndex = (value) => String(value).padStart(2, "0");

const setActiveSlide = (slideId) => {
  activeSlideId = slideId;

  slides.forEach((slide, index) => {
    if (slide.id === slideId) {
      currentIndex.textContent = formatIndex(index + 1);
    }
  });

  dots.forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.target === slideId);
  });
};

const goToSlide = (slideId) => {
  const target = document.getElementById(slideId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveSlide(slideId);
  closeOverview();
};

const openOverview = () => {
  overviewPanel.classList.add("open");
  overviewPanel.setAttribute("aria-hidden", "false");
};

const closeOverview = () => {
  overviewPanel.classList.remove("open");
  overviewPanel.setAttribute("aria-hidden", "true");
};

const navigateRelative = (delta) => {
  const current = slides.findIndex((slide) => slide.id === activeSlideId);
  const nextIndex = Math.max(0, Math.min(slides.length - 1, current + delta));
  goToSlide(slides[nextIndex].id);
};

dots.forEach((dot) => {
  dot.addEventListener("click", () => goToSlide(dot.dataset.target));
});

overviewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    if (target) goToSlide(target);
  });
});

overviewToggle.addEventListener("click", () => {
  if (overviewPanel.classList.contains("open")) {
    closeOverview();
  } else {
    openOverview();
  }
});

overviewClose.addEventListener("click", closeOverview);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOverview();
    return;
  }

  if (event.key === "o" || event.key === "O") {
    event.preventDefault();
    if (overviewPanel.classList.contains("open")) {
      closeOverview();
    } else {
      openOverview();
    }
    return;
  }

  if (["ArrowDown", "PageDown", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    navigateRelative(1);
  }

  if (["ArrowUp", "PageUp", "ArrowLeft"].includes(event.key)) {
    event.preventDefault();
    navigateRelative(-1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToSlide(slides[0].id);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToSlide(slides[slides.length - 1].id);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
        setActiveSlide(entry.target.id);
      }
    });
  },
  {
    threshold: [0.55, 0.75],
  }
);

slides.forEach((slide) => observer.observe(slide));

document.addEventListener("click", (event) => {
  if (!overviewPanel.classList.contains("open")) return;
  const clickedInsidePanel = overviewPanel.contains(event.target);
  const clickedToggle = overviewToggle.contains(event.target);
  if (!clickedInsidePanel && !clickedToggle) {
    closeOverview();
  }
});

setActiveSlide(activeSlideId);
