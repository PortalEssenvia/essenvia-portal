import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  disableNotifications,
  enableNotifications,
  notificationsEnabled,
  notificationsSupported,
} from "@/lib/notifications";
import { requestFcmToken, isFirebaseSupported, onForegroundMessage } from "@/lib/firebase";

export const NotificationsCard = () => {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported(notificationsSupported() && isFirebaseSupported());
    if (notificationsSupported()) {
      setPerm(Notification.permission);
      setEnabled(notificationsEnabled() && Notification.permission === "granted");
      // Pede a permissão automaticamente na primeira visita à aba
      if (Notification.permission === "default") {
        void Notification.requestPermission().then((p) => setPerm(p));
      }
      // Mantém o status sincronizado se o usuário mudar no navegador
      navigator.permissions
        ?.query({ name: "notifications" as PermissionName })
        .then((status) => {
          status.onchange = () => setPerm(Notification.permission);
        })
        .catch(() => {});
    }

    // Escuta mensagens em foreground vindas do FCM
    const unsubscribe = onForegroundMessage((payload) => {
      toast.info(payload.notification?.title || "Nova Essenvia", {
        description: payload.notification?.body,
        duration: 6000,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!supported) return null;

  const statusMeta =
    perm === "granted"
      ? { label: "Permitido", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" }
      : perm === "denied"
        ? { label: "Bloqueado", cls: "bg-red-100 text-red-800 border-red-200" }
        : { label: "Pendente", cls: "bg-amber-100 text-amber-800 border-amber-200" };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const p = await enableNotifications();
      setPerm(p);
      if (p === "granted") {
        const token = await requestFcmToken();
        setEnabled(true);
        if (token) {
          toast.success("Lembretes ativados! Você receberá avisos mesmo com o app fechado.");
        } else {
          toast.success("Lembretes locais ativados.");
        }
        try {
          new Notification("Nova Essenvia", { body: "Notificações ativadas ✨", icon: "/logo.png" });
        } catch {
          /* ignore */
        }
      } else if (p === "denied") {
        toast.error("Permissão negada. Ative nas configurações do navegador.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = () => {
    disableNotifications();
    setEnabled(false);
    toast.info("Lembretes desativados.");
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
          {enabled ? (
            <BellRing className="w-5 h-5 text-verde-profundo" />
          ) : (
            <Bell className="w-5 h-5 text-verde-profundo" />
          )}
        </div>
        <div>
          <h3 className="font-display text-base text-verde-profundo">Lembretes das práticas</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Receba um aviso no horário configurado de cada prática, mesmo quando o app não estiver aberto.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Permissão do navegador:</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
              {statusMeta.label}
            </span>
          </div>
          {perm === "denied" && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Para reativar, abra o cadeado ao lado do endereço do site e permita notificações.
            </p>
          )}
        </div>
      </div>

      {enabled ? (
        <Button variant="outline" size="sm" className="w-full" onClick={handleDisable}>
          <BellOff className="w-4 h-4 mr-2" />
          Desativar lembretes
        </Button>
      ) : (
        <Button
          variant="deep"
          size="sm"
          className="w-full"
          onClick={handleEnable}
          disabled={perm === "denied" || loading}
        >
          <Bell className="w-4 h-4 mr-2" />
          {perm === "denied" ? "Bloqueado no navegador" : loading ? "Ativando..." : "Ativar lembretes push"}
        </Button>
      )}
    </Card>
  );
};
