import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const courses = [
  { title: "Despertar Consciente", level: "Iniciante", duration: "4 semanas", desc: "Os fundamentos para reconhecer seus padrões." },
  { title: "Quebrando Padrões", level: "Intermediário", duration: "6 semanas", desc: "Métodos práticos para romper ciclos repetitivos." },
  { title: "Rotina de Alto Desempenho", level: "Intermediário", duration: "3 semanas", desc: "Construa uma rotina sustentável e poderosa." },
  { title: "Meditação e Presença", level: "Iniciante", duration: "2 semanas", desc: "Comece sua prática de presença diária." },
  { title: "Liberdade Emocional", level: "Avançado", duration: "8 semanas", desc: "Trate emoções na raiz e cure feridas profundas." },
  { title: "Relacionamentos Saudáveis", level: "Intermediário", duration: "4 semanas", desc: "Construa vínculos verdadeiros e maduros." },
];

const filters = ["Todos", "Iniciante", "Intermediário", "Avançado"];

const Cursos = () => {
  const [filter, setFilter] = useState("Todos");
  const list = filter === "Todos" ? courses : courses.filter((c) => c.level === filter);
  return (
    <>
      <section className="py-20 bg-gradient-soft">
        <div className="container">
          <SectionHeader eyebrow="Cursos" title="Aprofunde sua jornada" />
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium border transition-smooth",
                  filter === f ? "bg-verde-profundo text-bege-claro border-verde-profundo" : "bg-card border-bege text-verde-profundo hover:border-dourado"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((c) => (
              <Card key={c.title} className="overflow-hidden bg-card border-bege shadow-card hover:shadow-soft hover:-translate-y-1 transition-smooth">
                <div className="h-40 bg-gradient-deep relative">
                  <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-dourado text-verde-profundo font-semibold">{c.level}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-verde-profundo mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration}</span>
                    <Button variant="outlineGold" size="sm">Começar</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Cursos;
