import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-verde-profundo">Carregando...</div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}