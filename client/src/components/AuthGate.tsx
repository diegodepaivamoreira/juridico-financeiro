import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthGateProps {
  children: (session: Session) => React.ReactNode;
}

type Mode = "signin" | "signup" | "reset" | "newpassword";

export default function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryActive, setRecoveryActive] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryActive(true);
        setMode("newpassword");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail e clique no link de confirmação.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "reset") {
        const redirectTo = window.location.origin + import.meta.env.BASE_URL;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("signin");
      } else if (mode === "newpassword") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha alterada com sucesso!");
        setRecoveryActive(false);
        setPassword("");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao autenticar");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  // Already signed in AND not in middle of password recovery → render app
  if (session && !recoveryActive) {
    return <>{children(session)}</>;
  }

  const titleMap: Record<Mode, string> = {
    signin: "Entre na sua conta",
    signup: "Crie sua conta",
    reset: "Recuperar senha",
    newpassword: "Definir nova senha",
  };

  const buttonMap: Record<Mode, string> = {
    signin: "Entrar",
    signup: "Criar conta",
    reset: "Enviar link",
    newpassword: "Salvar nova senha",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">JurisFinance</h1>
          <p className="text-sm text-muted-foreground mt-1">{titleMap[mode]}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== "newpassword" && (
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {mode === "newpassword" ? "Nova senha" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Aguarde…" : buttonMap[mode]}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={() => { setMode("reset"); setPassword(""); }}
                className="block w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueci a senha
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="block w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Não tenho conta — criar agora
              </button>
            </>
          )}
          {mode === "signup" && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="block w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              Já tenho conta — entrar
            </button>
          )}
          {mode === "reset" && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="block w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
