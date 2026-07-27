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

export const NotificationsCard = () => {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    setSupported(notificationsSupported());
    if (notificationsSupported()) {
      setPerm(Notification.permission);
      setEnabled(notificationsEnabled() && Notification.permission === "granted");
    }
  }, []);

  if (!supported) return null;

  const handleEnable = async () => {
    const p = await enableNotifications();
    setPerm(p);
    if (p === "granted") {
      setEnabled(true);
      toast.success("Lembretes ativados! Você receberá avisos nos horários das suas práticas.");
      new Notification("Nova Essenvia", { body: "Notificações ativadas ✨", icon: "/logo.png" });
    } else if (p === "denied") {
      toast.error("Permissão negada. Ative nas configurações do navegador.");
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
            Receba um aviso no horário configurado de cada prática. Instale o app na tela inicial
            para lembretes mesmo com o navegador fechado.
          </p>
        </div>
      </div>

      {enabled ? (
        <Button variant="outline" size="sm" className="w-full" onClick={handleDisable}>
          <BellOff className="w-4 h-4 mr-2" />
          Desativar lembretes
        </Button>
      ) : (
        <Button variant="deep" size="sm" className="w-full" onClick={handleEnable} disabled={perm === "denied"}>
          <Bell className="w-4 h-4 mr-2" />
          {perm === "denied" ? "Bloqueado no navegador" : "Ativar lembretes"}
        </Button>
      )}
    </Card>
  );
};