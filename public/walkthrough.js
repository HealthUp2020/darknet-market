// NIGHT MARKET — guided spotlight tour (ROC-191 onboarding).
// Generic, DOM-only glue — no game rules. Give it steps and an onEnd callback:
//   startWalkthrough([{ target: "css-sel"|null, title, body, pad? }], (completed) => {…})
// A dim overlay spotlights one region at a time via a box-shadow "hole"; the caption
// popover auto-places around it. Dismissible any time (Skip / Esc); resumable by calling again.

let active = false;
export function isWalkthroughActive() { return active; }

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function startWalkthrough(steps, onEnd) {
  if (active || !steps || !steps.length) return;
  active = true;
  let i = 0;

  const overlay = document.createElement("div");
  overlay.className = "wt-overlay";
  overlay.tabIndex = -1;
  overlay.innerHTML = `
    <div class="wt-hole"></div>
    <div class="wt-pop" role="dialog" aria-modal="true" aria-live="polite">
      <button class="wt-skip" type="button" aria-label="Dismiss walkthrough">Skip ✕</button>
      <div class="wt-kick"></div>
      <h3 class="wt-title"></h3>
      <p class="wt-body"></p>
      <div class="wt-foot">
        <div class="wt-dots"></div>
        <div class="wt-nav">
          <button class="wt-back" type="button">Back</button>
          <button class="wt-next" type="button"></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const q = (s) => overlay.querySelector(s);
  const hole = q(".wt-hole"), pop = q(".wt-pop");
  const elKick = q(".wt-kick"), elTitle = q(".wt-title"), elBody = q(".wt-body"), elDots = q(".wt-dots");
  const btnBack = q(".wt-back"), btnNext = q(".wt-next"), btnSkip = q(".wt-skip");
  elDots.innerHTML = steps.map(() => "<i></i>").join("");

  function end(completed) {
    if (!active) return;
    active = false;
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
    document.removeEventListener("keydown", onKey, true);
    overlay.remove();
    if (onEnd) onEnd(completed);
  }

  function place() {
    const step = steps[i];
    const target = step.target ? document.querySelector(step.target) : null;
    const vw = innerWidth, vh = innerHeight;
    if (target) {
      const r = target.getBoundingClientRect();
      const pad = step.pad ?? 8;
      hole.classList.add("on");
      hole.style.left = Math.max(0, r.left - pad) + "px";
      hole.style.top = Math.max(0, r.top - pad) + "px";
      hole.style.width = Math.min(vw, r.width + pad * 2) + "px";
      hole.style.height = Math.min(vh, r.height + pad * 2) + "px";
      pop.style.visibility = "hidden"; pop.style.left = "0px"; pop.style.top = "0px";
      const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 14;
      let px, py;
      if (r.bottom + gap + ph <= vh) { py = r.bottom + gap; px = clamp(r.left + r.width / 2 - pw / 2, 12, vw - pw - 12); }
      else if (r.top - gap - ph >= 0) { py = r.top - gap - ph; px = clamp(r.left + r.width / 2 - pw / 2, 12, vw - pw - 12); }
      else if (r.right + gap + pw <= vw) { px = r.right + gap; py = clamp(r.top + r.height / 2 - ph / 2, 12, vh - ph - 12); }
      else if (r.left - gap - pw >= 0) { px = r.left - gap - pw; py = clamp(r.top + r.height / 2 - ph / 2, 12, vh - ph - 12); }
      else { px = (vw - pw) / 2; py = (vh - ph) / 2; }
      pop.style.left = px + "px"; pop.style.top = py + "px"; pop.style.visibility = "visible";
    } else {
      // No target: 0-size hole keeps the full-screen dim; popover centered.
      hole.classList.remove("on");
      hole.style.width = "0px"; hole.style.height = "0px";
      hole.style.left = vw / 2 + "px"; hole.style.top = vh / 2 + "px";
      pop.style.visibility = "hidden"; pop.style.left = "0px"; pop.style.top = "0px";
      pop.style.left = (vw - pop.offsetWidth) / 2 + "px";
      pop.style.top = (vh - pop.offsetHeight) / 2 + "px";
      pop.style.visibility = "visible";
    }
  }

  function show() {
    const step = steps[i];
    elKick.textContent = `Step ${i + 1} of ${steps.length}`;
    elTitle.textContent = step.title;
    elBody.textContent = step.body;
    btnBack.style.visibility = i === 0 ? "hidden" : "visible";
    btnNext.textContent = i === steps.length - 1 ? "Enter the market →" : "Next →";
    [...elDots.children].forEach((d, k) => d.classList.toggle("on", k === i));
    place();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); end(false); }
    else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); btnNext.click(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); if (i > 0) { i--; show(); } }
  }

  btnNext.addEventListener("click", () => { if (i < steps.length - 1) { i++; show(); } else end(true); });
  btnBack.addEventListener("click", () => { if (i > 0) { i--; show(); } });
  btnSkip.addEventListener("click", () => end(false));
  window.addEventListener("resize", place);
  window.addEventListener("scroll", place, true);
  document.addEventListener("keydown", onKey, true);

  show();
  overlay.focus();
}
