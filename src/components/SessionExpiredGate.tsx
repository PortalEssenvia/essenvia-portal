import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

/**
 * Quando o refresh do token falha (sessão expirada), leva o usuário
 * de volta para /entrar guardando a rota atual, em vez de deixá-lo
 * preso numa tela com erro.
 */
export function SessionExpiredGate() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionExpired) return;
    clearSessionExpired();
    toast({
      title: "Sua sessão expirou",
      description: "Entre novamente para continuar de onde parou.",
    });
    if (location.pathname !== "/entrar") {
      navigate("/entrar", { replace: true, state: { from: location.pathname } });
    }
  }, [sessionExpired, clearSessionExpired, navigate, location.pathname]);

  return null;
}
