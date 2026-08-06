/* Loads the simulators' maths straight out of the component HTML.
 *
 * The Brew and Combat Simulators are the canonical models: they are what the
 * Kingpin's Guide quotes its odds from. This module lifts the pure functions
 * out of them by name so an analysis script can call them from node.
 *
 * Deliberately NOT a copy. A frozen duplicate of the maths would drift out of
 * sync with the simulators the first time either is tuned, which is the exact
 * failure mode CLAUDE.md warns about for compressed restatements. Extracting on
 * every run means these tools either track the components or fail loudly.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Pulls a named binding out of JS source. Handles `function NAME(...) {...}` by
// brace matching, and `const NAME = ...` one-liners by taking the line.
function extract(src, name) {
  const fnAt = src.indexOf(`function ${name}(`);
  if (fnAt !== -1) {
    const open = src.indexOf("{", fnAt);
    let depth = 0;
    for (let i = open; i < src.length; i += 1) {
      if (src[i] === "{") depth += 1;
      else if (src[i] === "}") {
        depth -= 1;
        if (depth === 0) return src.slice(fnAt, i + 1);
      }
    }
    throw new Error(`unbalanced braces extracting ${name}`);
  }

  const constAt = src.search(new RegExp(`const\\s+${name}\\s*=`));
  if (constAt !== -1) {
    const eol = src.indexOf("\n", constAt);
    return src.slice(constAt, eol === -1 ? src.length : eol);
  }

  throw new Error(`could not find ${name} (has the simulator been restructured?)`);
}

function loadFrom(file, names) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const body = names.map((n) => extract(html, n)).join("\n\n");
  const factory = new Function(`${body}\nreturn {${names.join(",")}};`);
  return factory();
}

const brew = () =>
  loadFrom("Brew Simulator v0.9.html", [
    "ratio",
    "d6",
    "reachableCount",
    "hostileMash",
    "brewYield",
    "simulate",
  ]);

const combat = () =>
  loadFrom("Combat Simulator v0.9.html", [
    "clamp",
    "d6",
    "alive",
    "mobsterCount",
    "diceFromMobsters",
    "killThreshold",
    "rollHits",
    "applyCasualties",
    "invaderAttackDice",
    "simulateTrial",
  ]);

module.exports = { brew, combat, extract };
