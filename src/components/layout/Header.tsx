import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseLinks = [
  { to: "/", label: "Início" },
  { to: "/metodo", label: "Método" },
  { to: "/programas", label: "Os 7 Pilares" },
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/comunidade", label: "Comunidade" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (!user) { setDisplayName(""); return; }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const name =
          (data as any)?.full_name ||
          (user.user_metadata as any)?.display_name ||
          (user.user_metadata as any)?.full_name ||
          user.email?.split("@")[0] ||
          "Usuário";
        setDisplayName(name.split(" ")[0]);
      });
  }, [user]);

  const links = user
    ? [...baseLinks, { to: "/ferramentas", label: "Ferramentas" }]
    : baseLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const isOnDarkHero = !scrolled && location.pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-400",
        scrolled
          ? "glass-light shadow-soft"
          : isOnDarkHero
            ? "glass-dark"
            : "bg-bege-claro/90 backdrop-blur-md border-b border-bege"
      )}
    >
      <div className="container flex items-center justify-between h-[72px]">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 py-1 group"
          aria-label="Renovação Constante — Início"
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className={cn(
                "h-11 w-11 object-contain rounded-full transition-smooth",
                scrolled || !isOnDarkHero
                  ? "ring-2 ring-dourado/30"
                  : "ring-2 ring-dourado/40 brightness-110"
              )}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className={cn(
                "font-display text-[15px] tracking-[0.18em] font-semibold leading-tight transition-smooth",
                scrolled || !isOnDarkHero
                  ? "text-verde-profundo"
                  : "text-dourado"
              )}
            >
              RENOVAÇÃO
            </span>
            <span
              className={cn(
                "font-display text-[15px] tracking-[0.18em] font-semibold leading-tight transition-smooth",
                scrolled || !isOnDarkHero
                  ? "text-verde-medio"
                  : "text-bege-claro"
              )}
            >
              CONSTANTE
            </span>
          </div>
        </Link>

        {/* ── Nav desktop ── */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 rounded-lg text-[13px] font-medium tracking-wide transition-smooth",
                  "hover:bg-dourado/10 hover:text-dourado",
                  isActive
                    ? "text-dourado after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-dourado after:rounded-full"
                    : scrolled || !isOnDarkHero
                      ? "text-verde-profundo"
                      : "text-bege-claro/90"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Ações desktop ── */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-smooth",
                    "hover:bg-dourado/10",
                    scrolled || !isOnDarkHero
                      ? "border-dourado/40 text-verde-profundo"
                      : "border-dourado/50 text-bege-claro"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center text-verde-profundo text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span>Olá, {displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-bege shadow-soft w-48">
                <DropdownMenuItem
                  onClick={() => navigate("/ferramentas")}
                  className="cursor-pointer text-verde-profundo font-medium"
                >
                  Minhas Práticas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="gold" size="sm" className="rounded-full px-5 font-semibold shadow-gold">
              <Link to="/entrar">Comece sua Renovação</Link>
            </Button>
          )}
        </div>

        {/* ── Hamburguer mobile ── */}
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className={cn(
            "lg:hidden p-2 rounded-lg transition-smooth",
            scrolled || !isOnDarkHero
              ? "text-verde-profundo hover:bg-bege"
              : "text-bege-claro hover:bg-white/10"
          )}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {open && (
        <div className="lg:hidden bg-bege-claro/97 backdrop-blur-md border-t border-bege animate-slide-down">
          <nav className="container flex flex-col py-5 gap-1" role="navigation">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "py-3 px-4 rounded-xl text-base font-medium transition-smooth",
                    isActive
                      ? "bg-dourado/10 text-dourado"
                      : "text-verde-profundo hover:bg-bege hover:text-dourado"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-1 border-t border-bege">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/ferramentas")}
                    className="w-full py-3 px-4 rounded-xl text-left text-base font-medium text-verde-profundo hover:bg-bege transition-smooth"
                  >
                    Minhas Práticas
                  </button>
                  <Button variant="ghost" size="lg" className="w-full text-red-500" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />Sair
                  </Button>
                </div>
              ) : (
                <Button asChild variant="gold" size="lg" className="w-full rounded-xl font-semibold">
                  <Link to="/entrar">Comece sua Renovação</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
