/**
 * JurisFinance — Contexto Global de Dados
 * Sincroniza com Supabase (cloud) e mantém cache em localStorage para offline.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AppData,
  ItemAReceber,
  Lancamento,
  Peticao,
  carregarDados,
  salvarDados,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface DataContextValue {
  data: AppData;
  syncing: boolean;
  offline: boolean;
  addLancamento: (l: Omit<Lancamento, "id">) => void;
  updateLancamento: (id: string, l: Partial<Lancamento>) => void;
  deleteLancamento: (id: string) => void;
  addAReceber: (item: Omit<ItemAReceber, "id">) => void;
  updateAReceber: (id: string, item: Partial<ItemAReceber>) => void;
  deleteAReceber: (id: string) => void;
  addPeticao: (p: Omit<Peticao, "id">) => void;
  updatePeticao: (id: string, p: Partial<Peticao>) => void;
  deletePeticao: (id: string) => void;
  setAnoAtivo: (ano: number) => void;
  updateData: (partial: Partial<AppData>) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function gerarId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

const TS_KEY = "jurisfinance_updated_at";

export function DataProvider({ session, children }: { session: Session | null; children: React.ReactNode }) {
  const userId = session?.user.id ?? null;
  const [data, setData] = useState<AppData>(() => carregarDados());
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [offline, setOffline] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    // Sem sessão → modo offline: usa apenas o cache local deste dispositivo.
    if (!userId) {
      setOffline(true);
      setLoaded(true);
      return;
    }

    // Garante que o app NUNCA trave em "Carregando…": se a nuvem não responder
    // em 8s, liberamos o app com os dados do cache local.
    const failSafe = setTimeout(() => {
      setLoaded((already) => {
        if (!already) {
          setOffline(true);
          toast.error("Nuvem demorou a responder. Usando dados locais — sincroniza quando a conexão voltar.");
        }
        return true;
      });
    }, 8000);

    (async () => {
      try {
        const fetchPromise = supabase
          .from("user_data")
          .select("data, updated_at")
          .eq("user_id", userId)
          .maybeSingle();

        // Corrida entre a busca e um timeout de 8s
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 8000)
        );

        const { data: row, error } = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Awaited<typeof fetchPromise>;

        if (error) {
          setOffline(true);
          toast.error("Erro ao carregar dados da nuvem: " + error.message);
          setLoaded(true);
          return;
        }

        if (row?.data) {
          const cloud = row.data as AppData;
          if (cloud.lancamentos) {
            cloud.lancamentos = cloud.lancamentos.map((l) => ({
              ...l,
              tipoRegistro: l.tipoRegistro || "Faturamento",
            }));
          }
          const localTs = localStorage.getItem(TS_KEY);
          const cloudTs = (row as any).updated_at as string | null;
          const localNewer = !!localTs && !!cloudTs && new Date(localTs) > new Date(cloudTs);

          if (localNewer) {
            // Há alterações locais (feitas offline) mais recentes que a nuvem →
            // mantém o local e ENVIA para a nuvem, sem sobrescrever seu trabalho.
            const local = carregarDados();
            setData(local);
            await supabase
              .from("user_data")
              .update({ data: local, updated_at: new Date().toISOString() })
              .eq("user_id", userId);
            toast.success("Alterações feitas offline foram enviadas para a nuvem.");
          } else {
            setData(cloud);
            salvarDados(cloud);
            if (cloudTs) localStorage.setItem(TS_KEY, cloudTs);
          }
        } else {
          const local = carregarDados();
          const { error: insErr } = await supabase
            .from("user_data")
            .insert({ user_id: userId, data: local });
          if (insErr) {
            toast.error("Erro ao inicializar nuvem: " + insErr.message);
          }
        }
        setOffline(false);
      } catch (e: any) {
        // Timeout ou falha de rede: seguimos com o cache local
        setOffline(true);
        toast.error("Não foi possível falar com a nuvem agora. Usando dados locais.");
      } finally {
        clearTimeout(failSafe);
        setLoaded(true);
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    salvarDados(data);
    localStorage.setItem(TS_KEY, new Date().toISOString());

    // Modo offline (sem sessão): grava só localmente.
    if (!userId) {
      setSyncing(false);
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSyncing(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("user_data")
        .update({ data, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) {
        setOffline(true);
      } else {
        setOffline(false);
      }
      setSyncing(false);
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, loaded, userId]);

  const addLancamento = useCallback((l: Omit<Lancamento, "id">) => {
    setData((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, { ...l, id: gerarId() }],
    }));
  }, []);

  const updateLancamento = useCallback((id: string, l: Partial<Lancamento>) => {
    setData((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.map((item) =>
        item.id === id ? { ...item, ...l } : item
      ),
    }));
  }, []);

  const deleteLancamento = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.filter((item) => item.id !== id),
    }));
  }, []);

  const addAReceber = useCallback((item: Omit<ItemAReceber, "id">) => {
    setData((prev) => ({
      ...prev,
      aReceber: [...prev.aReceber, { ...item, id: gerarId() }],
    }));
  }, []);

  const updateAReceber = useCallback((id: string, item: Partial<ItemAReceber>) => {
    setData((prev) => ({
      ...prev,
      aReceber: prev.aReceber.map((i) => (i.id === id ? { ...i, ...item } : i)),
    }));
  }, []);

  const deleteAReceber = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      aReceber: prev.aReceber.filter((i) => i.id !== id),
    }));
  }, []);

  const addPeticao = useCallback((p: Omit<Peticao, "id">) => {
    setData((prev) => ({
      ...prev,
      peticoes: [...(prev.peticoes || []), { ...p, id: gerarId() }],
    }));
  }, []);

  const updatePeticao = useCallback((id: string, p: Partial<Peticao>) => {
    setData((prev) => ({
      ...prev,
      peticoes: (prev.peticoes || []).map((item) =>
        item.id === id ? { ...item, ...p } : item
      ),
    }));
  }, []);

  const deletePeticao = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      peticoes: (prev.peticoes || []).filter((i) => i.id !== id),
    }));
  }, []);

  const setAnoAtivo = useCallback((ano: number) => {
    setData((prev) => ({ ...prev, anoAtivo: ano }));
  }, []);

  const updateData = useCallback((partial: Partial<AppData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando seus dados…
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        data,
        syncing,
        offline,
        addLancamento,
        updateLancamento,
        deleteLancamento,
        addAReceber,
        updateAReceber,
        deleteAReceber,
        addPeticao,
        updatePeticao,
        deletePeticao,
        setAnoAtivo,
        updateData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}
