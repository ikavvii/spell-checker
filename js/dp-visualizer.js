/**
 * dp-visualizer.js
 * Renders the DP matrix for two words and animates cell-by-cell filling.
 * Highlights the optimal backtracked path once the animation completes.
 */

const VIZ = (() => {
  /* ── state ─────────────────────────────────────────── */
  let animationTimer = null;
  let currentMatrix  = null;
  let currentPath    = null;
  let typedWord      = "";
  let targetWord     = "";

  /* ── helpers ────────────────────────────────────────── */
  function classForCell(i, j, pathSet) {
    if (pathSet.has(`${i},${j}`)) return "path";
    if (i === 0 || j === 0)       return "base";
    const s = typedWord[i - 1];
    const t = targetWord[j - 1];
    if (s === t) return "match";
    return "edit";
  }

  function opLabel(i, j) {
    if (i === 0 && j === 0) return "";
    if (i === 0) return `+${targetWord[j - 1]}`;   // insert
    if (j === 0) return `−${typedWord[i - 1]}`;    // delete
    const s = typedWord[i - 1];
    const t = targetWord[j - 1];
    if (s === t) return "✓";
    return `${s}→${t}`;
  }

  /* ── public API ─────────────────────────────────────── */
  function buildTable(sWord, tWord) {
    typedWord  = sWord.toLowerCase().trim();
    targetWord = tWord.toLowerCase().trim();

    if (!typedWord || !targetWord) {
      document.getElementById("dp-table-wrap").innerHTML =
        "<p class='viz-hint'>Enter both words above and click <strong>Visualize</strong>.</p>";
      document.getElementById("viz-stats").textContent = "";
      return;
    }

    const { matrix } = computeEditDistance(typedWord, targetWord);
    const pathArr    = backtrack(typedWord, targetWord, matrix);
    const pathSet    = new Set(pathArr.map(p => `${p.i},${p.j}`));

    currentMatrix = matrix;
    currentPath   = pathArr;

    const m = typedWord.length;
    const n = targetWord.length;

    /* build HTML table */
    let html = "<table class='dp-table'><thead><tr>";
    html += "<th></th><th class='hdr-char'><span>\u201C\u201D</span></th>";
    for (const ch of targetWord) {
      html += `<th class='hdr-char'><span>${ch}</span></th>`;
    }
    html += "</tr></thead><tbody>";

    for (let i = 0; i <= m; i++) {
      html += "<tr>";
      if (i === 0) {
        html += "<td class='hdr-char'><span>\u201C\u201D</span></td>";
      } else {
        html += `<td class='hdr-char'><span>${typedWord[i - 1]}</span></td>`;
      }
      for (let j = 0; j <= n; j++) {
        const cls   = classForCell(i, j, pathSet);
        const tip   = opLabel(i, j);
        const id    = `cell-${i}-${j}`;
        html += `<td id="${id}" class="dp-cell ${cls}" data-tip="${tip}">
                   <span class="cell-val">?</span>
                   ${tip ? `<span class="cell-op">${tip}</span>` : ""}
                 </td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table>";

    document.getElementById("dp-table-wrap").innerHTML = html;
    document.getElementById("viz-stats").textContent   = "";

    /* animate fill */
    if (animationTimer) clearTimeout(animationTimer);
    const cells = [];
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        cells.push({ i, j });
      }
    }

    let idx = 0;
    const DELAY = Math.max(30, Math.min(120, 2000 / cells.length));

    function step() {
      if (idx >= cells.length) {
        /* animation done — show stats */
        const dist = matrix[m][n];
        document.getElementById("viz-stats").innerHTML =
          `<span class="stat-badge">Edit Distance: <strong>${dist}</strong></span>
           <span class="stat-badge">Typed length: <strong>${m}</strong></span>
           <span class="stat-badge">Target length: <strong>${n}</strong></span>
           <span class="stat-badge">Matrix cells: <strong>${(m + 1) * (n + 1)}</strong></span>`;
        return;
      }
      const { i, j } = cells[idx++];
      const el = document.getElementById(`cell-${i}-${j}`);
      if (el) {
        const valEl = el.querySelector(".cell-val");
        valEl.textContent = matrix[i][j];
        valEl.style.opacity    = "";   // let CSS transition handle it
        valEl.style.transition = "";
        el.classList.add("revealed");
      }
      animationTimer = setTimeout(step, DELAY);
    }
    step();
  }

  function stopAnimation() {
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }
    if (!currentMatrix) return;
    const m = typedWord.length;
    const n = targetWord.length;
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        const el = document.getElementById(`cell-${i}-${j}`);
        if (el) {
          const valEl = el.querySelector(".cell-val");
          valEl.textContent = currentMatrix[i][j];
          /* bypass CSS transition so cells appear instantly */
          valEl.style.transition = "none";
          valEl.style.opacity    = "1";
          el.classList.add("revealed");
        }
      }
    }
    const dist = currentMatrix[m][n];
    document.getElementById("viz-stats").innerHTML =
      `<span class="stat-badge">Edit Distance: <strong>${dist}</strong></span>
       <span class="stat-badge">Typed length: <strong>${m}</strong></span>
       <span class="stat-badge">Target length: <strong>${n}</strong></span>
       <span class="stat-badge">Matrix cells: <strong>${(m + 1) * (n + 1)}</strong></span>`;
  }

  return { buildTable, stopAnimation };
})();
