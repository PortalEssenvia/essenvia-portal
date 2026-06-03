import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { end: 2400, prefix: "+", label: "pessoas em jornada" },
  { end: 87, suffix: "%", label: "relatam mudança em 30 dias" },
  { end: 4.9, label: "estrelas de avaliação média", decimals: 1 },
  { end: 180, prefix: "+", label: "dias de comunidade ativa" },
];

interface Testimonial { id: string; name: string; role: string; content: string; avatar_url: string | null; }

const useCountUp = (end: number, decimals = 0) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return decimals ? v.toFixed(decimals) : Math.round(v).toString();
};

const Stat = ({ s }: { s: typeof stats[0] }) => {
  const v = useCountUp(s.end, s.decimals);
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-5xl text-dourado mb-2">{s.prefix || ""}{v}{s.suffix || ""}</p>
      <p className="text-bege/80 text-sm">{s.label}</p>
    </div>
  );
};

const Depoimentos = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  useEffect(() => {
    supabase.from("testimonials").select("id,name,role,content,avatar_url").eq("published", true).order("sort_order")
      .then(({ data }) => setTestimonials((data as Testimonial[]) || []));
  }, []);
  return (
  <>
    <section className="py-20 bg-gradient-soft">
      <div className="container">
        <SectionHeader eyebrow="Depoimentos" title="Vidas em transformação" />
      </div>
    </section>
    <section className="py-16 bg-gradient-deep">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => <Stat key={i} s={s} />)}
      </div>
    </section>
    <section className="py-20">
      <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.length === 0 && <p className="text-muted-foreground col-span-full text-center">Em breve novos depoimentos.</p>}
        {testimonials.map((t) => (
          <Card key={t.id} className="p-8 bg-card border-bege shadow-card">
            <div className="flex items-center gap-4 mb-4">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center font-display text-verde-profundo text-lg">
                  {t.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-verde-profundo">{t.name}</p>
                {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
              </div>
            </div>
            <div className="flex gap-1 text-dourado mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-dourado" />)}
            </div>
            <p className="text-muted-foreground italic leading-relaxed">"{t.content}"</p>
          </Card>
        ))}
      </div>
    </section>
  </>
  );
};

export default Depoimentos;
