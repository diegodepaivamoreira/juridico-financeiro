/**
 * JurisFinance — Visão Anual
 * Tabela consolidada com todos os meses, totais por banco, por tipo
 * Design: Escritório Jurídico Contemporâneo
 */
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  MESES,
  TIPOS,
  formatarMoeda,
  receitaAnual,
  receitaMes,
  receitaPorBanco,
  receitaPorTipo,
} from "@/lib/store";
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

const CORES_BANCO: Record<string, string> = {
  Santander: "#c2714f",
  Itaú: "#d97706",
  Nubank: "#7c3aed",
  "Mercado Pago": "#059669",
  Wise: "#0284c7",
};

export default function Anual() {
  const { data } = useData();
  const { lancamentos, anoAtivo } = data;

  const porTipo = receitaPorTipo(lancamentos, anoAtivo);
  const total = receitaAnual(lancamentos, anoAtivo);

  const dadosMensais = MESES.map((mes, i) => {
    const mesNum = i + 1;
    const mesTotal = receitaMes(lancamentos, mesNum, anoAtivo);
    const lancMes = lancamentos.filter((l) => l.mes === mesNum && l.ano === anoAtivo);
    const porBancoMes = receitaPorBanco(lancamentos, anoAtivo, mesNum);
    const porTipoMes: Record<string, number> = {};
    TIPOS.forEach((t) => {
      porTipoMes[t] = lancMes.filter((l) => l.tipo === t).reduce((s, l) => s + l.valor, 0);
    });
    return { mes, mesNum, total: mesTotal, lancamentos: lancMes.length, porBancoMes, porTipoMes };
  });

  const dadosGrafico = dadosMensais.map((d) => ({
    mes: d.mes,
    ...Object.fromEntries(BANCOS.map((b) => [b, d.porBancoMes[b]])),
  }));

  // Recalcular porBanco para o ano inteiro (para resumo)
  const porBancoAnual = receitaPorBanco(lancamentos, 0, anoAtivo);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Consolidado</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Visão Anual {anoAtivo}
        </h1>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Resumo anual */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 col-span-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Receita Total {anoAtivo}</p>
            <p className="text-3xl font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(total)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lancamentos.filter((l) => l.ano === anoAtivo).length} lançamentos no ano
            </p>
          </div>
          {BANCOS.slice(0, 2).map((b) => (
            <div key={b} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{b}</p>
              <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
                {formatarMoeda(porBancoAnual[b])}
              </p>
            </div>
          ))}
        </div>

        {/* Gráfico empilhado por banco */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            Receita por Banco — Mensal
          </h2>
          <p className="text-xs text-slate-400 mb-4">Distribuição das entradas por instituição ao longo do ano</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosGrafico} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number, name: string) => [formatarMoeda(v), name]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              {BANCOS.map((b) => (
                <Bar key={b} dataKey={b} stackId="a" fill={CORES_BANCO[b]} radius={b === BANCOS[BANCOS.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela mensal detalhada */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
              Planilha Anual — Detalhamento Mensal
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider">Mês</th>
                  <th className="text-right px-3 py-3 font-semibold text-slate-500 uppercase tracking-wider">Lanç.</th>
                  {BANCOS.map((b) => (
                    <th key={b} className="text-right px-3 py-3 font-semibold uppercase tracking-wider" style={{ color: CORES_BANCO[b] }}>
                      {b.split(" ")[0]}
                    </th>
                  ))}
                  {TIPOS.map((t) => (
                    <th key={t} className="text-right px-3 py-3 font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                      {t.slice(0, 5)}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {dadosMensais.map((d, i) => (
                  <tr
                    key={d.mes}
                    className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    } ${d.total === 0 ? "opacity-40" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{d.mes}</td>
                    <td className="px-3 py-2.5 text-right text-slate-400">{d.lancamentos}</td>
                    {BANCOS.map((b) => (
                      <td key={b} className="px-3 py-2.5 text-right text-slate-600">
                        {d.porBancoMes[b] > 0 ? formatarMoeda(d.porBancoMes[b]) : "—"}
                      </td>
                    ))}
                    {TIPOS.map((t) => (
                      <td key={t} className="px-3 py-2.5 text-right text-slate-500 hidden xl:table-cell">
                        {d.porTipoMes[t] > 0 ? formatarMoeda(d.porTipoMes[t]) : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-bold text-slate-800">
                      {d.total > 0 ? formatarMoeda(d.total) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-200">
                  <td className="px-4 py-3 font-bold text-slate-700 uppercase text-xs tracking-wider">Total</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-600">
                    {lancamentos.filter((l) => l.ano === anoAtivo).length}
                  </td>
                  {BANCOS.map((b) => (
                    <td key={b} className="px-3 py-3 text-right font-bold" style={{ color: CORES_BANCO[b] }}>
                      {porBancoAnual[b] > 0 ? formatarMoeda(porBancoAnual[b]) : "—"}
                    </td>
                  ))}
                  {TIPOS.map((t) => (
                    <td key={t} className="px-3 py-3 text-right font-bold text-slate-600 hidden xl:table-cell">
                      {porTipo[t] > 0 ? formatarMoeda(porTipo[t]) : "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-bold text-[#c2714f] text-sm">
                    {formatarMoeda(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Por tipo */}
        <div className="grid grid-cols-5 gap-3">
          {TIPOS.map((t, i) => {
            const cores = ["#c2714f", "#475569", "#d97706", "#059669", "#7c3aed"];
            return (
              <div key={t} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{t}</p>
                <p className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif", color: cores[i] }}>
                  {formatarMoeda(porTipo[t])}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
