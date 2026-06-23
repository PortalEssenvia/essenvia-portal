import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Users, RefreshCw, Heart, Sparkles } from "lucide-react";

const Comunidade = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(842);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    toast({
      title: "Bem-vindo à lista de renovação!",
      description: "Avisaremos você quando a comunidade abrir.",
    });
    setCount((c) => c + 1);
    setName("");
    setEmail("");
  };

  return (
    <>
      <section className="py-24 md:py-32 bg-gradient-soft min-h-[80vh] flex items-center">
        <div className="container max-w-3xl">
          <Card className="p-10 md:p-14 bg-card shadow-soft border-bege text-center">
            <Users className="w-12 h-12 text-dourado mx-auto mb-6" />
            <p className="text-xs tracking-[0.3em] uppercase text-dourado mb-3">Em breve</p>
            <h1 className="font-display text-4xl md:text-5xl text-verde-profundo mb-5">
              Um espaço seguro para renovar juntos
            </h1>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              A Comunidade Renovação Constante é um lugar para compartilhar, se apoiar e celebrar
              cada etapa do processo de renovação emocional. Entre na lista e seja avisado em primeira mão.
            </p>
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-bege-claro border-bege"
              />
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bege-claro border-bege"
              />
              <Button type="submit" variant="gold" className="sm:col-span-2">
                Quero entrar na lista
              </Button>
            </form>
            <p className="mt-8 text-sm text-muted-foreground">
              <span className="font-semibold text-verde-profundo">{count}</span> pessoas já estão aguardando.
            </p>
          </Card>
        </div>
      </section>

      {/* O QUE ESPERAR */}
      <section className="py-20 bg-bege-claro">
        <div className="container max-w-4xl">
          <p className="text-center text-xs tracking-[0.3em] uppercase text-dourado mb-3">O que vem por aí</p>
          <h2 className="font-display text-3xl text-verde-profundo text-center mb-12">
            Uma comunidade construída na renovação
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Apoio emocional",
                desc: "Um espaço seguro para compartilhar sua jornada de renovação sem julgamentos.",
              },
              {
                icon: RefreshCw,
                title: "Prática coletiva",
                desc: "Exercícios dos 7 Pilares em grupo — da Roda da Renovação ao Diário da Gratidão.",
              },
              {
                icon: Sparkles,
                title: "Celebração de conquistas",
                desc: "Cada etapa do processo merece ser celebrada. Aqui, ninguém renova sozinho.",
              },
            ].map((item) => (
              <Card key={item.title} className="p-6 bg-card border-bege text-center shadow-card">
                <item.icon className="w-10 h-10 text-dourado mx-auto mb-4" />
                <h3 className="font-display text-xl text-verde-profundo mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Comunidade;
