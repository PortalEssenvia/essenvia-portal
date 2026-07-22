import { useEffect, useState } from "react";

export const ReadingProgress = () => {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 z-[55] h-[3px] pointer-events-none"
      style={{ top: "calc(var(--urgency-h, 0px) + 84px)" }}
    >
      <div
        className="h-full bg-gradient-gold transition-[width] duration-100 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
};