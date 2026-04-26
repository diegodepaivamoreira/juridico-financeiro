/**
 * JurisFinance — Contexto Global de Dados
 * Gerencia estado da aplicação com persistência em localStorage
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AppData,
  ItemAReceber,
  Lancamento,
  carregarDados,
  salvarDados,
} from "@/lib/store";

interface DataContextValue {
  data: AppData;
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => carregarDados());

  useEffect(() => {
    salvarDados(data);
  }, [data]);

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

  return (
    <DataContext.Provider
      value={{
        data,
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
