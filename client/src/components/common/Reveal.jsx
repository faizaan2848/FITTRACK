import { useOnScreen } from "../../hooks/useOnScreen";

function Reveal({ children, delay = 0 }) {
  const [ref, isVisible] = useOnScreen();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default Reveal;
