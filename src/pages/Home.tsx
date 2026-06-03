import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ChevronDown, Sparkles, Unlock, Sprout, Sunrise, RefreshCw, Building2, Brain, Zap, Heart, TrendingUp, Target, Award, Star, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-path.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

const phrases = [
  "Você não precisa de mais motivação. Precisa de um caminho.",
  "A mudança começa quando você entende, não quando tenta.",
  "Disciplina sem consciência não se sustenta.",
  "Voltar para si é o início de tudo.",
];

const pillars = [
  { icon: Sprout, title: "Consciência", text: "Reconectar-se com quem você realmente é, vendo seus padrões com clareza." },
  { icon: Unlock, title: "Libertação", text: "Romper ciclos de vícios, padrões e crenças que prendem sua vida." },
  { icon: Sparkles, title: "Transformação", text: "Construir uma nova rotina, identidade e propósito para viver com leveza." },
];

const phases = [
  { icon: Sunrise, title: "Despertar", text: "Ver com clareza é o início da cura.", n: "01" },
  { icon: Unlock, title: "Libertar", text: "Quebrar o que te prende para mudar de verdade.", n: "02" },
  { icon: RefreshCw, title: "Reprogramar", text: "Criar novos padrões e uma nova identidade.", n: "03" },
  { icon: Building2, title: "Sustentar", text: "Consolidar a transformação para a vida inteira.", n: "04" },
];

const benefits = [
  { icon: Target, label: "Foco" },
  { icon: Zap, label: "Motivação" },
  { icon: Award, label: "Autoconfiança" },
  { icon: TrendingUp, label: "Desenvolvimento Pessoal" },
  { icon: Brain, label: "Concentração" },
  { icon: ShieldCheck, label: "Disciplina" },
  { icon: Sparkles, label: "Fé / Lei da Atração" },
  { icon: Heart, label: "Reduz Stress e Ansiedade" },
];

const testimonials = [
  { name: "Mariana S.", city: "São Paulo, SP", text: "Eu tentei tudo. A Nova Essenvia foi a primeira vez que entendi por quê. Hoje minha rotina é leve e real." },
  { name: "Rafael C.", city: "Belo Horizonte, MG", text: "Em 60 dias consegui largar um vício de 12 anos. O método me deu um caminho, não só motivação." },
  { name: "Ana Paula", city: "Curitiba, PR", text: "Voltei a meditar, dormir bem, me sentir presente. A Nova Essenvia me devolveu para mim mesma." },
];

const Home = () => {
  const { get } = useSiteContent("home");
  const heroTitle = get("hero_title", "Reconecte-se. Reprograme-se. Renove-se.");
  const heroSubtitle = get("hero_subtitle", "Um caminho completo para transformar sua vida por dentro e por fora.");
  const ctaText = get("cta_text", "Você não precisa estar pronto. Precisa apenas começar.");
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Caminho ao amanhecer" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-verde-profundo/90 via-verde-profundo/70 to-transparent" />
        </div>
        <div className="container relative z-10 py-24 max-w-3xl">
          <p className="text-dourado tracking-[0.3em] text-xs uppercase mb-6 animate-fade-in">Consciência • Cura • Transformação • Propósito</p>
          <h1 className="font-display text-5xl md:text-7xl text-bege-claro leading-tight mb-6 animate-slide-up whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-bege/90 max-w-xl mb-10 leading-relaxed animate-slide-up whitespace-pre-line">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up">
            <Button asChild variant="hero" size="lg"><Link to="/entrar">Comece sua Jornada</Link></Button>
            <Button asChild variant="outlineGold" size="lg"><Link to="/metodo">Conheça o Método</Link></Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-bege/70 animate-float">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* PHRASES */}
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
          <SectionHeader eyebrow="O que é a Nova Essenvia" title="Um sistema de transformação guiada" subtitle="Não somos mais um blog de autoajuda. Unimos espiritualidade, ciência e práticas terapêuticas para tratar a raiz dos conflitos." />
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

      {/* MÉTODO PREVIEW */}
      <section className="py-24 bg-bege-claro">
        <div className="container">
          <SectionHeader eyebrow="O Método Nova Essenvia" title="Quatro fases para uma vida nova" />
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
            <Button asChild variant="deep" size="lg"><Link to="/metodo">Explorar o Método</Link></Button>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-24">
        <div className="container">
          <SectionHeader eyebrow="Benefícios" title="O que sua jornada vai construir" />
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
          <SectionHeader eyebrow="Depoimentos" title="Vidas em transformação" />
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
          <h2 className="font-display text-4xl md:text-5xl text-bege-claro mb-6">Sua jornada começa com um passo.</h2>
          <p className="text-bege/80 mb-10 text-lg whitespace-pre-line">{ctaText}</p>
          <Button asChild variant="hero" size="lg"><Link to="/entrar">Quero Começar Agora</Link></Button>
        </div>
      </section>
    </>
  );
};

export default Home;
