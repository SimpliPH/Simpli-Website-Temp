// Simpli Studio — Theme + Menu + Reveal + Page Gate

const STORAGE_KEY = "simpli-theme";
const GATE_KEY = "simpli-allow-page";

const logos = {
  light: "assets/Logo-1.png",
  dark: "assets/Logo-2.png",
};

const htmlEl = document.documentElement;
const logoEl = document.getElementById("siteLogo");

const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function getTheme() {
  return htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  htmlEl.setAttribute("data-theme", next);

  if (logoEl) logoEl.src = logos[next];

  if (themeToggle) {
    const pressed = next === "dark";
    themeToggle.setAttribute("aria-pressed", String(pressed));
    themeToggle.title = pressed ? "Switch to light mode" : "Switch to dark mode";
  }

  localStorage.setItem(STORAGE_KEY, next);
}

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
    return;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(prefersDark ? "dark" : "light");
}

function initThemeToggle() {
  if (!themeToggle) return;
  themeToggle.addEventListener("click", () => {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

function setMenuOpen(open) {
  if (!mobileMenu || !menuToggle) return;

  mobileMenu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

function initMobileMenu() {
  if (!mobileMenu || !menuToggle) return;

  setMenuOpen(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });
}

/* ---------- Page gate (soft lock) ---------- */
function allowPageOnce() {
  sessionStorage.setItem(GATE_KEY, "1");
}

function requireGateOrRedirect() {
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file === "" || file === "index.html") return;

  const allowed = sessionStorage.getItem(GATE_KEY) === "1";
  if (!allowed) {
    location.replace("index.html");
    return;
  }

  // Consume pass
  sessionStorage.removeItem(GATE_KEY);
}

function initGatedLinks() {
  document.querySelectorAll("a.gated-link").forEach((a) => {
    a.addEventListener("click", () => allowPageOnce());
  });
}

/* ---------- Reveal animations ---------- */
function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* Init */
requireGateOrRedirect();
initTheme();
initThemeToggle();
initMobileMenu();
initGatedLinks();
initRevealAnimations();