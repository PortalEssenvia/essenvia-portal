import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import {
  ChevronDown, Heart, Brain, Zap, Moon, Compass, Activity,
  Sparkles, Star, Target, Award, TrendingUp, ShieldCheck,
  RefreshCw, ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero-path.jpg";

const phrases = [
  "Renove suas emoções. Renove sua história. Renove sua vida.",
  "A transformação começa quando você assume responsabilidade pelo seu crescimento.",
  "Bloqueios emocionais podem ser reprocessados. Padrões podem ser interrompidos.",
  "Toda pessoa possui capacidade de renovação contínua.",
];

const pillars = [
  {
    icon: Heart,
    title: "Renovação Emocional",
    text: "Identifique e reduza cargas emocionais de medos, ansiedade, culpa e rejeição com a TRG.",
    color: "from-dourado/10 to-transparent border-dourado/20",
  },
  {
    icon: Brain,
    title: "Renovação Sistêmica",
    text: "Compreenda padrões familiares e relacionais que influenciam silenciosamente sua vida.",
    color: "from-verde-medio/10 to-transparent border-verde-medio/20",
  },
  {
    icon: Compass,
    title: "Renovação de Propósito",
    text: "Desenvolva significado, direção e coerência de vida — fortalecendo valores e sentido existencial.",
    color: "from-dourado/10 to-transparent border-dourado/20",
  },
];

const steps = [
  { icon: Star,      title: "Acolher",      text: "Espaço seguro, sem julgamentos.", n: "01" },
  { icon: Brain,     title: "Identificar",  text: "Reconhecer padrões e origens.", n: "02" },
  { icon: RefreshCw, title: "Reprocessar",  text: "Transformar cargas com a TRG.", n: "03" },
  { icon: Sparkles,  title: "Renovar",      text: "Consolidar sua nova versão.", n: "04" },
];

const benefits = [
  { icon: Target,     label: "Equilíbrio Emocional" },
  { icon: Brain,      label: "Clareza Mental" },
  { icon: Heart,      label: "Saúde Emocional" },
  { icon: TrendingUp, label: "Desenvolvimento Pessoal" },
  { icon: Zap,        label: "Energia e Motivação" },
  { icon: ShieldCheck,label: "Disciplina Sustentável" },
  { icon: Moon,       label: "Qualidade do Sono" },
  { icon: Compass,    label: "Propósito de Vida" },
];

const testimonials = [
  {
    name: "Mariana S.",
    city: "São Paulo, SP",
    text: "Pela primeira vez entendi por que repetia os mesmos padrões. O Método RC me deu um caminho real de transformação.",
    initial: "M",
  },
  {
    name: "Rafael C.",
    city: "Belo Horizonte, MG",
    text: "Em 60 dias reprocessei traumas de anos. O método não alivia a dor — ele transforma a origem.",
    initial: "R",
  },
  {
    name: "Ana Paula",
    city: "Curitiba, PR",
    text: "Voltei a dormir bem, a me sentir presente, a ter propósito. O MRC me devolveu a mim mesma.",
    initial: "A",
  },
];

const Home = () => {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-title"
        className="relative min-h-[100svh] flex items-center overflow-hidden -mt-[84px] pt-[84px]"
      >
        {/* Imagem + overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Caminho ao amanhecer"
            className="w-full h-full object-cover object-center"
            width={1920}
            height={1080}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2318]/95 via-[#0d2318]/75 to-[#0d2318]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2318]/60 via-transparent to-transparent" />
        </div>

        {/* Conteúdo */}
        <div className="container relative z-10 pt-10 pb-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="eyebrow-pill mb-8 animate-fade-in">
              Emoções · Família · Mente · Corpo · Propósito
            </div>

            {/* H1 */}
            <h1 id="hero-title" className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-white leading-[1.08] mb-6 animate-slide-up">
              Renove suas{" "}
              <span className="text-gradient-gold">emoções</span>.{" "}
              <br className="hidden sm:block" />
              Renove sua{" "}
              <span className="text-gradient-gold">história</span>.
            </h1>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl text-white/80 max-w-lg mb-10 leading-relaxed animate-slide-up delay-100">
              O Método Renovação Constante integra emoções, sistema familiar,
              mente, corpo, energia e propósito para promover sua renovação contínua.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-slide-up delay-200">
              <Button
                asChild
                variant="gold"
                size="lg"
                className="rounded-full px-8 font-semibold shadow-gold text-base animate-pulse-gold"
              >
                <Link to="/entrar">
                  Comece sua Renovação
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full px-8 border border-white/30 text-white hover:bg-white/10 hover:text-white text-base"
              >
                <Link to="/metodo">Conheça o Método</Link>
              </Button>
            </div>

            {/* Prova social rápida */}
            <div className="flex items-center gap-6 mt-12 animate-fade-in delay-300">
              <div className="flex -space-x-2">
                {["M","R","A","J","C"].map((l, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-gold border-2 border-white/20 flex items-center justify-center text-verde-profundo text-xs font-bold"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-dourado text-dourado" />
                  ))}
                </div>
                <p className="text-white/70 text-xs">+2.400 pessoas em processo de renovação</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-float">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── FRASES ─────────────────────────────────────────── */}
      <section aria-label="Frases do método" className="bg-verde-profundo py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {phrases.map((p, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-0.5 bg-gradient-to-b from-dourado to-dourado/20 rounded-full shrink-0" />
                <p className="font-display text-lg md:text-xl text-bege-claro/90 leading-relaxed">
                  "{p}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 PILARES ─────────────────────────────────────── */}
      <section aria-label="Pilares do método" className="py-24 bg-gradient-soft">
        <div className="container">
          <SectionHeader
            eyebrow="O Método RC"
            title="Renovação em todas as dimensões"
            subtitle="O MRC compreende que a verdadeira transformação ocorre quando o indivíduo desenvolve equilíbrio emocional, consciência sistêmica e conexão com seu propósito."
          />
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {pillars.map((p) => (
              <div
                key={p.title}
                className={`relative p-8 rounded-2xl border bg-gradient-to-br ${p.color} transition-smooth hover:-translate-y-1 group`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-5 shadow-gold group-hover:scale-110 transition-smooth">
                  <p.icon className="w-6 h-6 text-verde-profundo" />
                </div>
                <h3 className="font-display text-xl text-verde-profundo mb-3">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ETAPAS ────────────────────────────────────────── */}
      <section aria-label="Etapas do processo" className="py-24 bg-white">
        <div className="container">
          <SectionHeader
            eyebrow="Processo Terapêutico"
            title="4 primeiros passos da renovação"
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mt-14">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative bg-gradient-card rounded-2xl p-7 border border-bege shadow-card hover:shadow-soft hover:-translate-y-1 transition-smooth"
              >
                {/* Linha de conexão */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-2.5 w-5 h-0.5 bg-gradient-to-r from-dourado/50 to-transparent z-10" />
                )}
                <span className="text-dourado/40 font-display text-4xl font-bold block mb-4">{s.n}</span>
                <s.icon className="w-7 h-7 text-verde-medio mb-3" />
                <h3 className="font-display text-lg text-verde-profundo mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="deep" size="lg" className="rounded-full px-8">
              <Link to="/metodo">Ver todas as 7 etapas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ────────────────────────────────────── */}
      <section aria-label="Benefícios" className="py-24 bg-gradient-soft">
        <div className="container">
          <SectionHeader
            eyebrow="Benefícios"
            title="O que a renovação vai construir em você"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {benefits.map((b) => (
              <div
                key={b.label}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-bege bg-white hover:border-dourado/40 hover:shadow-card transition-smooth group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-soft flex items-center justify-center mb-3 group-hover:bg-gradient-gold transition-smooth">
                  <b.icon className="w-5 h-5 text-dourado group-hover:text-verde-profundo transition-smooth" />
                </div>
                <p className="text-sm font-semibold text-verde-profundo">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ───────────────────────────────────── */}
      <section aria-label="Depoimentos" className="py-24 bg-verde-profundo">
        <div className="container">
          <SectionHeader
            eyebrow="Histórias reais"
            title="Vidas que se renovaram"
            light
          />
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-smooth"
              >
                <div className="flex gap-1 text-dourado mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-dourado" />
                  ))}
                </div>
                <p className="text-bege/85 italic leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-verde-profundo text-sm font-bold shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-bege-claro text-sm">{t.name}</p>
                    <p className="text-bege/50 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outlineGold" size="lg" className="rounded-full px-8">
              <Link to="/depoimentos">Ver todos os depoimentos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section aria-label="Chamada final" className="relative py-32 bg-gradient-deep overflow-hidden">
        {/* Decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-dourado blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-verde-medio blur-3xl" />
        </div>

        <div className="container relative z-10 text-center max-w-2xl">
          <div className="eyebrow-pill mb-6 mx-auto w-fit">Lema do Método</div>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4 leading-tight">
            "Não buscamos apenas aliviar dores emocionais."
          </h2>
          <p className="text-bege/75 mb-10 text-lg leading-relaxed">
            Buscamos desenvolver pessoas capazes de se renovar continuamente.
          </p>
          <Button
            asChild
            variant="gold"
            size="lg"
            className="rounded-full px-10 font-semibold shadow-gold text-base"
          >
            <Link to="/entrar">
              Quero me Renovar Agora
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Home;
