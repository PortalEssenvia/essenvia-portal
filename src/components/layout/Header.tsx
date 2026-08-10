import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, ChevronDown,
  Heart, Brain, Compass, Moon, Activity, Zap, Sparkles,
} from "lucide-react";
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

const pilaresMenu = [
  { icon: Heart,    title: "Renovação Emocional",  desc: "Reprocessar cargas com a TRG." },
  { icon: Brain,    title: "Renovação Sistêmica",  desc: "Padrões familiares e vínculos." },
  { icon: Sparkles, title: "Renovação Mental",     desc: "Clareza, foco e crenças." },
  { icon: Activity, title: "Renovação do Corpo",   desc: "Movimento e vitalidade." },
  { icon: Moon,     title: "Renovação do Sono",    desc: "Descanso profundo e reparador." },
  { icon: Zap,      title: "Renovação Energética", desc: "Fluxo, presença e equilíbrio." },
  { icon: Compass,  title: "Renovação de Propósito", desc: "Direção e sentido de vida." },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pilaresOpen, setPilaresOpen] = useState(false);
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
      style={{ top: "var(--urgency-h, 0px)" }}
      className={cn(
        "fixed inset-x-0 z-50 transition-all duration-400",
        scrolled
          ? "glass-light shadow-soft"
          : isOnDarkHero
            ? "glass-dark"
            : "bg-bege-claro/90 backdrop-blur-md border-b border-bege"
      )}
    >
      <div className="container flex items-center justify-between h-[84px]">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 py-1 group"
          aria-label="Renovação Constante — Início"
        >
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className={cn(
                "h-16 w-16 object-contain rounded-full transition-smooth group-hover:scale-[1.03]",
                scrolled || !isOnDarkHero
                  ? "ring-2 ring-dourado/30"
                  : "ring-2 ring-dourado/40 brightness-110"
              )}
            />
          </div>
          <div className="flex flex-col leading-none pt-[2px]">
            <span
              className={cn(
                "font-display text-[17px] md:text-[19px] tracking-[0.16em] font-semibold leading-[1.1] transition-smooth",
                scrolled || !isOnDarkHero
                  ? "text-verde-profundo"
                  : "text-dourado"
              )}
            >
              RENOVAÇÃO
            </span>
            <span
              className={cn(
                "font-display text-[13px] md:text-[14px] tracking-[0.42em] font-medium leading-[1.4] transition-smooth",
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
        <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
          {links.map((l) => {
            const isPilares = l.to === "/programas";
            if (isPilares) {
              return (
                <div
                  key={l.to}
                  className="relative"
                  onMouseEnter={() => setPilaresOpen(true)}
                  onMouseLeave={() => setPilaresOpen(false)}
                >
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center gap-1 px-4 py-2 rounded-lg text-[13px] font-medium tracking-wide transition-smooth",
                        "hover:bg-dourado/10 hover:text-dourado",
                        isActive
                          ? "text-dourado"
                          : scrolled || !isOnDarkHero
                            ? "text-verde-profundo"
                            : "text-bege-claro/90"
                      )
                    }
                  >
                    {l.label}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </NavLink>
                  {pilaresOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[560px] animate-fade-in">
                      <div className="bg-card border border-bege rounded-2xl shadow-soft p-5 grid grid-cols-2 gap-2">
                        {pilaresMenu.map((p) => (
                          <Link
                            key={p.title}
                            to="/metodo#pilares"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-bege-claro transition-smooth group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold group-hover:scale-105 transition-smooth">
                              <p.icon className="w-4 h-4 text-verde-profundo" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-verde-profundo text-[13px] leading-tight">{p.title}</p>
                              <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{p.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
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
            );
          })}
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
          <nav className="container flex flex-col py-5 gap-1" aria-label="Mobile">
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
