/**
 * app.js
 * Wires together the spell-checker UI, DP visualizer, and slides sections.
 * All section switching and DOM interactions are handled here.
 */

/* ── Navigation ─────────────────────────────────────── */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector(`.nav-btn[data-section="${id}"]`).classList.add("active");
}

/* ── Spell-Checker Section ──────────────────────────── */
function initSpellChecker() {
  const input      = document.getElementById("sc-input");
  const btn        = document.getElementById("sc-btn");
  const resultsDiv = document.getElementById("sc-results");
  const clearBtn   = document.getElementById("sc-clear");

  function check() {
    const typed = input.value.trim();
    if (!typed) {
      resultsDiv.innerHTML =
        "<p class='sc-hint'>Type a word above and click <strong>Check Spelling</strong>.</p>";
      return;
    }

    // Exact match?
    const lower = typed.toLowerCase();
    if (DICTIONARY.includes(lower)) {
      resultsDiv.innerHTML = `
        <div class="sc-exact">
          ✅ <strong>${escapeHtml(typed)}</strong> is spelled correctly!
        </div>`;
      return;
    }

    const suggestions = getSuggestions(typed, DICTIONARY, 5);
    if (!suggestions.length) {
      resultsDiv.innerHTML = "<p class='sc-hint'>No suggestions found.</p>";
      return;
    }

    let html = `<p class="sc-did-you-mean">Did you mean…?</p><ul class="suggestion-list">`;
    suggestions.forEach((s, idx) => {
      const badgeClass = idx === 0 ? "badge-best" : "badge-other";
      html += `
        <li class="suggestion-item">
          <span class="suggestion-word">${escapeHtml(s.word)}</span>
          <span class="suggestion-distance badge ${badgeClass}">
            edit distance: ${s.distance}
          </span>
          <button class="viz-link-btn"
            data-typed="${escapeHtml(lower)}" data-target="${escapeHtml(s.word)}"
            title="Visualize DP matrix for this pair">
            📊 Visualize
          </button>
        </li>`;
    });
    html += "</ul>";
    html += `<p class="sc-costs-note">
      Costs used: insertion&nbsp;=&nbsp;1 · deletion&nbsp;=&nbsp;1 · substitution&nbsp;=&nbsp;2
    </p>`;
    resultsDiv.innerHTML = html;

    /* wire visualize buttons */
    resultsDiv.querySelectorAll(".viz-link-btn").forEach(b => {
      b.addEventListener("click", () => {
        const t = b.dataset.typed;
        const g = b.dataset.target;
        document.getElementById("viz-word-s").value = t;
        document.getElementById("viz-word-t").value = g;
        showSection("viz-section");
        VIZ.buildTable(t, g);
      });
    });
  }

  btn.addEventListener("click", check);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    resultsDiv.innerHTML =
      "<p class='sc-hint'>Type a word above and click <strong>Check Spelling</strong>.</p>";
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") check();
  });

  /* example chips */
  document.querySelectorAll(".example-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.word;
      check();
    });
  });
}

/* ── DP Visualizer Section ──────────────────────────── */
function initVisualizer() {
  const btnViz  = document.getElementById("btn-visualize");
  const btnSkip = document.getElementById("btn-skip-anim");

  btnViz.addEventListener("click", () => {
    const s = document.getElementById("viz-word-s").value;
    const t = document.getElementById("viz-word-t").value;
    VIZ.buildTable(s, t);
  });

  btnSkip.addEventListener("click", () => {
    VIZ.stopAnimation();
  });

  /* allow Enter key in inputs */
  ["viz-word-s", "viz-word-t"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const s = document.getElementById("viz-word-s").value;
        const t = document.getElementById("viz-word-t").value;
        VIZ.buildTable(s, t);
      }
    });
  });

  /* example pair chips */
  document.querySelectorAll(".viz-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("viz-word-s").value = chip.dataset.s;
      document.getElementById("viz-word-t").value = chip.dataset.t;
      VIZ.buildTable(chip.dataset.s, chip.dataset.t);
    });
  });

  /* initial hint */
  document.getElementById("dp-table-wrap").innerHTML =
    "<p class='viz-hint'>Enter two words above and click <strong>Visualize</strong> to see the DP matrix animate cell-by-cell.</p>";
}

/* ── Bootstrap ──────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* nav buttons */
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  initSpellChecker();
  initVisualizer();
  SLIDES.init();

  showSection("checker-section");
});
