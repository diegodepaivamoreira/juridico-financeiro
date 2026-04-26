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

    (async () => {
      const { data: row, error } = await supabase
        .from("user_data")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();

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
      setLoaded(true);
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
