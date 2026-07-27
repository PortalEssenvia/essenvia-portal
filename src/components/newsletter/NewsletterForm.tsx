import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/track";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);

interface Props {
  source: string;
  onSuccess?: () => void;
  className?: string;
  buttonLabel?: string;
}

export const NewsletterForm = ({ source, onSuccess, className, buttonLabel = "Inscrever" }: Props) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    void track("newsletter_submit_attempt", { source, email: parsed.data });
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source });
    setLoading(false);
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      void track("newsletter_submit_error", { source, message: error.message });
      toast.error("Não foi possível cadastrar agora. Tente novamente.");
      return;
    }
    void track("newsletter_submit_success", { source, duplicate: !!error });
    toast.success("Inscrição confirmada! Obrigado.");
    setEmail("");
    onSuccess?.();
  };

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          required
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          aria-label="E-mail para newsletter"
          className="bg-white"
        />
        <Button type="submit" variant="gold" disabled={loading}>
          {loading ? "Enviando..." : buttonLabel}
        </Button>
      </div>
    </form>
  );
};