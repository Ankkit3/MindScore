/* =========================================================================
   MindScore — results.js
   Renders the ML prediction on the results screen.
   ========================================================================= */

function renderResults(result) {
    const score = Number(result.score);

    if (Number.isNaN(score)) {
        throw new Error("Invalid MindScore returned by API.");
    }

    // ------------------------------------------------------------
    // Score
    // ------------------------------------------------------------

    const scoreValue = document.getElementById("scoreValue");
    const scoreRange = document.getElementById("scoreRange");

    if (!scoreValue || !scoreRange) {
        throw new Error("Results UI elements are missing from index.html.");
    }

    scoreValue.textContent = score.toFixed(2);
    scoreRange.textContent = "of 3.6–9.4";


    // ------------------------------------------------------------
    // Gauge
    // ------------------------------------------------------------

    const gaugeFill = document.getElementById("gaugeFill");

    if (gaugeFill) {
        const min = 3.6;
        const max = 9.4;

        const percentage =
            Math.max(0, Math.min(1, (score - min) / (max - min)));

        const radius = 104;
        const circumference = 2 * Math.PI * radius;

        gaugeFill.style.strokeDasharray = circumference;
        gaugeFill.style.strokeDashoffset =
            circumference * (1 - percentage);
    }


    // ------------------------------------------------------------
    // Interpretation
    // ------------------------------------------------------------

    const interpretationLabel =
        document.getElementById("interpretationLabel");

    const interpretationDesc =
        document.getElementById("interpretationDesc");

    let label;
    let description;

    if (score < 5.0) {
        label = "Needs Attention";
        description =
            "Your score suggests that some areas of your current wellbeing may benefit from additional attention.";
    } else if (score < 6.5) {
        label = "Fair";
        description =
            "Your wellbeing appears to be in a moderate range, with some areas that may be worth improving.";
    } else if (score < 7.8) {
        label = "Good";
        description =
            "Your responses suggest a generally positive wellbeing profile.";
    } else {
        label = "Strong";
        description =
            "Your responses suggest a strong overall wellbeing profile.";
    }

    if (interpretationLabel) {
        interpretationLabel.textContent = label;
    }

    if (interpretationDesc) {
        interpretationDesc.textContent = description;
    }


    // ------------------------------------------------------------
    // Demo banner
    // ------------------------------------------------------------

    const demoBanner = document.getElementById("demoBanner");

    if (demoBanner) {
        demoBanner.hidden = !result.demo;
    }


    // ------------------------------------------------------------
    // Input summary
    // ------------------------------------------------------------

    const summary =
        document.getElementById("resultsInputSummary");

    if (summary && typeof AssessmentState !== "undefined") {

        const d = AssessmentState.data;

        const rows = [
            ["Age", d.age],
            ["Gender", d.gender],
            ["Country", d.country],
            ["Academic Level", d.academicLevel],
            ["Platform", d.platform],
            ["Purpose", d.purpose],
            ["Daily Usage", `${Number(d.dailyUsageHours).toFixed(1)} hours`],
            ["Daily Unlocks", d.dailyUnlocks],
            ["Study Hours", `${Number(d.studyHours).toFixed(1)} hours`],
            ["Physical Activity", `${Number(d.activityHours).toFixed(1)} hours`],
            ["Sleep", `${Number(d.sleepHours).toFixed(1)} hours`],
            ["Stress Level", d.stressLevel]
        ];

        summary.innerHTML = rows.map(([label, value]) => `
            <div class="review__row">
                <span>${label}</span>
                <span>${value ?? ""}</span>
            </div>
        `).join("");
    }
}