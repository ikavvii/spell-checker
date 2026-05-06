/**
 * slides.js
 * Manages the 5-slide presentation embedded inside the page.
 * Slide content is defined as an array of objects; rendering is
 * done by injecting HTML into #slide-content.
 */

const SLIDES = (() => {
  let current = 0;

  /* ── slide definitions ──────────────────────────────── */
  const slides = [
    /* ── Slide 1 ── */
    {
      title: "Slide 1 — The Real-World Problem",
      subtitle: "Intelligent Spell-Checker using String Editing",
      body: `
        <div class="slide-section">
          <h3>🌍 The Problem</h3>
          <p>Every day, millions of users make typos. When a user types
          <span class="code-inline">algorythm</span>, how does the computer know to
          suggest <span class="code-inline">algorithm</span> and not
          <span class="code-inline">algebra</span>?</p>
        </div>
        <div class="slide-section">
          <h3>💡 The Solution</h3>
          <p>It doesn't <em>guess</em>. It <strong>mathematically calculates</strong>
          the "cheapest" way to fix the word using the
          <strong>Minimum Edit Distance algorithm</strong> — a classic
          <strong>Dynamic Programming</strong> approach.</p>
        </div>
        <div class="slide-section highlight-box">
          <p><strong>Real-world tools that use this:</strong>
          MS Word · Google Docs · Grammarly · macOS/iOS autocorrect · Git's
          <code>did you mean?</code> prompt</p>
        </div>
      `
    },
    /* ── Slide 2 ── */
    {
      title: "Slide 2 — The Core Concept: 3 Operations",
      subtitle: "What does it cost to fix a word?",
      body: `
        <div class="slide-section">
          <p>The algorithm calculates the minimum number of
          <strong>weighted edit operations</strong> to transform
          String&nbsp;A (the typo) into String&nbsp;B (a dictionary word).</p>
        </div>
        <div class="ops-grid">
          <div class="op-card op-insert">
            <div class="op-icon">➕</div>
            <div class="op-name">Insertion</div>
            <div class="op-cost">Cost: <strong>1</strong></div>
            <div class="op-example">
              <code>algo</code> → <code>algos</code><br>
              <em>(add a missing letter)</em>
            </div>
          </div>
          <div class="op-card op-delete">
            <div class="op-icon">➖</div>
            <div class="op-name">Deletion</div>
            <div class="op-cost">Cost: <strong>1</strong></div>
            <div class="op-example">
              <code>algoo</code> → <code>algo</code><br>
              <em>(remove an extra letter)</em>
            </div>
          </div>
          <div class="op-card op-sub">
            <div class="op-icon">🔁</div>
            <div class="op-name">Substitution</div>
            <div class="op-cost">Cost: <strong>2</strong></div>
            <div class="op-example">
              <code>algy</code> → <code>algo</code><br>
              <em>(swap wrong letter for right one)</em>
            </div>
          </div>
        </div>
        <div class="slide-section highlight-box">
          <p><strong>Goal:</strong> Compare the typed word against dictionary words and
          suggest the word with the <strong>lowest total edit cost</strong>.</p>
          <p style="margin-top:0.5rem;font-size:0.9rem;opacity:0.8">
          Note: Substitution costs 2 because it is semantically equivalent to a
          deletion + insertion. This asymmetry encourages the algorithm to prefer
          single-character insertions/deletions when the cost is the same.</p>
        </div>
      `
    },
    /* ── Slide 3 ── */
    {
      title: "Slide 3 — The DP Matrix (Visual Proof)",
      subtitle: "Tracing \"algy\" → \"algo\" with ins/del=1, sub=2",
      body: `
        <div class="slide-section">
          <p>We fill an <strong>(m+1)&nbsp;×&nbsp;(n+1)</strong> table where each cell
          <em>dp[i][j]</em> holds the minimum cost to transform the first
          <em>i</em> characters of the typed word into the first <em>j</em>
          characters of the target word.</p>
        </div>
        <div class="slide-matrix-wrap">
          <table class="slide-matrix">
            <thead>
              <tr>
                <th></th><th>""</th><th>a</th><th>l</th><th>g</th><th>o</th>
              </tr>
            </thead>
            <tbody>
              <tr><th>""</th><td class="base">0</td><td class="base">1</td><td class="base">2</td><td class="base">3</td><td class="base">4</td></tr>
              <tr><th>a</th> <td class="base">1</td><td class="match path">0</td><td class="edit">1</td><td class="edit">2</td><td class="edit">3</td></tr>
              <tr><th>l</th> <td class="base">2</td><td class="edit">1</td><td class="match path">0</td><td class="edit">1</td><td class="edit">2</td></tr>
              <tr><th>g</th> <td class="base">3</td><td class="edit">2</td><td class="edit">1</td><td class="match path">0</td><td class="edit">1</td></tr>
              <tr><th>y</th> <td class="base">4</td><td class="edit">3</td><td class="edit">2</td><td class="edit">1</td><td class="path edit ans">2</td></tr>
            </tbody>
          </table>
        </div>
        <div class="slide-section highlight-box">
          <p>👉 Bottom-right corner = <strong>2</strong>. It costs exactly
          <strong>2 units</strong> to transform "algy" → "algo" (one substitution:
          y&nbsp;→&nbsp;o, at cost&nbsp;2). The highlighted path shows the optimal
          edit sequence.</p>
          <p style="margin-top:0.5rem;font-size:0.9rem;opacity:0.8">
          <strong>Formula:</strong> If characters match → carry diagonal value (free).
          Otherwise → min(above+1, left+1, diagonal+2).</p>
        </div>
      `
    },
    /* ── Slide 4 ── */
    {
      title: "Slide 4 — Algorithmic Complexity Analysis",
      subtitle: "Why DP is the right tool for this problem",
      body: `
        <div class="complexity-grid">
          <div class="complexity-card">
            <div class="complexity-icon">⏱️</div>
            <div class="complexity-label">Time Complexity</div>
            <div class="complexity-val">O(m × n)</div>
            <div class="complexity-desc">
              Where <em>m</em> = length of typed word, <em>n</em> = length of
              dictionary word. We compute a value for every cell in the
              <em>m&nbsp;×&nbsp;n</em> matrix — one pass, no recursion.
            </div>
          </div>
          <div class="complexity-card">
            <div class="complexity-icon">💾</div>
            <div class="complexity-label">Space Complexity</div>
            <div class="complexity-val">O(m × n)</div>
            <div class="complexity-desc">
              We store the full 2-D matrix to track overlapping sub-problems.
              <br><br>
              <strong>★ Bonus optimization:</strong> Space can be reduced to
              <em>O(min(m,n))</em> by keeping only the two most recent rows —
              demonstrating deep DP knowledge!
            </div>
          </div>
        </div>
        <div class="slide-section">
          <h3>📐 Principle of Optimality</h3>
          <p>This algorithm satisfies the DP requirement because the
          <strong>optimal solution for the whole string depends entirely on the
          optimal solutions for its sub-strings</strong>.</p>
          <p style="margin-top:0.5rem;">
          Each cell <em>dp[i][j]</em> only looks at three previously computed
          cells — no redundant re-computation, no exponential blowup.</p>
        </div>
        <div class="slide-section highlight-box">
          <p><strong>vs. Brute-Force:</strong> Trying all possible edit sequences
          would be exponential — O(3<sup>max(m,n)</sup>). DP collapses this to a
          simple nested loop.</p>
        </div>
      `
    },
    /* ── Slide 5 ── */
    {
      title: "Slide 5 — Why It Matters",
      subtitle: "From two words to millions — at real-world scale",
      body: `
        <div class="slide-section">
          <h3>📈 Scale</h3>
          <p>While comparing two words is fast, MS Word or Grammarly must compare
          your typo against <strong>tens of thousands of words in milliseconds</strong>.
          DP makes this tractable — and optimizations (early exit, trie pruning,
          BK-trees) push it further.</p>
        </div>
        <div class="impact-grid">
          <div class="impact-card">
            <div class="impact-icon">✍️</div>
            <div>Word processors<br><small>MS Word, LibreOffice</small></div>
          </div>
          <div class="impact-card">
            <div class="impact-icon">📱</div>
            <div>Mobile autocorrect<br><small>iOS, Android keyboards</small></div>
          </div>
          <div class="impact-card">
            <div class="impact-icon">🔍</div>
            <div>Search engines<br><small>"Did you mean …?"</small></div>
          </div>
          <div class="impact-card">
            <div class="impact-icon">💻</div>
            <div>Version control<br><small>Git "did you mean?"</small></div>
          </div>
          <div class="impact-card">
            <div class="impact-icon">🧬</div>
            <div>Bioinformatics<br><small>DNA sequence alignment</small></div>
          </div>
          <div class="impact-card">
            <div class="impact-icon">🤖</div>
            <div>NLP / LLMs<br><small>Token-level edit costs</small></div>
          </div>
        </div>
        <div class="slide-section highlight-box">
          <p><strong>Conclusion:</strong> Dynamic Programming gives us a structured,
          non-recursive way to solve complex string-matching problems instantly —
          making modern text-editing, search, and AI-assisted software possible.</p>
        </div>
      `
    }
  ];

  /* ── rendering ──────────────────────────────────────── */
  function render() {
    const s = slides[current];
    document.getElementById("slide-title").textContent    = s.title;
    document.getElementById("slide-subtitle").textContent = s.subtitle;
    document.getElementById("slide-body").innerHTML       = s.body;
    document.getElementById("slide-counter").textContent  =
      `${current + 1} / ${slides.length}`;

    document.getElementById("btn-prev").disabled = current === 0;
    document.getElementById("btn-next").disabled = current === slides.length - 1;

    /* update dot nav */
    document.querySelectorAll(".slide-dot").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === current);
    });
  }

  function buildDots() {
    const wrap = document.getElementById("slide-dots");
    wrap.innerHTML = "";
    slides.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = "slide-dot" + (idx === current ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      dot.addEventListener("click", () => { current = idx; render(); });
      wrap.appendChild(dot);
    });
  }

  function init() {
    buildDots();
    render();

    document.getElementById("btn-prev").addEventListener("click", () => {
      if (current > 0) { current--; render(); }
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      if (current < slides.length - 1) { current++; render(); }
    });

    /* keyboard navigation */
    document.addEventListener("keydown", e => {
      if (document.activeElement.closest("#slides-section")) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          if (current < slides.length - 1) { current++; render(); }
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          if (current > 0) { current--; render(); }
        }
      }
    });
  }

  return { init };
})();
