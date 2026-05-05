import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Entrar = () => {
  const [tab, setTab] = useState("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/ferramentas";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8)
      return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pwd))
      return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[0-9]/.test(pwd))
      return "A senha deve conter pelo menos um número.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "cadastrar") {
      const senhaErro = validatePassword(password);
      if (senhaErro) {
        toast({ title: "Senha fraca", description: senhaErro, variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    if (tab === "entrar") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Não foi possível entrar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Bem-vindo de volta!", description: "Sua jornada continua." });
      }
    } else {
      const { error } = await signUp(email, password, name || undefined);
      if (error) {
        toast({ title: "Não foi possível criar a conta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Bem-vindo à Nova Essenvia." });
      }
    }
    setSubmitting(false);
  };
  return (
    <section className="min-h-[85vh] flex items-center bg-gradient-soft py-16">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Nova Essenvia" className="h-20 w-auto mx-auto" />
          </Link>
          <h1 className="font-display text-2xl text-verde-profundo mt-4">Sua jornada começa aqui</h1>
        </div>
        <Card className="p-8 bg-card shadow-soft border-bege">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full bg-bege mb-6">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="cadastrar">Criar conta</TabsTrigger>
            </TabsList>
            <form onSubmit={submit} className="space-y-4">
              {tab === "cadastrar" && (
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-bege-claro border-bege" />
                </div>
              )}
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-bege-claro border-bege" />
              </div>
              <div>
                <Label htmlFor="pass">Senha</Label>
                <Input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-bege-claro border-bege" />
                {tab === "cadastrar" && password.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Use 8+ caracteres, uma letra maiúscula e um número. Ex: <span className="font-mono">Essenvia@2025</span>
                  </p>
                )}
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                {submitting ? "Aguarde..." : tab === "entrar" ? "Entrar" : "Criar conta"}
              </Button>
            </form>
          </Tabs>
        </Card>
      </div>
    </section>
  );
};

export default Entrar;
