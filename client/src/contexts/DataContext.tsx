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

export function DataProvider({ session, children }: { session: Session; children: React.ReactNode }) {
  const userId = session.user.id;
  const [data, setData] = useState<AppData>(() => carregarDados());
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    // Garante que o app NUNCA trave em "Carregando…": se a nuvem não responder
    // em 8s, liberamos o app com os dados do cache local.
    const failSafe = setTimeout(() => {
      setLoaded((already) => {
        if (!already) {
          toast.error("Nuvem demorou a responder. Usando dados locais — as alterações sincronizam quando a conexão voltar.");
        }
        return true;
      });
    }, 8000);

    (async () => {
      try {
        const fetchPromise = supabase
          .from("user_data")
          .select("data")
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
          setData(cloud);
          salvarDados(cloud);
        } else {
          const local = carregarDados();
          const { error: insErr } = await supabase
            .from("user_data")
            .insert({ user_id: userId, data: local });
          if (insErr) {
            toast.error("Erro ao inicializar nuvem: " + insErr.message);
          }
        }
      } catch (e: any) {
        // Timeout ou falha de rede: seguimos com o cache local
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

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSyncing(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("user_data")
        .update({ data, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) {
        toast.error("Erro ao sincronizar: " + error.message);
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
