import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Sunrise, Unlock, RefreshCw, Building2, Sparkles, Check } from "lucide-react";

const phases = [
  {
    n: "01", icon: Sunrise, title: "Despertar", color: "from-dourado/20 to-transparent",
    quote: "Ver com clareza é o início da cura.",
    objective: "Consciência de padrões, vícios e gatilhos.",
    work: ["Hábitos automáticos", "Emoções e gatilhos", "Responsabilidade pessoal", "Mapas de padrões"],
    tools: ["Diário guiado", "Teste de padrões", "Mapeamento de gatilhos", "Conteúdos educativos"],
  },
  {
    n: "02", icon: Unlock, title: "Libertar", color: "from-verde-medio/20 to-transparent",
    quote: "Você não muda sem quebrar o que te prende.",
    objective: "Romper ciclos de vício e padrões repetitivos.",
    work: ["Quebra de ciclos", "Suporte em recaídas", "Detox digital", "Presença e corpo"],
    tools: ["Protocolos de emergência", "Rotinas anti-recaída", "Desintoxicação digital", "Exercícios de presença"],
  },
  {
    n: "03", icon: RefreshCw, title: "Reprogramar", color: "from-bege to-transparent",
    quote: "Você não só abandona um padrão — você cria um novo.",
    objective: "Construir nova rotina e nova identidade.",
    work: ["Hábitos saudáveis", "Identidade renovada", "Disciplina sustentável", "Pequenas vitórias"],
    tools: ["Planner Essenvia", "Rotina diária guiada", "Checklists de hábitos", "Sistema de vitórias"],
  },
  {
    n: "04", icon: Building2, title: "Sustentar", color: "from-azul-escuro/20 to-transparent",
    quote: "Transformação só é real quando se mantém.",
    objective: "Evitar recaídas e consolidar a nova vida.",
    work: ["Manutenção", "Revisões periódicas", "Conexão de comunidade", "Aprofundamento"],
    tools: ["Plano de manutenção", "Revisões semanais", "Comunidade", "Conteúdo avançado"],
  },
];

const plans = [
  { name: "Gratuito", price: "R$ 0", features: ["Conteúdo introdutório", "Acesso ao blog", "1 ferramenta básica"], cta: "Começar grátis" },
  { name: "Essenvia", price: "R$ 49/mês", features: ["Método completo", "Todas as ferramentas", "Comunidade ativa", "Conteúdos exclusivos"], cta: "Quero o método", featured: true },
  { name: "Premium", price: "Em breve", features: ["Mentoria 1:1", "Workshops ao vivo", "Acompanhamento personalizado"], cta: "Lista de espera" },
];

const Metodo = () => (
  <>
    <section className="py-20 md:py-28 bg-gradient-soft">
      <div className="container">
        <SectionHeader eyebrow="O Método" title="Um caminho em quatro fases" subtitle="Cada fase trata uma camada da transformação. Juntas, elas reconstroem sua vida do interior para o exterior." />
      </div>
    </section>

    {phases.map((p, i) => (
      <section key={p.title} className={`py-20 ${i % 2 === 0 ? "bg-background" : "bg-bege-claro"}`}>
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
            <div className={`bg-gradient-to-br ${p.color} rounded-3xl p-12 border border-bege relative overflow-hidden`}>
              <div className="text-dourado/30 font-display text-[10rem] leading-none absolute -top-4 -right-2">{p.n}</div>
              <p.icon className="w-14 h-14 text-verde-profundo mb-6 relative" />
              <h3 className="font-display text-4xl text-verde-profundo relative mb-2">FASE {p.n}</h3>
              <p className="font-display text-3xl text-dourado relative">{p.title}</p>
            </div>
          </div>
          <div>
            <p className="font-display text-2xl text-verde-profundo italic mb-6">"{p.quote}"</p>
            <p className="text-muted-foreground mb-6"><strong className="text-verde-profundo">Objetivo:</strong> {p.objective}</p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-verde-profundo mb-3 text-sm uppercase tracking-wider">Trabalhos</h4>
                <ul className="space-y-2">
                  {p.work.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{w}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-verde-profundo mb-3 text-sm uppercase tracking-wider">Ferramentas</h4>
                <ul className="space-y-2">
                  {p.tools.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    ))}

    {/* PILAR CONTÍNUO */}
    <section className="py-24 bg-gradient-deep">
      <div className="container max-w-4xl text-center">
        <Sparkles className="w-12 h-12 text-dourado mx-auto mb-6" />
        <p className="text-dourado tracking-[0.3em] uppercase text-xs mb-3">Pilar Contínuo</p>
        <h2 className="font-display text-4xl md:text-5xl text-bege-claro mb-6">Alinhamento Essencial</h2>
        <p className="text-bege/80 text-lg leading-relaxed">
          Reconexão com a essência, práticas de presença, reflexões guiadas e clareza de valores e propósito —
          presentes em todas as fases da jornada.
        </p>
      </div>
    </section>

    {/* PLANOS */}
    <section className="py-24 bg-background">
      <div className="container">
        <SectionHeader eyebrow="Planos" title="Escolha seu caminho" />
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {plans.map((pl) => (
            <Card key={pl.name} className={`p-8 ${pl.featured ? "bg-gradient-deep text-bege-claro border-dourado scale-105 shadow-gold" : "bg-card border-bege"}`}>
              <h3 className={`font-display text-2xl mb-2 ${pl.featured ? "text-dourado" : "text-verde-profundo"}`}>{pl.name}</h3>
              <p className={`text-3xl font-display mb-6 ${pl.featured ? "text-bege-claro" : "text-verde-profundo"}`}>{pl.price}</p>
              <ul className="space-y-3 mb-8">
                {pl.features.map((f) => (
                  <li key={f} className="flex gap-2 items-start text-sm"><Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button asChild variant={pl.featured ? "hero" : "outlineGold"} className="w-full"><Link to="/entrar">{pl.cta}</Link></Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Metodo;
