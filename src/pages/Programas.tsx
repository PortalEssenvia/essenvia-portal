import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Clock, Unlock, Moon, Heart, Brain, Compass } from "lucide-react";

const programs = [
  { icon: Clock, title: "Rotina & Disciplina", desc: "Construa uma rotina que sustenta a sua nova vida.", phase: "Reprogramar" },
  { icon: Unlock, title: "Libertação de Vícios", desc: "Quebre ciclos de dependência com clareza e suporte.", phase: "Libertar" },
  { icon: Moon, title: "Higiene do Sono", desc: "Durma bem para viver melhor — em corpo e mente.", phase: "Reprogramar" },
  { icon: Heart, title: "Relacionamentos", desc: "Aprenda as linguagens do amor e cure vínculos.", phase: "Despertar" },
  { icon: Brain, title: "Saúde Emocional", desc: "Compreenda suas emoções e regule sua presença.", phase: "Despertar" },
  { icon: Compass, title: "Propósito de Vida", desc: "Descubra o sentido que dá direção a tudo.", phase: "Sustentar" },
];

const Programas = () => (
  <>
    <section className="py-20 md:py-28 bg-gradient-soft">
      <div className="container">
        <SectionHeader eyebrow="Programas" title="Trilhas para a sua transformação" subtitle="Programas guiados que se conectam com cada fase do método Nova Essenvia." />
      </div>
    </section>
    <section className="py-20">
      <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((p) => (
          <Card key={p.title} className="p-8 bg-card border-bege shadow-card hover:shadow-soft hover:-translate-y-1 transition-smooth flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center mb-5">
              <p.icon className="w-7 h-7 text-verde-profundo" />
            </div>
            <span className="text-xs uppercase tracking-widest text-dourado font-semibold mb-2">Fase: {p.phase}</span>
            <h3 className="font-display text-2xl text-verde-profundo mb-3">{p.title}</h3>
            <p className="text-muted-foreground mb-6 flex-1">{p.desc}</p>
            <Button asChild variant="outlineGold" className="self-start"><Link to="/metodo">Saiba mais</Link></Button>
          </Card>
        ))}
      </div>
    </section>
  </>
);

export default Programas;
