import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Entrar = () => {
  const [tab, setTab] = useState("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(
    () => Boolean((window.history.state?.usr as { recover?: boolean } | undefined)?.recover),
  );
  const [recoverySent, setRecoverySent] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from || "/ferramentas";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[0-9]/.test(pwd)) return "A senha deve conter pelo menos um número.";
    return null;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (tab === "cadastrar") {
      const passwordError = validatePassword(password);
      if (passwordError) {
        toast({ title: "Senha fraca", description: passwordError, variant: "destructive" });
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

  const sendRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Não foi possível enviar o e-mail",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return;
    }

    setRecoverySent(true);
  };

  const backToLogin = () => {
    setRecovering(false);
    setRecoverySent(false);
    setPassword("");
    setTab("entrar");
  };

  return (
    <section className="flex min-h-[85vh] items-center bg-gradient-soft px-4 py-16">
      <div className="container max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Nova Essenvia" className="mx-auto h-20 w-auto" />
          </Link>
          <h1 className="mt-4 font-display text-2xl text-verde-profundo">
            {recovering ? "Recuperar acesso" : "Sua jornada começa aqui"}
          </h1>
        </div>
        <Card className="border-bege bg-card p-6 shadow-soft sm:p-8">
          {recovering ? (
            recoverySent ? (
              <div className="space-y-5 text-center" role="status">
                <h2 className="font-display text-xl text-verde-profundo">Verifique seu e-mail</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Se houver uma conta para <strong>{email}</strong>, enviaremos um link para criar uma nova senha. Verifique também a caixa de spam.
                </p>
                <Button type="button" variant="gold" className="w-full" onClick={backToLogin}>
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={sendRecovery} className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
                </p>
                <div>
                  <Label htmlFor="recovery-email">E-mail</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="border-bege bg-bege-claro"
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
                <Button type="button" variant="link" className="w-full" onClick={backToLogin}>
                  Voltar para o login
                </Button>
              </form>
            )
          ) : (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-bege">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="cadastrar">Criar conta</TabsTrigger>
              </TabsList>
              <form onSubmit={submit} className="space-y-4">
                {tab === "cadastrar" && (
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      className="border-bege bg-bege-claro"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="border-bege bg-bege-claro"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="pass">Senha</Label>
                    {tab === "entrar" && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecovering(true);
                          setRecoverySent(false);
                        }}
                        className="min-h-11 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <PasswordInput
                    id="pass"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={tab === "cadastrar" ? 8 : 6}
                    autoComplete={tab === "entrar" ? "current-password" : "new-password"}
                    className="border-bege bg-bege-claro"
                  />
                  {tab === "cadastrar" && password.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use 8 ou mais caracteres, uma letra maiúscula e um número.
                    </p>
                  )}
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                  {submitting ? "Aguarde..." : tab === "entrar" ? "Entrar" : "Criar conta"}
                </Button>
              </form>
            </Tabs>
          )}
        </Card>
      </div>
    </section>
  );
};

export default Entrar;
