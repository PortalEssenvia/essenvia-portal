import { useEffect, useRef, useState } from "react";

interface Stat {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

const stats: Stat[] = [
  { end: 2400, prefix: "+", label: "pessoas renovadas" },
  { end: 87, suffix: "%", label: "relatam mudança em 30 dias" },
  { end: 4.9, suffix: "★", decimals: 1, label: "avaliação média" },
  { end: 7, label: "pilares integrados" },
];

const useCountUp = (end: number, start: boolean, decimals = 0) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const dur = 1800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, start]);
  return decimals ? v.toFixed(decimals) : Math.round(v).toString();
};

const StatItem = ({ s, active }: { s: Stat; active: boolean }) => {
  const v = useCountUp(s.end, active, s.decimals);
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-6xl text-dourado font-semibold mb-2 leading-none">
        {s.prefix || ""}{v}{s.suffix || ""}
      </p>
      <p className="text-bege/80 text-xs md:text-sm tracking-wide">{s.label}</p>
    </div>
  );
};

export const StatsBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setActive(true),
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-label="Provas sociais" className="bg-verde-profundo py-14 md:py-16">
      <div ref={ref} className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => <StatItem key={i} s={s} active={active} />)}
      </div>
    </section>
  );
};