import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const validatePassword = (password: string) => {
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "A senha deve conter pelo menos uma letra maiúscula.";
  if (!/[0-9]/.test(password)) return "A senha deve conter pelo menos um número.";
  return null;
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryValid, setRecoveryValid] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery",
  );
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasRecoveryHash = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    if (hasRecoveryHash) setRecoveryValid(true);

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryValid(true);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({ title: "Senha inválida", description: passwordError, variant: "destructive" });
      return;
    }
    if (password !== confirmation) {
      toast({ title: "Senhas diferentes", description: "Digite a mesma senha nos dois campos.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Não foi possível alterar a senha",
        description: "O link pode ter expirado. Solicite uma nova recuperação de senha.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Senha alterada!", description: "Seu acesso foi recuperado com sucesso." });
    navigate("/ferramentas", { replace: true });
  };

  return (
    <section className="flex min-h-[85vh] items-center bg-gradient-soft px-4 py-16">
      <div className="container max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Nova Essenvia" className="mx-auto h-20 w-auto" />
          </Link>
          <h1 className="mt-4 font-display text-2xl text-verde-profundo">Definir nova senha</h1>
        </div>
        <Card className="border-bege bg-card p-6 shadow-soft sm:p-8">
          {recoveryValid ? (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crie uma nova senha para recuperar o acesso à sua conta.
              </p>
              <div>
                <Label htmlFor="new-password">Nova senha</Label>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="border-bege bg-bege-claro"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use 8 ou mais caracteres, uma letra maiúscula e um número.
                </p>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="border-bege bg-bege-claro"
                />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <h2 className="font-display text-xl text-verde-profundo">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground">
                Solicite um novo link para redefinir sua senha com segurança.
              </p>
              <Button asChild variant="gold" className="w-full">
                <Link to="/entrar" state={{ recover: true }}>Solicitar novo link</Link>
              </Button>
              <Button asChild variant="link" className="w-full">
                <Link to="/entrar">Voltar para o login</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default ResetPassword;
