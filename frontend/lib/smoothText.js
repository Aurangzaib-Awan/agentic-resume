// Tokens arrive in bursts. This releases them at a steady typing pace, one word at a time,
// speeding up a little when it falls far behind so long replies don't drag.
// Driven by a timer, not requestAnimationFrame: hidden tabs get no animation frames at all,
// so a visitor switching tabs would come back to a frozen reply. Paced by elapsed time,
// so a throttled timer still types at the same speed.
const TICK_MS = 30;
const MIN_CHARS_PER_SECOND = 35;
const MAX_CHARS_PER_SECOND = 90;
const CATCH_UP_SECONDS = 2.5; // aim to clear any backlog in this long, within the limits above

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

    if (budget >= 1 && backlog > 0) {
      // stop at the end of a word, so half-words never flash on screen
      let next = Math.min(target.length, shown + Math.floor(budget));
      while (next < target.length && !/\s/.test(target[next])) next++;

      // the last word may still be arriving, wait for the rest of it
      const wordIncomplete = next === target.length && !finished;
      if (!wordIncomplete) {
        // finishing the word overspends the budget, so the next words wait to pay it back
        budget -= next - shown;
        shown = next;
        onText(target.slice(0, shown));
      }
    }

    if (shown < target.length || !finished) {
      timer = setTimeout(tick, TICK_MS);
    } else {
      timer = null;
      lastTime = null;
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
