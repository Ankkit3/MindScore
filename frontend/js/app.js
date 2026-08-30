/* ========================================================================
   MindScore — app.js
   View routing, navbar behavior, and top-level wiring.
   ======================================================================== */

let lastResult = null;

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => {
    v.hidden = v.dataset.view !== name;
  });
  window.scrollTo({ top: 0, behavior: "auto" });
  updateNavTheme(name);
}

function updateNavTheme(name) {
  const nav = document.getElementById("siteNav");
  nav.classList.toggle("on-hero", name === "landing" && window.scrollY < 80);
}

// -------------------------------------------------------------------------
// Navbar: scroll state + mobile menu + smooth in-page links
// -------------------------------------------------------------------------
function initNav() {
  const nav = document.getElementById("siteNav");
  const burger = document.getElementById("navBurger");
  const mobile = document.getElementById("navMobile");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    const landingVisible = !document.getElementById("view-landing").hidden;
    nav.classList.toggle("on-hero", landingVisible && window.scrollY < 80);
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  burger.addEventListener("click", () => {
    const open = mobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.dataset.navLink;
      mobile.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");

      if (target === "assessment") {
        e.preventDefault();
        startAssessmentFlow();
        return;
      }
      // home / how-it-works / about are anchors within the landing view
      if (document.getElementById("view-landing").hidden) {
        e.preventDefault();
        showView("landing");
        requestAnimationFrame(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
        });
      }
    });
  });

  document.querySelectorAll('[data-action="start-assessment"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      mobile.classList.remove("is-open");
      startAssessmentFlow();
    });
  });
}

function startAssessmentFlow() {
  showView("assessment");
  resetAssessment();
}

// -------------------------------------------------------------------------
// Submission flow: assessment -> loading -> results (or error toast)
// -------------------------------------------------------------------------
const LOADING_MESSAGES = [
  "Preparing your MindScore…",
  "Running the trained model…",
  "Weighing lifestyle and stress signals…",
  "Almost there…"
];

async function submitAssessment() {
  showView("loading");
  const loadingEl = document.getElementById("loadingMessage");
  let i = 0;
  const cycle = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    loadingEl.textContent = LOADING_MESSAGES[i];
  }, 1100);

  try {
    const result = await fetchPrediction(AssessmentState.data);
    lastResult = result;
    clearInterval(cycle);
    renderResults(result);
    showView("results");
  } catch (err) {
    clearInterval(cycle);
    showView("assessment");
    goToStep(4);
    showErrorToast(err instanceof ApiError ? err.message : ERROR_MESSAGES.network);
  }
}

// -------------------------------------------------------------------------
// Error toast
// -------------------------------------------------------------------------
let toastTimer = null;
function showErrorToast(message) {
  const toast = document.getElementById("errorToast");
  document.getElementById("errorToastText").textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 6000);
}

function initToast() {
  document.getElementById("errorToastClose").addEventListener("click", () => {
    document.getElementById("errorToast").hidden = true;
  });
}

// -------------------------------------------------------------------------
// Results actions
// -------------------------------------------------------------------------
function initResultsActions() {
  document.getElementById("btnRetake").addEventListener("click", () => {
    showView("assessment");
    renderStep();
  });
  document.getElementById("btnStartOver").addEventListener("click", startAssessmentFlow);
  document.getElementById("btnDownload").addEventListener("click", () => {
    if (lastResult) downloadReport(lastResult);
  });
  document.getElementById("btnPrint").addEventListener("click", () => window.print());
}

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initAssessment();
  initToast();
  initResultsActions();
  showView("landing");
});
