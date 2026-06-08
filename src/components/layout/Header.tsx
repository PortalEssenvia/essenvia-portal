import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseLinks = [
  { to: "/", label: "Início" },
  { to: "/metodo", label: "Método" },
  { to: "/programas", label: "Programas" },
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/comunidade", label: "Comunidade" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
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
    : [...baseLinks, { to: "/entrar", label: "Entrar" }];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          : "bg-gradient-to-b from-black/40 via-black/20 to-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-28 md:h-32">
        <Link to="/" className="flex items-center gap-1 py-2">
          <img
            src="/logo.png"
            alt="Nova Essenvia"
            className="h-24 md:h-32 lg:h-36 w-auto object-contain"
          />
          <span className={cn(
            "font-serif text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide leading-none transition-colors",
            scrolled ? "text-verde-profundo" : "text-bege-claro drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          )}>
            NOVA ESSENVIA
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium tracking-wide transition-smooth",
                  scrolled
                    ? cn("hover:text-dourado", isActive ? "text-dourado" : "text-verde-profundo")
                    : cn("hover:text-dourado-claro drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]", isActive ? "text-dourado-claro" : "text-bege-claro")
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium",
                  scrolled
                    ? "border-dourado text-verde-profundo hover:bg-dourado/10"
                    : "border-dourado-claro text-bege-claro hover:bg-bege-claro/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                )}>
                  <User className={cn("w-4 h-4", scrolled ? "text-dourado" : "text-dourado-claro")} />
                  <span>Olá, {displayName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-bege">
                <DropdownMenuItem
                  onClick={() => navigate("/ferramentas")}
                  className="cursor-pointer text-verde-profundo"
                >
                  Minhas Práticas
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer text-verde-profundo"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Painel Admin
                  </DropdownMenuItem>
                )}
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
            <Button asChild variant="gold" size="lg">
              <Link to="/entrar">Comece sua Jornada</Link>
            </Button>
          )}
        </div>

        <button
          aria-label="Abrir menu"
          className={cn("lg:hidden p-2 transition-colors", scrolled ? "text-verde-profundo" : "text-bege-claro")}
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
            {user ? (
              <Button variant="gold" size="lg" className="mt-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />Sair
              </Button>
            ) : (
              <Button asChild variant="gold" size="lg" className="mt-2">
                <Link to="/entrar">Comece sua Jornada</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
