import { Flame, Sparkles, Award, Crown, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Tier {
  min: number;
  label: string;
  icon: typeof Flame;
  color: string; // tailwind text color
  bg: string;
}

export const TIERS: Tier[] = [
  { min: 0,   label: "Comece hoje",     icon: Sparkles, color: "text-muted-foreground", bg: "bg-bege" },
  { min: 1,   label: "Primeiro passo",  icon: Flame,    color: "text-dourado",          bg: "bg-dourado/15" },
  { min: 3,   label: "Consistente",     icon: Flame,    color: "text-dourado-vivo",     bg: "bg-dourado/25" },
  { min: 7,   label: "Uma semana",      icon: Award,    color: "text-cobre",            bg: "bg-cobre/15" },
  { min: 14,  label: "Guerreiro",       icon: Trophy,   color: "text-verde-profundo",   bg: "bg-verde-claro/40" },
  { min: 30,  label: "Mestre",          icon: Crown,    color: "text-verde-profundo",   bg: "bg-gradient-gold" },
  { min: 60,  label: "Iluminado",       icon: Star,     color: "text-verde-profundo",   bg: "bg-gradient-gold" },
  { min: 100, label: "Lendário",        icon: Crown,    color: "text-verde-profundo",   bg: "bg-gradient-gold shadow-gold" },
];

export const tierFor = (streak: number): Tier =>
  [...TIERS].reverse().find((t) => streak >= t.min) ?? TIERS[0];

export const nextTier = (streak: number): Tier | null =>
  TIERS.find((t) => t.min > streak) ?? null;

export const StreakBadge = ({ streak }: { streak: number }) => {
  const t = tierFor(streak);
  const nt = nextTier(streak);
  const Icon = t.icon;
  const progress = nt ? Math.min(100, (streak / nt.min) * 100) : 100;

  return (
    <div className={cn("flex items-center gap-3 px-4 py-2 rounded-full", t.bg)}>
      <Icon className={cn("w-4 h-4", t.color)} aria-hidden="true" />
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-sm text-verde-profundo">
          {streak} {streak === 1 ? "dia" : "dias"} · {t.label}
        </span>
        {nt && (
          <span className="text-[10px] text-verde-profundo/70">
            {nt.min - streak} para <strong>{nt.label}</strong>
          </span>
        )}
      </div>
      {nt && (
        <div className="w-14 h-1.5 rounded-full bg-verde-profundo/10 overflow-hidden hidden sm:block" aria-hidden="true">
          <div className="h-full bg-verde-profundo/70" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export const AchievementsCard = ({ streak }: { streak: number }) => {
  return (
    <div>
      <h3 className="font-display text-xl text-verde-profundo mb-4">Conquistas</h3>
      <ul className="space-y-2">
        {TIERS.filter((t) => t.min > 0).map((t) => {
          const unlocked = streak >= t.min;
          const Icon = t.icon;
          return (
            <li
              key={t.min}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-smooth",
                unlocked ? t.bg : "bg-bege/40 opacity-60"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                unlocked ? "bg-verde-profundo/10" : "bg-bege"
              )}>
                <Icon className={cn("w-4 h-4", unlocked ? t.color : "text-muted-foreground")} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", unlocked ? "text-verde-profundo" : "text-muted-foreground")}>
                  {t.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t.min} {t.min === 1 ? "dia" : "dias"} seguidos
                </p>
              </div>
              {unlocked && <span className="text-[10px] font-semibold text-verde-profundo">✓</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};