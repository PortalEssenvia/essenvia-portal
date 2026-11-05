import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, ChevronDown,
  Heart, Brain, Compass, Moon, Activity, Zap, Sparkles,
  Home, BookOpen, PlayCircle, Users, Wrench,
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

const mobileIcons: Record<string, typeof Heart> = {
  "/": Home, "/metodo": BookOpen, "/programas": Sparkles,
  "/conteudos": PlayCircle, "/comunidade": Users, "/ferramentas": Wrench,
};

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

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
      <div className="container flex items-center justify-between h-16 lg:h-[90px] gap-3">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2 lg:gap-3 min-w-0 py-1 group"
          aria-label="Renovação Constante — Início"
        >
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className={cn(
                "h-11 w-11 lg:h-20 lg:w-20 object-contain rounded-full transition-smooth group-hover:scale-[1.03]"
              )}
            />
          </div>
          <div className="flex flex-col leading-none pt-[2px]">
            <span
              className={cn(
                "font-display text-sm lg:text-[19px] tracking-[0.08em] lg:tracking-[0.16em] font-semibold leading-[1.1] transition-smooth",
                scrolled || !isOnDarkHero
                  ? "text-verde-profundo"
                  : "text-dourado"
              )}
            >
              RENOVAÇÃO
            </span>
            <span
              className={cn(
                "font-display text-[11px] lg:text-[14px] tracking-[0.2em] lg:tracking-[0.42em] font-medium leading-[1.4] transition-smooth",
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
            "lg:hidden shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg transition-smooth",
            scrolled || !isOnDarkHero
              ? "text-verde-profundo hover:bg-bege"
              : "text-bege-claro hover:bg-white/10"
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {open && createPortal(
        <div className="lg:hidden fixed inset-0 z-[60] bg-verde-profundo flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between px-4 h-16 border-b border-dourado/20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            {user ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-verde-profundo font-bold shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-bege-claro font-medium truncate">Olá, {displayName}</span>
              </div>
            ) : (
              <span className="font-display text-dourado tracking-wide">Menu</span>
            )}
            <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-bege-claro hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Mobile">
            {links.map((l) => {
              const Icon = mobileIcons[l.to] ?? Sparkles;
              if (l.to === "/programas") {
                return (
                  <div key={l.to} className="border-b border-white/10">
                    <button
                      onClick={() => setPilaresOpen((v) => !v)}
                      aria-expanded={pilaresOpen}
                      className="w-full flex items-center gap-3 py-4 text-lg text-white min-h-[44px]"
                    >
                      <Icon className="w-5 h-5 text-dourado" />
                      <span className="flex-1 text-left">{l.label}</span>
                      <ChevronDown className={cn("w-5 h-5 transition-transform", pilaresOpen && "rotate-180")} />
                    </button>
                    {pilaresOpen && (
                      <div className="pb-3 pl-8 space-y-1">
                        <Link to="/programas" onClick={() => setOpen(false)} className="block py-3 text-base text-dourado">Ver todos os pilares</Link>
                        {pilaresMenu.map((p) => (
                          <Link key={p.title} to="/metodo#pilares" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3 text-base text-white/90">
                            <p.icon className="w-4 h-4 text-dourado shrink-0" />{p.title}
                          </Link>
                        ))}
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
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn("flex items-center gap-3 py-4 text-lg border-b border-white/10 min-h-[44px]", isActive ? "text-dourado" : "text-white")
                  }
                >
                  <Icon className="w-5 h-5 text-dourado" />
                  {l.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="px-4 pt-4 border-t border-dourado/20" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            {user ? (
              <Button variant="outline" size="lg" className="w-full h-12 rounded-xl bg-transparent border-dourado/50 text-bege-claro hover:bg-white/10" onClick={() => { setOpen(false); handleSignOut(); }}>
                <LogOut className="w-4 h-4 mr-2" />Sair
              </Button>
            ) : (
              <Button asChild variant="gold" size="lg" className="w-full h-12 rounded-xl font-semibold">
                <Link to="/entrar" onClick={() => setOpen(false)}>Comece sua Renovação</Link>
              </Button>
            )}
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
