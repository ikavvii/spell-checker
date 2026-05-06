/**
 * spell-checker.js
 * Core edit-distance algorithm with custom operation costs:
 *   Insertion    : 1
 *   Deletion     : 1
 *   Substitution : 2
 *
 * The DP recurrence:
 *   dp[i][j] = 0                                       if i=0 and j=0
 *   dp[i][0] = i                                       (delete i chars)
 *   dp[0][j] = j                                       (insert j chars)
 *   dp[i][j] = dp[i-1][j-1]                            if s[i-1] === t[j-1]
 *   dp[i][j] = min( dp[i-1][j]   + INS_DEL_COST,      (deletion from s)
 *                   dp[i][j-1]   + INS_DEL_COST,       (insertion into s)
 *                   dp[i-1][j-1] + SUBS_COST  )        (substitution)
 */

const INS_DEL_COST = 1;
const SUBS_COST    = 2;

/**
 * Compute the full DP matrix between strings s (typed) and t (dictionary).
 * Returns { distance, matrix }.
 */
function computeEditDistance(s, t) {
  const m = s.length;
  const n = t.length;

  // Allocate (m+1) × (n+1) matrix
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array(n + 1).fill(0));
  }

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i * INS_DEL_COST;
  for (let j = 0; j <= n; j++) dp[0][j] = j * INS_DEL_COST;

  // Fill table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s[i - 1] === t[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // characters match — free
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + INS_DEL_COST,   // deletion  (remove char from s)
          dp[i][j - 1] + INS_DEL_COST,   // insertion (add char to s)
          dp[i - 1][j - 1] + SUBS_COST   // substitution
        );
      }
    }
  }

  return { distance: dp[m][n], matrix: dp };
}

/**
 * Backtrack through dp to recover one optimal edit path.
 * Returns an array of {i, j, op} objects (from (0,0) to (m,n)).
 *   op: "match" | "substitute" | "delete" | "insert" | "origin"
 */
function backtrack(s, t, matrix) {
  const path = [];
  let i = s.length;
  let j = t.length;

  while (i > 0 || j > 0) {
    path.push({ i, j });
    if (i === 0) {
      j--; // can only insert
    } else if (j === 0) {
      i--; // can only delete
    } else if (s[i - 1] === t[j - 1]) {
      i--; j--; // match
    } else {
      const del  = matrix[i - 1][j] + INS_DEL_COST;
      const ins  = matrix[i][j - 1] + INS_DEL_COST;
      const sub  = matrix[i - 1][j - 1] + SUBS_COST;
      const best = Math.min(del, ins, sub);
      if (best === sub)      { i--; j--; }
      else if (best === del) { i--;      }
      else                   {      j--; }
    }
  }
  path.push({ i: 0, j: 0 });
  return path.reverse();
}

/**
 * Return the top-k dictionary suggestions for a typed word,
 * sorted by ascending edit distance (ties broken alphabetically).
 *
 * @param {string}   typedWord
 * @param {string[]} dictionary
 * @param {number}   k
 * @returns {{ word: string, distance: number }[]}
 */
function getSuggestions(typedWord, dictionary, k = 5) {
  const lower = typedWord.toLowerCase().trim();
  if (!lower) return [];

  const results = dictionary.map(word => ({
    word,
    distance: computeEditDistance(lower, word).distance
  }));

  results.sort((a, b) =>
    a.distance !== b.distance
      ? a.distance - b.distance
      : a.word.localeCompare(b.word)
  );

  return results.slice(0, k);
}
