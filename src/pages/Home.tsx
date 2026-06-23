import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import {
  ChevronDown, Heart, Brain, Zap, Moon, Compass, Activity,
  Sparkles, Star, Target, Award, TrendingUp, ShieldCheck, RefreshCw, Sunrise,
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
    text: "Identificar e reduzir cargas emocionais associadas a medos, ansiedade, culpa e rejeição através da TRG.",
  },
  {
    icon: RefreshCw,
    title: "Renovação Sistêmica",
    text: "Compreender padrões familiares e relacionais que influenciam sua vida atual através da Constelação Familiar.",
  },
  {
    icon: Sparkles,
    title: "Renovação de Propósito",
    text: "Desenvolver significado, direção e coerência de vida — fortalecendo valores, gratidão e sentido existencial.",
  },
];

const phases = [
  { icon: Sunrise, title: "Acolher", text: "Receber com presença e abertura.", n: "01" },
  { icon: Brain, title: "Identificar", text: "Reconhecer padrões, bloqueios e origens.", n: "02" },
  { icon: RefreshCw, title: "Reprocessar", text: "Transformar cargas emocionais com a TRG.", n: "03" },
  { icon: Sparkles, title: "Renovar", text: "Consolidar a nova versão de você.", n: "04" },
];

const benefits = [
  { icon: Target, label: "Equilíbrio Emocional" },
  { icon: Brain, label: "Clareza Mental" },
  { icon: Heart, label: "Saúde Emocional" },
  { icon: TrendingUp, label: "Desenvolvimento Pessoal" },
  { icon: Zap, label: "Energia e Motivação" },
  { icon: ShieldCheck, label: "Disciplina Sustentável" },
  { icon: Moon, label: "Qualidade do Sono" },
  { icon: Compass, label: "Propósito de Vida" },
];

const testimonials = [
  {
    name: "Mariana S.",
    city: "São Paulo, SP",
    text: "Pela primeira vez entendi por que repetia os mesmos padrões. O Método Renovação Constante me deu um caminho real de transformação.",
  },
  {
    name: "Rafael C.",
    city: "Belo Horizonte, MG",
    text: "Em 60 dias consegui reprocessar traumas de anos. O método não alivia a dor — ele transforma a origem.",
  },
  {
    name: "Ana Paula",
    city: "Curitiba, PR",
    text: "Voltei a dormir bem, a me sentir presente, a ter propósito. O MRC me devolveu a mim mesma.",
  },
];

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Caminho de renovação" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-verde-profundo/90 via-verde-profundo/70 to-transparent" />
        </div>
        <div className="container relative z-10 py-24 max-w-3xl">
          <p className="text-dourado tracking-[0.3em] text-xs uppercase mb-6 animate-fade-in">
            Emoções • Família • Mente • Corpo • Propósito
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-bege-claro leading-tight mb-6 animate-slide-up">
            Renove suas emoções.<br />Renove sua história.<br />
            <span className="text-dourado">Renove sua vida.</span>
          </h1>
          <p className="text-lg md:text-xl text-bege/90 max-w-xl mb-10 leading-relaxed animate-slide-up">
            O Método Renovação Constante integra emoções, sistema familiar, mente, corpo,
            energia, propósito e hábitos para promover a renovação contínua do ser humano.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up">
            <Button asChild variant="hero" size="lg"><Link to="/entrar">Comece sua Renovação</Link></Button>
            <Button asChild variant="outlineGold" size="lg"><Link to="/metodo">Conheça o Método</Link></Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-bege/70 animate-float">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* SLOGAN / FRASES */}
      <section className="bg-verde-profundo py-24">
        <div className="container grid md:grid-cols-2 gap-10 max-w-5xl">
          {phrases.map((p, i) => (
            <div key={i} className="border-l-2 border-dourado pl-6">
              <p className="font-display text-xl md:text-2xl text-bege-claro leading-relaxed italic">"{p}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* PILARES */}
      <section className="py-24 bg-gradient-soft">
        <div className="container">
          <SectionHeader
            eyebrow="O que é o Método RC"
            title="Renovação em todas as dimensões"
            subtitle="O MRC compreende que a verdadeira transformação ocorre quando o indivíduo desenvolve equilíbrio emocional, consciência sistêmica, saúde física, clareza mental e conexão com seu propósito."
          />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {pillars.map((p) => (
              <Card key={p.title} className="p-8 text-center bg-card shadow-card hover:shadow-soft transition-smooth border-bege">
                <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-6">
                  <p.icon className="w-8 h-8 text-verde-profundo" />
                </div>
                <h3 className="font-display text-2xl text-verde-profundo mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ETAPAS DO PROCESSO */}
      <section className="py-24 bg-bege-claro">
        <div className="container">
          <SectionHeader eyebrow="Processo Terapêutico" title="7 etapas para a renovação completa" />
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {phases.map((ph) => (
              <div key={ph.title} className="relative bg-card rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-smooth">
                <div className="text-dourado/40 font-display text-5xl mb-2">{ph.n}</div>
                <ph.icon className="w-8 h-8 text-verde-medio mb-3" />
                <h3 className="font-display text-xl text-verde-profundo mb-2">{ph.title}</h3>
                <p className="text-sm text-muted-foreground">{ph.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="deep" size="lg"><Link to="/metodo">Ver todas as 7 etapas</Link></Button>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24">
        <div className="container">
          <SectionHeader eyebrow="Benefícios" title="O que a renovação vai construir em você" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {benefits.map((b) => (
              <div key={b.label} className="text-center p-6 rounded-xl border border-bege bg-card hover:bg-bege-claro transition-smooth">
                <b.icon className="w-8 h-8 text-dourado mx-auto mb-3" />
                <p className="text-sm font-medium text-verde-profundo">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-gradient-soft">
        <div className="container">
          <SectionHeader eyebrow="Depoimentos" title="Histórias de renovação real" />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-8 bg-card shadow-card border-bege">
                <div className="flex gap-1 text-dourado mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-dourado" />)}
                </div>
                <p className="text-muted-foreground italic leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-verde-profundo">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-deep">
        <div className="container text-center max-w-2xl">
          <p className="text-dourado tracking-[0.3em] uppercase text-xs mb-4">Lema do Método</p>
          <h2 className="font-display text-4xl md:text-5xl text-bege-claro mb-6">
            "Não buscamos apenas aliviar dores emocionais."
          </h2>
          <p className="text-bege/80 mb-10 text-lg">
            Buscamos desenvolver pessoas capazes de se renovar continuamente.
          </p>
          <Button asChild variant="hero" size="lg"><Link to="/entrar">Quero me Renovar Agora</Link></Button>
        </div>
      </section>
    </>
  );
};

export default Home;
