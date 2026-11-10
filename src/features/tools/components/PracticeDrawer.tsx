import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import type { PracticeMeta } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: PracticeMeta;
  active: boolean;
  onActiveChange: (v: boolean) => void;
  done?: boolean;
  onComplete?: () => void;
  children: ReactNode;
}

export function PracticeDrawer({ open, onOpenChange, meta, active, onActiveChange, done, onComplete, children }: Props) {
  const isMobile = useIsMobile();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="w-full max-h-[92dvh] rounded-t-2xl sm:max-h-none sm:rounded-none sm:max-w-xl md:max-w-2xl overflow-y-auto bg-bege-claro p-0 flex flex-col"
      >
        <SheetHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-bege px-4 sm:px-6 py-3 sm:py-4 flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{meta.icon}</span>
            <SheetTitle className="font-display text-xl sm:text-2xl text-verde-profundo">{meta.label}</SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="practice-active" className="text-xs text-muted-foreground">
              {active ? "✅ Ativa" : "❌ Inativa"}
            </Label>
            <Switch id="practice-active" checked={active} onCheckedChange={onActiveChange} />
          </div>
        </SheetHeader>
        <div className="p-4 sm:p-6 space-y-6 flex-1 min-w-0">{children}</div>
        <div className="sticky bottom-0 z-10 bg-card/95 backdrop-blur border-t border-bege px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-11 border-verde-profundo/30 text-verde-profundo hover:bg-bege"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para práticas
          </Button>
          {onComplete && (
            <Button
              type="button"
              onClick={() => {
                onComplete();
                onOpenChange(false);
              }}
              className={
                done
                  ? "bg-verde-medio hover:bg-verde-profundo text-bege-claro"
                  : "bg-verde-profundo hover:bg-verde-medio text-bege-claro"
              }
            >
              {done ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluída — voltar
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como concluída
                </>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}