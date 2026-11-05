import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Video, MessageSquareQuote, FileEdit, ArrowLeft, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/admin/paginas", label: "Páginas", icon: FileEdit },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/videos", label: "Vídeos", icon: Video },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bege-claro">
      <aside className="w-full lg:w-64 shrink-0 bg-verde-profundo text-bege-claro flex flex-col">
        <div className="p-4 lg:p-6 border-b border-bege-claro/10">
          <p className="font-display text-xl">Admin</p>
          <p className="text-xs text-bege/60 mt-1">Nova Essenvia</p>
        </div>
        <nav className="flex lg:flex-col lg:flex-1 gap-2 lg:gap-1 p-3 overflow-x-auto snap-x">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 min-h-[44px] shrink-0 snap-start whitespace-nowrap rounded-lg text-sm transition-colors",
                  isActive ? "bg-dourado text-verde-profundo font-medium" : "hover:bg-bege-claro/10"
                )
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-bege-claro/10 grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Button asChild variant="outline" size="sm" className="w-full bg-transparent text-bege-claro border-bege-claro/30 hover:bg-bege-claro/10">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Ver site</Link>
          </Button>
          <Button size="sm" variant="ghost" className="w-full text-bege-claro hover:bg-bege-claro/10" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}