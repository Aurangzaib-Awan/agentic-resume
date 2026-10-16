// Tokens arrive in bursts (often the whole reply within a second). This types them out
// letter by letter at a steady pace, easing off as it catches up, so text flows instead of jumping.
// Driven by a timer, not requestAnimationFrame: hidden tabs get no animation frames at all,
// so a visitor switching tabs would come back to a frozen reply. Paced by elapsed time,
// so a throttled timer still types at the same speed.
const TICK_MS = 30;
const MIN_CHARS_PER_SECOND = 50;
const MAX_CHARS_PER_SECOND = 120;
const CATCH_UP_SECONDS = 3; // aim to clear any backlog in this long, within the limits above

// An open ** or ` shows as raw symbols until its pair arrives, then the text snaps to bold/code.
// Dropping the unpaired marker keeps the partial text clean; it styles itself once the pair shows up.
function hideOpenMarkdown(text) {
  for (const marker of ["**", "`"]) {
    const count = text.split(marker).length - 1;

    if (count % 2 === 1) {
      const last = text.lastIndexOf(marker);
      text = text.slice(0, last) + text.slice(last + marker.length);
    }
  }

  return text;
}

export function createRevealer(onText) {
  let target = "";
  let shown = 0;
  let budget = 0;
  let lastTime = null;
  let timer = null;
  let finished = false;
  let resolveDone = null;

  function tick() {
    const now = performance.now();
    const elapsed = lastTime === null ? 0 : (now - lastTime) / 1000;
    lastTime = now;

    const backlog = target.length - shown;
    const speed = Math.min(MAX_CHARS_PER_SECOND, Math.max(MIN_CHARS_PER_SECOND, backlog / CATCH_UP_SECONDS));
    // no saving up speed while waiting for tokens, or the next burst would dump at once
    budget = backlog > 0 ? budget + speed * elapsed : 0;

    const step = Math.min(backlog, Math.floor(budget));
    if (step > 0) {
      budget -= step;
      shown += step;
      onText(hideOpenMarkdown(target.slice(0, shown)));
    }

    if (shown < target.length || !finished) {
      timer = setTimeout(tick, TICK_MS);
    } else {
      timer = null;
      lastTime = null;
      onText(target); // final text exactly as sent, markers and all
      resolveDone?.();
    }
  }

  function start() {
    if (timer === null) timer = setTimeout(tick, TICK_MS);
  }

  return {
    push(text) {
      target += text;
      start();
    },
    // resolves once everything received so far has been shown
    finish() {
      finished = true;
      start();
      return new Promise((resolve) => {
        resolveDone = resolve;
      });
    },
    // show everything at once, e.g. before an error message is appended
    flush() {
      finished = true;
      if (timer !== null) clearTimeout(timer);
      timer = null;
      shown = target.length;
      onText(target);
      return target;
    },
  };
}
