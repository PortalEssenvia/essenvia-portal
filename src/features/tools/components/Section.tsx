import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: ReactNode;
  action?: ReactNode;
}

export function Section({ title, defaultOpen = true, collapsible = false, children, action }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <section className="rounded-xl border border-bege bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg text-verde-profundo">{title}</h4>
          {action}
        </div>
        <div className="space-y-3">{children}</div>
      </section>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="rounded-xl border border-bege bg-card p-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h4 className="font-display text-lg text-verde-profundo">{title}</h4>
          <ChevronDown className={`w-5 h-5 text-verde-medio transition-transform ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">{children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}