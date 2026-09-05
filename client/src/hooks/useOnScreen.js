import { useEffect, useRef, useState } from "react";

// Returns [ref, isVisible]. Attach ref to the element you want to watch;
// isVisible flips to true once it scrolls into the viewport (and stays
// true afterward, so the animation doesn't replay every scroll).
export function useOnScreen(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // only need to trigger once
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
