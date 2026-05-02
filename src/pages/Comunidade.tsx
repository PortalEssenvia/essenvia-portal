import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

const Comunidade = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(842);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    toast({ title: "Bem-vindo à lista!", description: "Avisaremos você quando a comunidade abrir." });
    setCount((c) => c + 1);
    setName(""); setEmail("");
  };

  return (
    <section className="py-24 md:py-32 bg-gradient-soft min-h-[80vh] flex items-center">
      <div className="container max-w-3xl">
        <Card className="p-10 md:p-14 bg-card shadow-soft border-bege text-center">
          <Users className="w-12 h-12 text-dourado mx-auto mb-6" />
          <p className="text-xs tracking-[0.3em] uppercase text-dourado mb-3">Em breve</p>
          <h1 className="font-display text-4xl md:text-5xl text-verde-profundo mb-5">Um espaço seguro para crescer junto</h1>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            A Comunidade Nova Essenvia é um lugar para compartilhar, se apoiar e celebrar cada passo da transformação.
            Entre na lista e seja avisado em primeira mão.
          </p>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="bg-bege-claro border-bege" />
            <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-bege-claro border-bege" />
            <Button type="submit" variant="gold" className="sm:col-span-2">Quero entrar na lista</Button>
          </form>
          <p className="mt-8 text-sm text-muted-foreground">
            <span className="font-semibold text-verde-profundo">{count}</span> pessoas já estão aguardando.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default Comunidade;
