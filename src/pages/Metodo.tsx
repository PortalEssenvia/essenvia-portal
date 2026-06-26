import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import {
  Heart, Users, Brain, Zap, Compass, Moon, Activity,
  Sparkles, Check, RefreshCw,
} from "lucide-react";

// ─── 7 PILARES DO MÉTODO RENOVAÇÃO CONSTANTE ─────────────────────────────────

const pillars = [
  {
    n: "01",
    icon: Heart,
    title: "Renovação Emocional",
    color: "from-dourado/20 to-transparent",
    base: "TRG – Terapia de Reprocessamento Generativo",
    quote: "As emoções não resolvidas tendem a controlar comportamentos, decisões e relacionamentos.",
    objective: "Identificar e reduzir cargas emocionais associadas a medos, ansiedade, culpa, vergonha, rejeição, abandono e frustrações.",
    work: ["Medos e ansiedades", "Culpa e vergonha", "Rejeição e abandono", "Frustrações acumuladas"],
    tools: ["TRG – Reprocessamento Generativo", "Diário emocional guiado", "Protocolos de regulação", "Mapeamento de gatilhos"],
  },
  {
    n: "02",
    icon: Users,
    title: "Renovação Sistêmica",
    color: "from-verde-medio/20 to-transparent",
    base: "Constelação Familiar",
    quote: "Compreender a origem dos padrões permite interromper ciclos repetitivos.",
    objective: "Compreender padrões familiares e relacionais que influenciam a vida atual.",
    work: ["Relacionamentos", "Prosperidade e escassez", "Autoestima sistêmica", "Lealdades inconscientes"],
    tools: ["Constelação Familiar", "Mapeamento sistêmico", "Exercícios de pertencimento", "Ressignificação de vínculos"],
  },
  {
    n: "03",
    icon: Brain,
    title: "Renovação Mental",
    color: "from-bege to-transparent",
    base: "Reprogramação cognitiva e afirmações conscientes",
    quote: "O pensamento influencia emoções, comportamentos e resultados.",
    objective: "Transformar pensamentos limitantes em pensamentos construtivos.",
    work: ["Autossabotagem", "Vitimização", "Crença de escassez", "Medos futuros"],
    tools: ["Afirmações conscientes", "Visualização criativa", "Diário de evolução", "Gratidão diária"],
  },
  {
    n: "04",
    icon: Zap,
    title: "Renovação Energética",
    color: "from-azul-escuro/20 to-transparent",
    base: "Consciência corporal e energética integrada",
    quote: "Corpo, mente e emoções funcionam como um sistema integrado.",
    objective: "Favorecer equilíbrio emocional através da consciência corporal e energética.",
    work: ["Tensões corporais", "Bloqueios energéticos", "Desconexão com o corpo", "Padrões respiratórios"],
    tools: ["Respiração consciente RC", "Relaxamento guiado", "Meditação", "Sons terapêuticos"],
  },
  {
    n: "05",
    icon: Compass,
    title: "Renovação de Propósito",
    color: "from-dourado/15 to-transparent",
    base: "Desenvolvimento de significado e coerência de vida",
    quote: "Uma vida sem propósito gera sofrimento; uma vida com propósito gera direção.",
    objective: "Desenvolver significado, direção e coerência de vida.",
    work: ["Valores pessoais", "Sentido existencial", "Responsabilidade pessoal", "Perdão e gratidão"],
    tools: ["Exercício Visão Renovada", "Mapa de valores", "Carta de Libertação", "Planejamento de propósito"],
  },
  {
    n: "06",
    icon: Moon,
    title: "Renovação do Sono",
    color: "from-verde-profundo/15 to-transparent",
    base: "Higiene do sono e recuperação natural",
    quote: "Uma mente cansada interpreta a vida de forma mais negativa.",
    objective: "Restaurar a capacidade natural de recuperação física e emocional.",
    work: ["Horários irregulares", "Estimulantes noturnos", "Telas antes de dormir", "Ambiente inadequado"],
    tools: ["Plano de Higiene do Sono", "Checklist noturno RC", "Técnica de relaxamento", "Protocolo de rotina noturna"],
  },
  {
    n: "07",
    icon: Activity,
    title: "Renovação do Corpo",
    color: "from-verde-medio/15 to-transparent",
    base: "Movimento físico como ferramenta de fortalecimento emocional",
    quote: "O corpo em movimento fortalece a mente.",
    objective: "Utilizar o movimento físico como ferramenta de fortalecimento emocional e mental.",
    work: ["Sedentarismo emocional", "Baixa autoestima corporal", "Falta de energia", "Ansiedade física"],
    tools: ["Plano de Movimento da Renovação", "Registro de atividades", "Caminhadas conscientes", "Yoga e alongamento"],
  },
];

// ─── 7 ETAPAS DO PROCESSO TERAPÊUTICO ────────────────────────────────────────

const steps = [
  { n: "01", title: "Acolher", desc: "Criar um espaço seguro, empático e sem julgamentos para o início da jornada." },
  { n: "02", title: "Identificar", desc: "Mapear padrões emocionais, bloqueios e a história que gerou os ciclos atuais." },
  { n: "03", title: "Reprocessar", desc: "Utilizar a TRG para reduzir as cargas emocionais associadas a traumas e bloqueios." },
  { n: "04", title: "Compreender", desc: "Trazer consciência sobre a origem sistêmica e familiar dos padrões identificados." },
  { n: "05", title: "Ressignificar", desc: "Atribuir novo sentido às experiências, transformando dor em aprendizado." },
  { n: "06", title: "Reprogramar", desc: "Instalar novos padrões de pensamento, emoção e comportamento de forma consistente." },
  { n: "07", title: "Renovar", desc: "Consolidar a nova versão de si mesmo — capaz de se renovar continuamente." },
];

// ─── PROTOCOLO DE 12 SESSÕES ──────────────────────────────────────────────────

const sessions = [
  { n: "01", title: "Avaliação Integral" },
  { n: "02", title: "História Emocional" },
  { n: "03", title: "Traumas e Bloqueios" },
  { n: "04", title: "Ansiedade e Medos" },
  { n: "05", title: "Sistema Familiar" },
  { n: "06", title: "Relacionamentos" },
  { n: "07", title: "Crenças Limitantes" },
  { n: "08", title: "Autoestima" },
  { n: "09", title: "Sono e Recuperação" },
  { n: "10", title: "Corpo e Movimento" },
  { n: "11", title: "Propósito e Futuro" },
  { n: "12", title: "Consolidação da Renovação" },
];

// ─── PLANOS ───────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    features: ["Conteúdo introdutório", "Acesso ao blog", "Exercício Roda da Renovação"],
    cta: "Começar grátis",
  },
  {
    name: "Método RC",
    price: "R$ 49/mês",
    features: ["7 Pilares completos", "Todas as ferramentas", "Comunidade ativa", "Protocolo de 12 sessões"],
    cta: "Quero me Renovar",
    featured: true,
  },
  {
    name: "Premium",
    price: "Em breve",
    features: ["Mentoria individual", "Workshops ao vivo", "Acompanhamento personalizado"],
    cta: "Lista de espera",
  },
];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

const Metodo = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    // Tenta rolar até a âncora; reexecuta se o elemento ainda não montou
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempt < 10) {
        setTimeout(() => tryScroll(attempt + 1), 100);
      }
    };
    tryScroll();
  }, [hash]);

  return (
  <>
    {/* HEADER */}
    <section className="py-20 md:py-28 bg-gradient-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Método Renovação Constante"
          title="7 Pilares para uma renovação completa"
          subtitle="Cada pilar trata uma dimensão do ser humano. Juntos, eles promovem equilíbrio emocional, consciência sistêmica, saúde física, clareza mental e conexão com seu propósito de vida."
        />
      </div>
    </section>

    {/* 7 PILARES */}
    <div id="pilares" className="scroll-mt-32">
    {pillars.map((p, i) => (
      <section key={p.title} className={`py-20 ${i % 2 === 0 ? "bg-background" : "bg-bege-claro"}`}>
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div className={i % 2 === 1 ? "lg:order-2" : ""}>
            <div className={`bg-gradient-to-br ${p.color} rounded-3xl p-12 border border-bege relative overflow-hidden`}>
              <div className="text-dourado/30 font-display text-[10rem] leading-none absolute -top-4 -right-2">{p.n}</div>
              <p.icon className="w-14 h-14 text-verde-profundo mb-6 relative" />
              <h3 className="font-display text-4xl text-verde-profundo relative mb-2">PILAR {p.n}</h3>
              <p className="font-display text-3xl text-dourado relative">{p.title}</p>
              <p className="text-sm text-muted-foreground mt-3 relative">Base: {p.base}</p>
            </div>
          </div>
          <div>
            <p className="font-display text-2xl text-verde-profundo italic mb-6">"{p.quote}"</p>
            <p className="text-muted-foreground mb-6">
              <strong className="text-verde-profundo">Objetivo:</strong> {p.objective}
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-verde-profundo mb-3 text-sm uppercase tracking-wider">O que trabalhamos</h4>
                <ul className="space-y-2">
                  {p.work.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-verde-profundo mb-3 text-sm uppercase tracking-wider">Ferramentas</h4>
                <ul className="space-y-2">
                  {p.tools.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    ))}
    </div>

    {/* 7 ETAPAS DO PROCESSO TERAPÊUTICO */}
    <section className="py-24 bg-gradient-deep">
      <div className="container">
        <SectionHeader
          eyebrow="Processo Terapêutico"
          title="As 7 etapas da renovação"
          subtitle="Cada sessão segue uma trajetória cuidadosamente estruturada, do acolhimento à consolidação."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {steps.map((s) => (
            <div key={s.n} className="bg-white/5 border border-dourado/20 rounded-2xl p-6 hover:bg-white/10 transition-smooth">
              <p className="font-display text-4xl text-dourado/40 mb-3">{s.n}</p>
              <h3 className="font-display text-xl text-bege-claro mb-2">{s.title}</h3>
              <p className="text-sm text-bege/70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PROTOCOLO 12 SESSÕES */}
    <section className="py-24 bg-bege-claro">
      <div className="container max-w-5xl">
        <SectionHeader
          eyebrow="Protocolo Oficial"
          title="12 sessões estruturadas"
          subtitle="O protocolo completo do Método Renovação Constante, do diagnóstico à consolidação da renovação."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-12">
          {sessions.map((s) => (
            <div key={s.n} className="bg-card rounded-xl p-5 border border-bege shadow-card text-center hover:-translate-y-0.5 transition-smooth">
              <p className="text-dourado font-display text-2xl mb-1">{s.n}</p>
              <p className="text-sm font-medium text-verde-profundo">{s.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ROTINA DIÁRIA */}
    <section className="py-24 bg-gradient-soft">
      <div className="container max-w-4xl text-center">
        <RefreshCw className="w-12 h-12 text-dourado mx-auto mb-6" />
        <p className="text-dourado tracking-[0.3em] uppercase text-xs mb-3">Rotina Diária MRC</p>
        <h2 className="font-display text-4xl md:text-5xl text-verde-profundo mb-6">
          15 a 20 minutos por dia
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          A Rotina Diária Renovação Constante é a prática que mantém e aprofunda a transformação entre as sessões.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-left mb-10">
          {[
            { icon: Zap, label: "Respiração consciente" },
            { icon: Heart, label: "Gratidão" },
            { icon: Sparkles, label: "Afirmações" },
            { icon: Compass, label: "Visualização" },
            { icon: Brain, label: "Planejamento do dia" },
            { icon: Activity, label: "Movimento corporal" },
            { icon: Moon, label: "Higiene do sono" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-card border border-bege rounded-xl p-4">
              <item.icon className="w-5 h-5 text-dourado shrink-0" />
              <span className="text-sm font-medium text-verde-profundo">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PILAR CONTÍNUO */}
    <section className="py-24 bg-gradient-deep">
      <div className="container max-w-4xl text-center">
        <Sparkles className="w-12 h-12 text-dourado mx-auto mb-6" />
        <p className="text-dourado tracking-[0.3em] uppercase text-xs mb-3">Missão do Método</p>
        <h2 className="font-display text-4xl md:text-5xl text-bege-claro mb-6">
          "Não buscamos apenas aliviar dores emocionais."
        </h2>
        <p className="text-bege/80 text-lg leading-relaxed">
          Buscamos desenvolver pessoas capazes de se renovar continuamente —
          integrando emoções, sistema familiar, mente, corpo, energia, propósito e hábitos saudáveis.
        </p>
      </div>
    </section>

    {/* PLANOS */}
    <section className="py-24 bg-background">
      <div className="container">
        <SectionHeader eyebrow="Planos" title="Escolha seu caminho de renovação" />
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {plans.map((pl) => (
            <Card
              key={pl.name}
              className={`p-8 ${pl.featured ? "bg-gradient-deep text-bege-claro border-dourado scale-105 shadow-gold" : "bg-card border-bege"}`}
            >
              <h3 className={`font-display text-2xl mb-2 ${pl.featured ? "text-dourado" : "text-verde-profundo"}`}>{pl.name}</h3>
              <p className={`text-3xl font-display mb-6 ${pl.featured ? "text-bege-claro" : "text-verde-profundo"}`}>{pl.price}</p>
              <ul className="space-y-3 mb-8">
                {pl.features.map((f) => (
                  <li key={f} className="flex gap-2 items-start text-sm">
                    <Check className="w-4 h-4 text-dourado mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={pl.featured ? "hero" : "outlineGold"} className="w-full">
                <Link to="/entrar">{pl.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
  );
};

export default Metodo;
