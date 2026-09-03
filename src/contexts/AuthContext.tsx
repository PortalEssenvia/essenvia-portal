import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** true quando a sessão expirou / refresh do token falhou */
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Guarda se o usuário JÁ esteve autenticado nesta aba — só assim faz
  // sentido avisar "sua sessão expirou" em vez de simplesmente "deslogado".
  const wasAuthenticated = useRef(false);
  // Logout explícito não deve disparar o fluxo de re-autenticação.
  const intentionalSignOut = useRef(false);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        wasAuthenticated.current = true;
        setSessionExpired(false);
        return;
      }

      // Sem sessão: refresh do token falhou ou a sessão expirou.
      const refreshFailure =
        event === "TOKEN_REFRESHED" || event === "SIGNED_OUT" || event === "USER_UPDATED";
      if (refreshFailure && wasAuthenticated.current && !intentionalSignOut.current) {
        wasAuthenticated.current = false;
        setSessionExpired(true);
      }
      intentionalSignOut.current = false;
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) wasAuthenticated.current = true;
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Revalida a sessão ao voltar para a aba: se o refresh falhou em background,
  // detectamos aqui e pedimos nova autenticação em vez de deixar erros na tela.
  useEffect(() => {
    const revalidate = async () => {
      if (document.visibilityState !== "visible") return;
      if (!wasAuthenticated.current) return;
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        wasAuthenticated.current = false;
        setSession(null);
        setUser(null);
        setSessionExpired(true);
      }
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("online", revalidate);
    return () => {
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("online", revalidate);
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/ferramentas`,
        data: displayName ? { display_name: displayName, full_name: displayName } : undefined,
      },
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setSessionExpired(false);
    return { error };
  };

  const signOut = async () => {
    intentionalSignOut.current = true;
    wasAuthenticated.current = false;
    setSessionExpired(false);
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider
      value={{ session, user, loading, sessionExpired, clearSessionExpired, signUp, signIn, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
