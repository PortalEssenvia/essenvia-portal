import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Heart, Users, Brain, Zap, Compass, Moon, Activity, RefreshCw } from "lucide-react";

const programs = [
  {
    icon: Heart,
    title: "Renovação Emocional",
    desc: "Reprocesse cargas emocionais de medos, ansiedade, culpa, vergonha e rejeição com a TRG.",
    pilar: "Pilar 1",
    tag: "TRG – Reprocessamento Generativo",
  },
  {
    icon: Users,
    title: "Renovação Sistêmica",
    desc: "Compreenda padrões familiares e relacionais que influenciam silenciosamente sua vida.",
    pilar: "Pilar 2",
    tag: "Constelação Familiar",
  },
  {
    icon: Brain,
    title: "Renovação Mental",
    desc: "Transforme pensamentos limitantes em pensamentos construtivos e desenvolva clareza e confiança.",
    pilar: "Pilar 3",
    tag: "Reprogramação Cognitiva",
  },
  {
    icon: Zap,
    title: "Renovação Energética",
    desc: "Equilibre corpo, mente e emoções com respiração consciente, meditação e sons terapêuticos.",
    pilar: "Pilar 4",
    tag: "Consciência Corporal",
  },
  {
    icon: Compass,
    title: "Renovação de Propósito",
    desc: "Desenvolva significado, direção e coerência de vida. Responda: quem você deseja se tornar?",
    pilar: "Pilar 5",
    tag: "Propósito e Valores",
  },
  {
    icon: Moon,
    title: "Renovação do Sono",
    desc: "Restaure a capacidade natural de recuperação física e emocional com higiene do sono.",
    pilar: "Pilar 6",
    tag: "Higiene do Sono",
  },
  {
    icon: Activity,
    title: "Renovação do Corpo",
    desc: "Use o movimento físico como ferramenta de fortalecimento emocional, mental e de autoestima.",
    pilar: "Pilar 7",
    tag: "Movimento Terapêutico",
  },
  {
    icon: RefreshCw,
    title: "Protocolo de 12 Sessões",
    desc: "O processo terapêutico completo: da avaliação integral à consolidação da renovação.",
    pilar: "Completo",
    tag: "Processo Integral",
  },
];

const exercises = [
  {
    n: "01",
    title: "Roda da Renovação",
    desc: "Avalie de 0 a 10 as 9 áreas da sua vida: emoções, família, relacionamentos, saúde, finanças, espiritualidade, propósito, sono e condicionamento físico.",
  },
  {
    n: "02",
    title: "Carta de Libertação",
    desc: "Escreva o que deseja deixar para trás, o que aprendeu e o que deseja renovar a partir de agora.",
  },
  {
    n: "03",
    title: "Visão Renovada",
    desc: "Responda: Quem sou hoje? Quem desejo me tornar? O que preciso abandonar? O que preciso desenvolver?",
  },
  {
    n: "04",
    title: "Diário da Gratidão",
    desc: "Registre diariamente 3 motivos de gratidão, 3 conquistas e 3 aprendizados do dia.",
  },
  {
    n: "05",
    title: "Respiração RC",
    desc: "Inspire 4s, segure 4s, expire 6s — durante 5 minutos. Técnica base de regulação emocional do método.",
  },
  {
    n: "06",
    title: "Plano de Higiene do Sono",
    desc: "Checklist diário: horário regular, evitar telas, cafeína, ambiente adequado e jantar leve.",
  },
  {
    n: "07",
    title: "Movimento da Renovação",
    desc: "30 minutos de atividade física, 3 a 5 vezes por semana. Registre tipo, tempo e nível de energia.",
  },
];

const Programas = () => (
  <>
    <section className="py-20 md:py-28 bg-gradient-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Programas"
          title="Trilhas para a sua renovação"
          subtitle="Cada programa corresponde a um dos 7 Pilares do Método Renovação Constante — trabalhando todas as dimensões do ser humano de forma integrada."
        />
      </div>
    </section>

    {/* PROGRAMAS / PILARES */}
    <section className="py-20">
      <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((p) => (
          <Card key={p.title} className="p-8 bg-card border-bege shadow-card hover:shadow-soft hover:-translate-y-1 transition-smooth flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center mb-5">
              <p.icon className="w-7 h-7 text-verde-profundo" />
            </div>
            <span className="text-xs uppercase tracking-widest text-dourado font-semibold mb-1">{p.pilar}</span>
            <span className="text-xs text-muted-foreground mb-3">{p.tag}</span>
            <h3 className="font-display text-2xl text-verde-profundo mb-3">{p.title}</h3>
            <p className="text-muted-foreground mb-6 flex-1">{p.desc}</p>
            <Button asChild variant="outlineGold" className="self-start">
              <Link to="/metodo">Saiba mais</Link>
            </Button>
          </Card>
        ))}
      </div>
    </section>

    {/* EXERCÍCIOS OFICIAIS */}
    <section className="py-20 bg-bege-claro">
      <div className="container max-w-5xl">
        <SectionHeader
          eyebrow="Exercícios Oficiais do Método"
          title="7 práticas que transformam"
          subtitle="Ferramentas estruturadas para uso entre sessões — integrando a renovação no dia a dia."
        />
        <div className="grid md:grid-cols-2 gap-5 mt-14">
          {exercises.map((e) => (
            <div key={e.n} className="bg-card border border-bege rounded-2xl p-6 flex gap-4 hover:shadow-soft transition-smooth">
              <span className="font-display text-3xl text-dourado/50 shrink-0 mt-1">{e.n}</span>
              <div>
                <h4 className="font-display text-xl text-verde-profundo mb-2">{e.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-gradient-deep">
      <div className="container max-w-2xl text-center">
        <p className="text-dourado tracking-[0.3em] uppercase text-xs mb-4">Comece hoje</p>
        <h2 className="font-display text-4xl text-bege-claro mb-6">
          Toda pessoa possui capacidade de renovação.
        </h2>
        <p className="text-bege/80 mb-10 text-lg">
          A renovação acontece quando a pessoa assume conscientemente a responsabilidade pelo seu crescimento.
        </p>
        <Button asChild variant="hero" size="lg">
          <Link to="/entrar">Quero começar minha renovação</Link>
        </Button>
      </div>
    </section>
  </>
);

export default Programas;
