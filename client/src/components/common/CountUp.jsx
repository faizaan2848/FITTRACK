// Counts a number up from 0 to `value` over `duration` ms, using
// requestAnimationFrame for a smooth animation. Re-runs whenever `value`
// changes (e.g. switching analytics ranges).

import { useEffect, useState, useRef } from "react";

function easeOutQuad(t) {
  return t * (2 - t);
}

function CountUp({ value, duration = 900, decimals = 0, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </>
  );
}

export default CountUp;
