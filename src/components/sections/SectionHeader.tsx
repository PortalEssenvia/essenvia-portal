import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}
export const SectionHeader = ({ eyebrow, title, subtitle, align = "center", className, light }: Props) => (
  <div className={cn("max-w-3xl mx-auto", align === "center" ? "text-center" : "text-left", className)}>
    {eyebrow && (
      <p className={cn("text-xs tracking-[0.3em] uppercase mb-3 font-semibold", light ? "text-dourado" : "text-dourado")}>
        {eyebrow}
      </p>
    )}
    <h2 className={cn("font-display text-3xl md:text-5xl leading-tight mb-5", light ? "text-bege-claro" : "text-verde-profundo")}>
      {title}
    </h2>
    {subtitle && (
      <p className={cn("text-base md:text-lg leading-relaxed", light ? "text-bege/80" : "text-muted-foreground")}>
        {subtitle}
      </p>
    )}
  </div>
);
