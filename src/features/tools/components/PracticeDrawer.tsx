import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";
import type { PracticeMeta } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: PracticeMeta;
  active: boolean;
  onActiveChange: (v: boolean) => void;
  children: ReactNode;
}

export function PracticeDrawer({ open, onOpenChange, meta, active, onActiveChange, children }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto bg-bege-claro p-0"
      >
        <SheetHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-bege px-6 py-4 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.icon}</span>
            <SheetTitle className="font-display text-2xl text-verde-profundo">{meta.label}</SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="practice-active" className="text-xs text-muted-foreground">
              {active ? "✅ Ativa" : "❌ Inativa"}
            </Label>
            <Switch id="practice-active" checked={active} onCheckedChange={onActiveChange} />
          </div>
        </SheetHeader>
        <div className="p-6 space-y-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}