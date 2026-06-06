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
const workGrid = document.getElementById("work-grid");

const projects = [
  {
    title: "Simpli Studio Launch",
    description:
      "A clean identity anchor built to introduce the studio with clarity and confidence.",
    image: "assets/Logo-1.png",
    alt: "Simpli Studio launch project tile",
    size: "square",
    modalWriter: "Simpli Studio",
    modalContent:
      "A foundational launch project built to establish Simpli Studio's visual and editorial direction. We defined a calm, modern identity system, built baseline social content templates, and created a sustainable content cadence that helped early clients communicate with consistency and clarity.",
  },
  {
    title: "Project Bloome",
    description:
      "Fresh homemade donuts presented through a clean, product-forward visual system.",
    image: "assets/Frame 1 final fix.png",
    alt: "Project Bloome donut presentation",
    size: "wide",
    modalWriter: "Creative Team",
    modalContent:
      "For Bloome, we translated a handcrafted product story into a clean visual campaign. The scope covered content planning, product-focused photography direction, and short-form social rollouts designed to feel warm, fresh, and highly shareable.",
  },
  {
    title: "Website Menu Study",
    description:
      "A close-up look at the website menu page, framed for clean navigation and brand consistency.",
    image: "assets/website.png",
    alt: "Website menu page project tile",
    size: "wide",
    modalWriter: "Web Experience",
    modalContent:
      "A detailed UI study of the website menu page, focused on clarity, hierarchy, and smooth navigation flow. The composition highlights how the interface supports a polished brand experience while keeping the layout simple and easy to scan.",
  },
];

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

function isValidImageString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createWorkTile(project) {
  const tile = document.createElement("article");
  tile.className = "work-tile reveal";
  tile.setAttribute("role", "button");
  tile.setAttribute("tabindex", "0");
  tile.setAttribute("aria-haspopup", "dialog");
  tile.dataset.modalTitle = project.title;
  tile.dataset.modalContent = project.modalContent || project.description;
  tile.dataset.modalWriter = project.modalWriter || "Simpli Studio";

  const media = document.createElement("div");
  media.className = "work-tile__media";
  if (project.size) media.dataset.size = project.size;

  const image = document.createElement("img");
  image.src = project.image;
  image.alt = project.alt || project.title;
  image.loading = "lazy";

  media.appendChild(image);

  const meta = document.createElement("div");
  meta.className = "work-tile__meta";

  const title = document.createElement("span");
  title.className = "serif";
  title.textContent = project.title;

  const description = document.createElement("span");
  description.className = "muted";
  description.textContent = project.description;

  meta.append(title, description);
  tile.append(media, meta);

  return tile;
}

function initWorkGrid() {
  if (!workGrid) return;

  workGrid.innerHTML = "";

  const validProjects = projects.filter((project) => isValidImageString(project.image));
  validProjects.forEach((project) => {
    workGrid.appendChild(createWorkTile(project));
  });
}

/* ---------- Work detail modal ---------- */
function initWorkModal() {
  const workModal = document.getElementById("workModal");
  if (!workModal) return;

  const modalTitle = document.getElementById("workModalTitle");
  const modalContent = document.getElementById("workModalContent");
  const modalWriter = document.getElementById("workModalWriter");
  const closeButton = document.getElementById("workModalClose");
  const grid = document.getElementById("work-grid");

  if (!modalTitle || !modalContent || !modalWriter || !closeButton || !grid) {
    return;
  }

  let activeTile = null;
  let closeTimer = null;

  function setModalData(tile) {
    const fallbackTitle = tile.querySelector(".work-tile__meta .serif")?.textContent?.trim() || "Project details";
    const fallbackContent = tile.querySelector(".work-tile__meta .muted")?.textContent?.trim() || "";

    modalTitle.textContent = (tile.dataset.modalTitle || fallbackTitle).trim();
    modalContent.textContent = (tile.dataset.modalContent || fallbackContent).trim();
    modalWriter.textContent = `Writer / ${tile.dataset.modalWriter || "Simpli Studio"}`;
  }

  function clearCloseTimer() {
    if (!closeTimer) return;
    clearTimeout(closeTimer);
    closeTimer = null;
  }

  function openModal(tile) {
    clearCloseTimer();
    activeTile = tile;
    setModalData(tile);

    workModal.hidden = false;
    document.body.classList.add("modal-open");

    requestAnimationFrame(() => {
      workModal.classList.add("is-open");
      closeButton.focus();
    });
  }

  function closeModal() {
    if (workModal.hidden) return;

    workModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    clearCloseTimer();
    closeTimer = window.setTimeout(() => {
      workModal.hidden = true;
      if (activeTile) activeTile.focus();
      activeTile = null;
    }, 500);
  }

  grid.addEventListener("click", (event) => {
    const tile = event.target.closest(".work-tile");
    if (!tile) return;
    openModal(tile);
  });

  grid.addEventListener("keydown", (event) => {
    const tile = event.target.closest(".work-tile");
    if (!tile) return;

    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openModal(tile);
  });

  workModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]") || event.target === closeButton || event.target.closest("#workModalClose")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

/* Init */
requireGateOrRedirect();
initTheme();
initThemeToggle();
initMobileMenu();
initGatedLinks();
initWorkGrid();
initRevealAnimations();
initWorkModal();