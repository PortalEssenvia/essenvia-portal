import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-verde-profundo text-bege-claro hover:bg-dourado hover:text-verde-profundo shadow-soft flex items-center justify-center transition-smooth animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};