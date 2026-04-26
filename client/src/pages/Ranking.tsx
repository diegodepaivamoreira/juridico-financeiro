/**
 * JurisFinance — Ranking
 * Ranking completo de réus e clientes por faturamento
 * Design: Escritório Jurídico Contemporâneo
 */
import { useData } from "@/contexts/DataContext";
import {
  formatarMoeda,
  rankingClientes,
  rankingReus,
  receitaAnual,
} from "@/lib/store";
import { Medal, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MEDAL_CORES = ["#c9a84c", "#94a3b8", "#cd7f32"];
const BARRA_CORES_REUS = ["#c2714f", "#d97706", "#e8956d", "#f0b07a", "#f5c89a", "#f8d9b8", "#fae8d4", "#fdf0e8"];
const BARRA_CORES_CLI = ["#059669", "#0284c7", "#34d399", "#38bdf8", "#6ee7b7", "#7dd3fc", "#a7f3d0", "#bae6fd"];

export default function Ranking() {
  const { data } = useData();
  const { lancamentos, anoAtivo } = data;

  const reus = rankingReus(lancamentos, anoAtivo);
  const clientes = rankingClientes(lancamentos, anoAtivo);
  const total = receitaAnual(lancamentos, anoAtivo);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Análise</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Ranking {anoAtivo}
        </h1>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Ranking de Réus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Medal size={16} className="text-[#c2714f]" />
              <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
                Ranking de Réus
              </h2>
            </div>
            {reus.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-300 text-sm">Sem dados</div>
            ) : (
              <>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reus.slice(0, 8)} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="reu"
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        formatter={(v: number) => [formatarMoeda(v), "Receita"]}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      />
                      <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                        {reus.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={BARRA_CORES_REUS[i % BARRA_CORES_REUS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-xs border-t border-slate-100">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">Réu</th>
                      <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">Total</th>
                      <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reus.map((r, i) => (
                      <tr key={r.reu} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-2">
                          {i < 3 ? (
                            <span
                              className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ background: MEDAL_CORES[i] }}
                            >
                              {i + 1}
                            </span>
                          ) : (
                            <span className="text-slate-400">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-700">{r.reu}</td>
                        <td className="px-4 py-2 text-right font-bold text-slate-800">{formatarMoeda(r.total)}</td>
                        <td className="px-4 py-2 text-right text-slate-500">
                          {total > 0 ? ((r.total / total) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Ranking de Clientes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Users size={16} className="text-[#059669]" />
              <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
                Ranking de Clientes
              </h2>
            </div>
            {clientes.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-300 text-sm">Sem dados</div>
            ) : (
              <>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={clientes.slice(0, 8)} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="cliente"
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        formatter={(v: number) => [formatarMoeda(v), "Receita"]}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      />
                      <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                        {clientes.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={BARRA_CORES_CLI[i % BARRA_CORES_CLI.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-xs border-t border-slate-100">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">Cliente</th>
                      <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">Total</th>
                      <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c, i) => (
                      <tr key={c.cliente} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-2">
                          {i < 3 ? (
                            <span
                              className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ background: MEDAL_CORES[i] }}
                            >
                              {i + 1}
                            </span>
                          ) : (
                            <span className="text-slate-400">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-700">{c.cliente}</td>
                        <td className="px-4 py-2 text-right font-bold text-slate-800">{formatarMoeda(c.total)}</td>
                        <td className="px-4 py-2 text-right text-slate-500">
                          {total > 0 ? ((c.total / total) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Projeção */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#059669]" />
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
              Concentração de Receita
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-2">Top 3 Réus representam:</p>
              <p className="text-2xl font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
                {total > 0
                  ? `${((reus.slice(0, 3).reduce((s, r) => s + r.total, 0) / total) * 100).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">da receita total</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Top 3 Clientes representam:</p>
              <p className="text-2xl font-bold text-[#059669]" style={{ fontFamily: "'Fraunces', serif" }}>
                {total > 0
                  ? `${((clientes.slice(0, 3).reduce((s, c) => s + c.total, 0) / total) * 100).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">da receita total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
