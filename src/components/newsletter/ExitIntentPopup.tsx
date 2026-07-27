import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewsletterForm } from "./NewsletterForm";
import { track } from "@/lib/track";
import { Sparkles } from "lucide-react";

const SHOWN_KEY = "exit_popup_shown";

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY) === "1") return;

    const trigger = (reason: string) => {
      if (sessionStorage.getItem(SHOWN_KEY) === "1") return;
      sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
      void track("exit_popup_open", { reason });
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger("mouseleave");
    };

    // Mobile fallback: after 45s on page
    const timer = window.setTimeout(() => trigger("timer"), 45_000);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.clearTimeout(timer);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next && open) void track("exit_popup_close", {});
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-dourado/15 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-dourado" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            Antes de sair...
          </DialogTitle>
          <DialogDescription className="text-center">
            Receba o guia gratuito dos 7 Pilares da Renovação Constante direto no seu e-mail.
          </DialogDescription>
        </DialogHeader>
        <NewsletterForm
          source="exit_popup"
          buttonLabel="Quero receber"
          onSuccess={() => setOpen(false)}
          className="mt-2"
        />
        <p className="text-xs text-center text-muted-foreground mt-2">
          Sem spam. Cancele quando quiser.
        </p>
      </DialogContent>
    </Dialog>
  );
};