
const COUNTRIES = [
  { name: "India", flag: "🇮🇳" },
  { name: "USA", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "UK", flag: "🇬🇧" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "France", flag: "🇫🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "China", flag: "🇨🇳" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Other", flag: "🌐" }
];

const TOTAL_STEPS = 5;

const AssessmentState = {
  data: {
    age: "", gender: "", country: "", academicLevel: "",
    platform: "", purpose: "", dailyUsageHours: 0, dailyUnlocks: "",
    studyHours: 0, activityHours: 0, sleepHours: 0, stressLevel: ""
  },
  step: 1
};

const STEP_FIELDS = {
  1: ["age", "gender", "country", "academicLevel"],
  2: ["platform", "purpose", "dailyUsageHours", "dailyUnlocks"],
  3: ["studyHours", "activityHours", "sleepHours"],
  4: ["stressLevel"]
};

const FIELD_LABELS = {
  age: "Age", gender: "Gender", country: "Country", academicLevel: "Academic level",
  platform: "Platform", purpose: "Purpose of use", dailyUsageHours: "Daily usage hours",
  dailyUnlocks: "Daily unlocks", studyHours: "Study hours", activityHours: "Physical activity hours",
  sleepHours: "Sleep hours", stressLevel: "Stress level"
};

function resetAssessment() {
  AssessmentState.data = {
    age: "", gender: "", country: "", academicLevel: "",
    platform: "", purpose: "", dailyUsageHours: 0, dailyUnlocks: "",
    studyHours: 0, activityHours: 0, sleepHours: 0, stressLevel: ""
  };
  AssessmentState.step = 1;
  document.getElementById("assessmentForm").reset();
  document.querySelectorAll(".choice-pill.is-selected, .stress-card.is-selected")
    .forEach((el) => el.classList.remove("is-selected"));
  document.querySelectorAll(".slider").forEach((wrap) => {
    const input = wrap.querySelector("input[type=range]");
    input.value = 0;
    wrap.querySelector("output").textContent = "0.0 hrs";
  });
  document.getElementById("countryTriggerLabel").textContent = "Select your country";
  document.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
  renderStep();
}


function renderStep() {
  document.querySelectorAll("fieldset.step").forEach((fs) => {
    fs.hidden = Number(fs.dataset.step) !== AssessmentState.step;
  });

  document.getElementById("stepLabel").textContent = `STEP ${AssessmentState.step} OF ${TOTAL_STEPS}`;
  document.getElementById("stepPercent").textContent = `${Math.round((AssessmentState.step / TOTAL_STEPS) * 100)}%`;
  document.getElementById("progressFill").style.width = `${(AssessmentState.step / TOTAL_STEPS) * 100}%`;

  const dots = document.getElementById("progressDots");
  dots.innerHTML = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement("span");
    if (i < AssessmentState.step) dot.classList.add("is-done");
    if (i === AssessmentState.step) dot.classList.add("is-active");
    dots.appendChild(dot);
  }

  document.getElementById("btnBack").hidden = AssessmentState.step === 1;
  document.getElementById("btnContinue").hidden = AssessmentState.step === TOTAL_STEPS;
  document.getElementById("btnSubmit").hidden = AssessmentState.step !== TOTAL_STEPS;

  if (AssessmentState.step === TOTAL_STEPS) renderReview();

  document.getElementById("assessment").scrollIntoView({ block: "start", behavior: "smooth" });
}

function goNext() {
  if (!validateStep(AssessmentState.step)) return;
  if (AssessmentState.step < TOTAL_STEPS) {
    AssessmentState.step += 1;
    renderStep();
  }
}

function goBack() {
  if (AssessmentState.step > 1) {
    AssessmentState.step -= 1;
    renderStep();
  }
}

function goToStep(step) {
  AssessmentState.step = step;
  renderStep();
}


function setFieldError(fieldWrapper, message) {
  fieldWrapper.classList.toggle("has-error", Boolean(message));
  const errorEl = fieldWrapper.querySelector(".field__error");
  if (errorEl) errorEl.textContent = message || "";
}

function validateStep(step) {
  let valid = true;

  if (step === 1) {
    const age = document.getElementById("f-age");
    const ageField = age.closest(".field");
    const ageVal = Number(age.value);
    if (!age.value || ageVal < 10 || ageVal > 100) {
      setFieldError(ageField, "Enter an age between 10 and 100.");
      valid = false;
    } else { setFieldError(ageField, ""); AssessmentState.data.age = ageVal; }

    valid = validateChoiceGroup("gender", "Please select a gender.") && valid;
    valid = validateChoiceGroup("academicLevel", "Please select an academic level.") && valid;

    const countryField = document.getElementById("f-country").closest(".field");
    if (!AssessmentState.data.country) {
      setFieldError(countryField, "Please select your country.");
      valid = false;
    } else setFieldError(countryField, "");
  }

  if (step === 2) {
    const platform = document.getElementById("f-platform");
    const platformField = platform.closest(".field");
    if (!platform.value) {
      setFieldError(platformField, "Please choose a platform.");
      valid = false;
    } else { setFieldError(platformField, ""); AssessmentState.data.platform = platform.value; }

    valid = validateChoiceGroup("purpose", "Please select a purpose.") && valid;

    const unlocks = document.getElementById("f-unlocks");
    const unlocksField = unlocks.closest(".field");
    if (unlocks.value === "" || Number(unlocks.value) < 0) {
      setFieldError(unlocksField, "Enter a number of 0 or more.");
      valid = false;
    } else { setFieldError(unlocksField, ""); AssessmentState.data.dailyUnlocks = Number(unlocks.value); }
  }

  if (step === 3) {
    // sliders are always within range by construction; nothing to reject
    ["studyHours", "activityHours", "sleepHours"].forEach((key) => {
      AssessmentState.data[key] = Number(document.querySelector(`[data-slider="${key}"] input`).value);
    });
  }

  if (step === 4) {
    valid = validateChoiceGroup("stressLevel", "Please select a stress level.") && valid;
  }

  return valid;
}

function validateChoiceGroup(fieldKey, message) {
  const group = document.querySelector(`[data-field="${fieldKey}"]`);
  const field = group.closest(".field");
  if (!AssessmentState.data[fieldKey]) {
    setFieldError(field, message);
    return false;
  }
  setFieldError(field, "");
  return true;
}


function initChoiceGroups() {
  document.querySelectorAll("[data-field]").forEach((group) => {
    const key = group.dataset.field;
    const isStress = group.classList.contains("stress-cards");
    const selector = isStress ? ".stress-card" : ".choice-pill";
    group.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(selector).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        AssessmentState.data[key] = btn.dataset.value;
        setFieldError(group.closest(".field"), "");
      });
    });
  });
}

function initSliders() {
  document.querySelectorAll(".slider").forEach((wrap) => {
    const key = wrap.dataset.slider;
    const input = wrap.querySelector("input[type=range]");
    const output = wrap.querySelector("output");
    const update = () => {
      const val = Number(input.value).toFixed(1);
      output.textContent = `${val} hrs`;
      AssessmentState.data[key] = Number(val);
    };
    input.addEventListener("input", update);
    update();
  });
}

function initAgeAndUnlocks() {
  document.getElementById("f-age").addEventListener("input", (e) => {
    AssessmentState.data.age = e.target.value;
  });
  document.getElementById("f-unlocks").addEventListener("input", (e) => {
    AssessmentState.data.dailyUnlocks = e.target.value;
  });
  document.getElementById("f-platform").addEventListener("change", (e) => {
    AssessmentState.data.platform = e.target.value;
  });
}

function initCountrySelect() {
  const trigger = document.getElementById("countryTrigger");
  const panel = document.getElementById("countryPanel");
  const search = document.getElementById("countrySearch");
  const list = document.getElementById("countryList");
  const hidden = document.getElementById("f-country");
  const label = document.getElementById("countryTriggerLabel");
  const wrap = document.getElementById("countrySelect");

  function renderList(filter = "") {
    const q = filter.trim().toLowerCase();
    const matches = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
    list.innerHTML = "";
    if (matches.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No matches";
      li.style.color = "var(--ink-400)";
      list.appendChild(li);
      return;
    }
    matches.forEach((c) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.tabIndex = 0;
      li.innerHTML = `<span aria-hidden="true">${c.flag}</span><span>${c.name}</span>`;
      li.addEventListener("click", () => selectCountry(c));
      li.addEventListener("keydown", (e) => { if (e.key === "Enter") selectCountry(c); });
      list.appendChild(li);
    });
  }

  function selectCountry(c) {
    hidden.value = c.name;
    AssessmentState.data.country = c.name;
    label.textContent = `${c.flag} ${c.name}`;
    setFieldError(hidden.closest(".field"), "");
    closePanel();
  }

  function openPanel() {
    panel.hidden = false;
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    renderList("");
    search.value = "";
    search.focus();
  }
  function closePanel() {
    panel.hidden = true;
    wrap.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel()));
  search.addEventListener("input", () => renderList(search.value));
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closePanel();
  });
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPanel(); }
    if (e.key === "Escape") closePanel();
  });
}

// -------------------------------------------------------------------------
// Review screen
// -------------------------------------------------------------------------
function renderReview() {
  const d = AssessmentState.data;
  const groups = [
    { title: "About You", step: 1, rows: [
      ["Age", d.age], ["Gender", d.gender], ["Country", d.country], ["Academic Level", d.academicLevel]
    ]},
    { title: "Digital Habits", step: 2, rows: [
      ["Platform", d.platform], ["Purpose", d.purpose],
      ["Daily Usage", `${Number(d.dailyUsageHours).toFixed(1)} hours`], ["Daily Unlocks", d.dailyUnlocks]
    ]},
    { title: "Lifestyle", step: 3, rows: [
      ["Study Hours", `${Number(d.studyHours).toFixed(1)} hours`],
      ["Physical Activity", `${Number(d.activityHours).toFixed(1)} hours`],
      ["Sleep", `${Number(d.sleepHours).toFixed(1)} hours`]
    ]},
    { title: "Wellbeing", step: 4, rows: [["Stress Level", d.stressLevel]] }
  ];

  const container = document.getElementById("reviewContent");
  container.innerHTML = groups.map((g) => `
    <div class="review__group">
      <h4>${g.title} <button type="button" data-edit-step="${g.step}">Edit</button></h4>
      ${g.rows.map(([label, value]) => `
        <div class="review__row"><span>${label}</span><span>${value ?? ""}</span></div>
      `).join("")}
    </div>
  `).join("");

  container.querySelectorAll("[data-edit-step]").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.editStep)));
  });
}

function initAssessment() {
  initChoiceGroups();
  initSliders();
  initAgeAndUnlocks();
  initCountrySelect();

  document.getElementById("btnContinue").addEventListener("click", goNext);
  document.getElementById("btnBack").addEventListener("click", goBack);

  document.getElementById("assessmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(4)) { goToStep(4); return; }
    submitAssessment();
  });

  renderStep();
}
