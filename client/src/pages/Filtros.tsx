/**
 * JurisFinance — Filtros e Metas
 * Filtrar receita por tipo e definir metas mensais
 * Design: Escritório Jurídico Contemporâneo
 */
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import {
  MESES,
  TIPOS,
  formatarMoeda,
  receitaMes,
  receitaPorTipo,
} from "@/lib/store";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

export default function Filtros() {
  const { data, updateData } = useData();
  const { lancamentos, anoAtivo, metas } = data;
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [metaEditando, setMetaEditando] = useState<string | null>(null);
  const [metaValor, setMetaValor] = useState("");

  const porTipo = receitaPorTipo(lancamentos, anoAtivo);

  // Dados mensais por tipo
  const dadosMensais = MESES.map((mes, i) => {
    const mesNum = i + 1;
    const lancMes = lancamentos.filter((l) => l.mes === mesNum && l.ano === anoAtivo);
    const obj: any = { mes };
    TIPOS.forEach((t) => {
      obj[t] = lancMes.filter((l) => l.tipo === t).reduce((s, l) => s + l.valor, 0);
    });
    return obj;
  });

  const cores: Record<string, string> = {
    "Acordo": "#c2714f",
    "Sucumbência": "#d97706",
    "Sentença Principal": "#059669",
    "Multas e Diferenças": "#7c3aed",
    "Execução": "#0284c7",
    "Consulta": "#f59e0b",
    "Procuração": "#ec4899",
    "Outros": "#6b7280",
  };

  function salvarMeta(tipo: string) {
    if (!metaValor || isNaN(Number(metaValor))) {
      toast.error("Valor inválido");
      return;
    }
    const novasMetas = { ...metas, [tipo]: Number(metaValor) };
    updateData({ metas: novasMetas });
    setMetaEditando(null);
    setMetaValor("");
    toast.success(`Meta de ${tipo} atualizada!`);
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Análise</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Filtros e Metas
        </h1>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Resumo por tipo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TIPOS.map((tipo) => {
            const valor = porTipo[tipo];
            const meta = metas?.[tipo] || 0;
            const percentual = meta > 0 ? (valor / meta) * 100 : 0;
            return (
              <div key={tipo} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{tipo}</p>
                <p className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif", color: cores[tipo] }}>
                  {formatarMoeda(valor)}
                </p>
                {meta > 0 && (
                  <>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${Math.min(percentual, 100)}%`, backgroundColor: cores[tipo] }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {percentual.toFixed(0)}% da meta ({formatarMoeda(meta)})
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Gráfico mensal por tipo */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            Evolução Mensal por Tipo
          </h2>
          <p className="text-xs text-slate-400 mb-4">Receita ao longo dos meses, separada por tipo</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosMensais} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              {TIPOS.map((t) => (
                <Bar key={t} dataKey={t} fill={cores[t]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metas por tipo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
              Definir Metas Mensais por Tipo
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {TIPOS.map((tipo) => (
              <div key={tipo} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cores[tipo] }} />
                  <span className="font-semibold text-slate-700">{tipo}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metaEditando === tipo ? (
                    <>
                      <input
                        type="number"
                        value={metaValor}
                        onChange={(e) => setMetaValor(e.target.value)}
                        placeholder="R$ 0,00"
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => salvarMeta(tipo)}
                        className="bg-[#c2714f] hover:bg-[#a85a3f] text-white"
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMetaEditando(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-slate-800">
                        {metas?.[tipo] ? formatarMoeda(metas[tipo]) : "Sem meta"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMetaEditando(tipo);
                          setMetaValor(metas?.[tipo]?.toString() || "");
                        }}
                      >
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
