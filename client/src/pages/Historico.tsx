/**
 * JurisFinance — Histórico de Alterações
 * Log de todas as mudanças nos lançamentos
 * Design: Escritório Jurídico Contemporâneo
 */
import { useData } from "@/contexts/DataContext";
import { MESES, formatarMoeda } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface LogEntry {
  timestamp: number;
  acao: "criado" | "editado" | "deletado";
  tipo: "lancamento" | "areceber";
  descricao: string;
  valor?: number;
  cliente?: string;
  reu?: string;
}

export default function Historico() {
  const { data } = useData();
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const stored = localStorage.getItem("jurisfinance_logs");
    return stored ? JSON.parse(stored) : [];
  });

  const registrarLog = (entrada: LogEntry) => {
    const novoLog = [...logs, entrada];
    setLogs(novoLog);
    localStorage.setItem("jurisfinance_logs", JSON.stringify(novoLog));
  };

  // Expor função globalmente para ser chamada de outros componentes
  (window as any).registrarLogJF = registrarLog;

  const logsOrdenados = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const getCor = (acao: string) => {
    switch (acao) {
      case "criado":
        return "text-emerald-600 bg-emerald-50";
      case "editado":
        return "text-blue-600 bg-blue-50";
      case "deletado":
        return "text-red-600 bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getIcone = (acao: string) => {
    switch (acao) {
      case "criado":
        return "✓";
      case "editado":
        return "✎";
      case "deletado":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Auditoria</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Histórico de Alterações
        </h1>
      </div>

      <div className="px-8 py-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Criados</p>
            <p className="text-2xl font-bold text-emerald-600">
              {logs.filter((l) => l.acao === "criado").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Editados</p>
            <p className="text-2xl font-bold text-blue-600">
              {logs.filter((l) => l.acao === "editado").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deletados</p>
            <p className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.acao === "deletado").length}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
              Últimas Alterações
            </h2>
          </div>

          {logsOrdenados.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-slate-400 text-sm">Nenhuma alteração registrada ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logsOrdenados.map((log, i) => (
                <div key={i} className="px-5 py-4 hover:bg-slate-50/50 transition-colors flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${getCor(log.acao)}`}>
                    {getIcone(log.acao)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {log.descricao}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(log.timestamp), "dd 'de' MMMM 'às' HH:mm:ss", { locale: ptBR })}
                        </p>
                      </div>
                      {log.valor && (
                        <p className="text-sm font-bold text-slate-700 shrink-0">
                          {formatarMoeda(log.valor)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">ℹ️ Sobre este histórico</p>
          <p>
            Este registro rastreia todas as criações, edições e exclusões de lançamentos e itens "A Receber". 
            Os dados são armazenados localmente no seu navegador para fins de auditoria.
          </p>
        </div>
      </div>
    </div>
  );
}
