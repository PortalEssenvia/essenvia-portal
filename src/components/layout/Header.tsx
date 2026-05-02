import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Início" },
  { to: "/metodo", label: "Método" },
  { to: "/programas", label: "Programas" },
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/entrar", label: "Entrar" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-smooth",
        scrolled
          ? "bg-bege-claro/85 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Nova Essenvia" className="h-16 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium tracking-wide transition-smooth hover:text-dourado",
                  isActive ? "text-dourado" : "text-verde-profundo"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="gold" size="lg">
            <Link to="/entrar">Comece sua Jornada</Link>
          </Button>
        </div>

        <button
          aria-label="Abrir menu"
          className="lg:hidden text-verde-profundo p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-bege-claro/95 backdrop-blur-md border-t border-border animate-fade-in">
          <nav className="container flex flex-col py-6 gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-base py-2",
                    isActive ? "text-dourado" : "text-verde-profundo"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Button asChild variant="gold" size="lg" className="mt-2">
              <Link to="/entrar">Comece sua Jornada</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
