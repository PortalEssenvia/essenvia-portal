import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Flame } from "lucide-react";

const KEY = "urgency-bar-dismissed";

export const UrgencyBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(KEY) === "1";
    setVisible(!dismissed);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--urgency-h",
      visible ? "40px" : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--urgency-h", "0px");
    };
  }, [visible]);

  const close = () => {
    sessionStorage.setItem(KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de urgência"
      className="fixed top-0 inset-x-0 z-[60] h-10 bg-gradient-gold text-verde-profundo shadow-sm"
    >
      <div className="container h-full flex items-center justify-between gap-3 text-[13px] font-medium">
        <p className="flex items-center gap-2 truncate">
          <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            <strong className="font-semibold">Vagas abertas</strong> para o Protocolo de 12 Sessões — apenas 15 restantes
          </span>
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/entrar"
            className="hidden sm:inline-flex items-center rounded-full bg-verde-profundo text-bege-claro px-3 py-1 text-xs font-semibold hover:bg-verde-medio transition-smooth"
          >
            Garantir vaga
          </Link>
          <button
            onClick={close}
            aria-label="Fechar aviso"
            className="p-1.5 rounded-full hover:bg-verde-profundo/10 transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};