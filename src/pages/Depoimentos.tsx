import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Star } from "lucide-react";

const stats = [
  { end: 2400, prefix: "+", label: "pessoas em processo de renovação" },
  { end: 87, suffix: "%", label: "relatam transformação em 30 dias" },
  { end: 4.9, label: "estrelas de avaliação média", decimals: 1 },
  { end: 12, label: "sessões no protocolo completo" },
];

const testimonials = [
  {
    name: "Mariana S.",
    city: "São Paulo, SP",
    text: "Pela primeira vez entendi por que repetia os mesmos padrões emocionais. O MRC me deu ferramentas reais, não apenas conforto.",
    pilar: "Renovação Emocional",
  },
  {
    name: "Rafael C.",
    city: "Belo Horizonte, MG",
    text: "A Constelação Familiar me mostrou de onde vinham meus bloqueios. Em 60 dias reprocessei traumas de anos com a TRG.",
    pilar: "Renovação Sistêmica",
  },
  {
    name: "Ana Paula",
    city: "Curitiba, PR",
    text: "Voltei a dormir bem, a me sentir presente, a ter propósito. O Método Renovação Constante me devolveu a mim mesma.",
    pilar: "Renovação do Sono",
  },
  {
    name: "Lucas M.",
    city: "Rio de Janeiro, RJ",
    text: "Não é mais um curso de autoajuda. É um processo real. Estou no melhor momento emocional da minha vida.",
    pilar: "Processo Integral",
  },
  {
    name: "Juliana T.",
    city: "Recife, PE",
    text: "A Respiração RC e as afirmações transformaram minha manhã. Hoje acordo com clareza e propósito.",
    pilar: "Renovação Mental",
  },
  {
    name: "Carlos H.",
    city: "Porto Alegre, RS",
    text: "O Movimento da Renovação junto com o trabalho emocional mudou minha energia completamente. Meu corpo e mente falam a mesma língua.",
    pilar: "Renovação do Corpo",
  },
];

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
      <p className="font-display text-4xl md:text-5xl text-dourado mb-2">
        {s.prefix || ""}{v}{s.suffix || ""}
      </p>
      <p className="text-bege/80 text-sm">{s.label}</p>
    </div>
  );
};

const Depoimentos = () => (
  <>
    <section className="py-20 bg-gradient-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Depoimentos"
          title="Histórias de renovação real"
          subtitle="Resultados concretos de pessoas que percorreram o Método Renovação Constante."
        />
      </div>
    </section>

    <section className="py-16 bg-gradient-deep">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => <Stat key={i} s={s} />)}
      </div>
    </section>

    <section className="py-20">
      <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <Card key={t.name} className="p-8 bg-card border-bege shadow-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center font-display text-verde-profundo text-lg">
                {t.name[0]}
              </div>
              <div>
                <p className="font-semibold text-verde-profundo">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city}</p>
              </div>
            </div>
            <div className="flex gap-1 text-dourado mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-dourado" />)}
            </div>
            <p className="text-muted-foreground italic leading-relaxed mb-4">"{t.text}"</p>
            <span className="text-xs uppercase tracking-widest text-dourado font-semibold">{t.pilar}</span>
          </Card>
        ))}
      </div>
    </section>
  </>
);

export default Depoimentos;
