import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  light,
}: Props) => (
  <div
    className={cn(
      "max-w-3xl",
      align === "center" ? "mx-auto text-center" : "text-left",
      className
    )}
  >
    {eyebrow && (
      <div className={cn("mb-4", align === "center" ? "flex justify-center" : "")}>
        <span className={cn(
          "eyebrow-pill",
          light && "bg-dourado/15 border-dourado/30 text-dourado"
        )}>
          {eyebrow}
        </span>
      </div>
    )}
    <h2
      className={cn(
        "font-display leading-tight mb-5",
        "text-3xl md:text-4xl lg:text-5xl",
        light ? "text-bege-claro" : "text-verde-profundo"
      )}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className={cn(
          "text-base md:text-lg leading-relaxed",
          light ? "text-bege/80" : "text-muted-foreground"
        )}
      >
        {subtitle}
      </p>
    )}
  </div>
);
