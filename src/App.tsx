/**
 * App.tsx — com DailyCheckProvider integrado
 *
 * O DailyCheckProvider inicializa o hook useDailyCheck() assim que o
 * usuário faz login, garantindo que o registro do dia exista no Supabase.
 * Componentes filhos podem acessar o estado via useDailyCheckContext().
 */

import { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SessionExpiredGate } from "@/components/SessionExpiredGate";
import { useDailyCheck, type DailyCheckState } from "@/hooks/useDailyCheck";

import Home        from "./pages/Home";
import Metodo      from "./pages/Metodo";
import Programas   from "./pages/Programas";
import Ferramentas from "./pages/Ferramentas";
import Cursos      from "./pages/Cursos";
import Conteudos   from "./pages/Conteudos";
import Depoimentos from "./pages/Depoimentos";
import Comunidade  from "./pages/Comunidade";
import Entrar      from "./pages/Entrar";
import NotFound    from "./pages/NotFound";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPaginas from "./pages/admin/AdminPaginas";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminDepoimentos from "./pages/admin/AdminDepoimentos";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// ─── Context para DailyCheck ──────────────────────────────────────────────────

const DailyCheckCtx = createContext<DailyCheckState>({
  currentDay:   null,
  todayChecked: false,
  loading:      true,
  error:        null,
  refetch:      () => {},
});

/**
 * Hook para consumir o estado do daily check em qualquer componente.
 * Exemplo:
 *   const { todayChecked, currentDay } = useDailyCheckContext();
 */
export const useDailyCheckContext = () => useContext(DailyCheckCtx);

/**
 * Provider interno — deve ficar DENTRO do AuthProvider para ter
 * acesso ao usuário autenticado via useAuth().
 */
function DailyCheckProvider({ children }: { children: React.ReactNode }) {
  const state = useDailyCheck();
  return (
    <DailyCheckCtx.Provider value={state}>
      {children}
    </DailyCheckCtx.Provider>
  );
}

// ─── QueryClient ──────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* DailyCheckProvider dentro do AuthProvider para ter acesso ao user */}
          <DailyCheckProvider>
            <SessionExpiredGate />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/"            element={<Home />} />
                <Route path="/metodo"      element={<Metodo />} />
                <Route path="/programas"   element={<Programas />} />
                <Route path="/ferramentas" element={<ProtectedRoute><Ferramentas /></ProtectedRoute>} />
                <Route path="/cursos"      element={<Cursos />} />
                <Route path="/conteudos"   element={<Conteudos />} />
                <Route path="/depoimentos" element={<Depoimentos />} />
                <Route path="/comunidade"  element={<Comunidade />} />
                <Route path="/entrar"      element={<Entrar />} />
              </Route>
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="paginas" element={<AdminPaginas />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="depoimentos" element={<AdminDepoimentos />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DailyCheckProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
