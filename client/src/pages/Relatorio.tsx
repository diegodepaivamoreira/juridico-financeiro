/**
 * JurisFinance — Relatório Anual
 * Projeção, métricas avançadas, análise de desempenho
 * Design: Escritório Jurídico Contemporâneo
 */
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  MESES,
  TIPOS,
  formatarMoeda,
  projecaoMensal,
  rankingClientes,
  rankingReus,
  receitaMes,
  receitaPorBanco,
  statusBanco,
} from "@/lib/store";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Relatorio() {
  const { data } = useData();
  const { lancamentos, anoAtivo } = data;

  const total = lancamentos.filter((l) => l.ano === anoAtivo).reduce((s, l) => s + l.valor, 0);
  const projecao = projecaoMensal(lancamentos, anoAtivo);
  const porBanco = receitaPorBanco(lancamentos, 0, anoAtivo);
  const porTipo: Record<string, number> = {};
  lancamentos
    .filter((l) => l.ano === anoAtivo)
    .forEach((l) => {
      porTipo[l.tipo] = (porTipo[l.tipo] || 0) + l.valor;
    });
  const topReus = rankingReus(lancamentos, anoAtivo);
  const topClientes = rankingClientes(lancamentos, anoAtivo);

  const mesesComDados = MESES.filter((_, i) => receitaMes(lancamentos, i + 1, anoAtivo) > 0).length;
  const projecaoAnual = projecao * 12;

  const dadosMensais = MESES.map((mes, i) => ({
    mes,
    receita: receitaMes(lancamentos, i + 1, anoAtivo),
    projecao: projecao,
  }));

  // Crescimento mês a mês
  const crescimentos = dadosMensais.map((d, i) => {
    if (i === 0 || dadosMensais[i - 1].receita === 0) return null;
    return ((d.receita - dadosMensais[i - 1].receita) / dadosMensais[i - 1].receita) * 100;
  });

  const melhorMesIdx = dadosMensais.reduce((best, d, i) => (d.receita > dadosMensais[best].receita ? i : best), 0);
  const piorMesIdx = dadosMensais.reduce((best, d, i) => {
    if (d.receita === 0) return best;
    return d.receita < dadosMensais[best].receita && dadosMensais[best].receita > 0 ? i : best;
  }, melhorMesIdx);

  const dadosPizzaTipo = Object.entries(porTipo)
    .filter(([, v]) => v > 0)
    .map(([tipo, valor]) => ({ tipo, valor }));
  const coresTipo = ["#c2714f", "#475569", "#d97706", "#059669", "#7c3aed"];

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Análise</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Relatório Anual {anoAtivo}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* KPIs principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Receita Realizada</p>
            <p className="text-2xl font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(total)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{mesesComDados} meses com dados</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Média Mensal</p>
            <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(projecao)}
            </p>
            <p className="text-xs text-slate-400 mt-1">baseado nos meses ativos</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Projeção Anual</p>
            <p className="text-2xl font-bold text-[#059669]" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(projecaoAnual)}
            </p>
            <p className="text-xs text-slate-400 mt-1">se mantiver a média</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Ticket Médio</p>
            <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(
                lancamentos.filter((l) => l.ano === anoAtivo).length > 0
                  ? total / lancamentos.filter((l) => l.ano === anoAtivo).length
                  : 0
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1">por lançamento</p>
          </div>
        </div>

        {/* Gráfico de área com projeção */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            Receita vs. Projeção Mensal
          </h2>
          <p className="text-xs text-slate-400 mb-4">Linha tracejada representa a média de projeção</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dadosMensais}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c2714f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c2714f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number, name: string) => [formatarMoeda(v), name === "receita" ? "Receita" : "Projeção"]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                name="receita"
                stroke="#c2714f"
                strokeWidth={2.5}
                fill="url(#gradReceita)"
                dot={{ fill: "#c2714f", r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="projecao"
                name="projecao"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#059669]" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Melhor Mês</h3>
            </div>
            <p className="text-xl font-bold text-[#059669]" style={{ fontFamily: "'Fraunces', serif" }}>
              {MESES[melhorMesIdx]}
            </p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {formatarMoeda(dadosMensais[melhorMesIdx].receita)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Menor Mês (c/ dados)</h3>
            </div>
            <p className="text-xl font-bold text-slate-600" style={{ fontFamily: "'Fraunces', serif" }}>
              {MESES[piorMesIdx]}
            </p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {formatarMoeda(dadosMensais[piorMesIdx].receita)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-[#c2714f]" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Principal Réu</h3>
            </div>
            <p className="text-xl font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
              {topReus[0]?.reu || "—"}
            </p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {formatarMoeda(topReus[0]?.total || 0)}
            </p>
          </div>
        </div>

        {/* Controle de limite por banco */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            Controle de Limite por Banco (R$ 5.000)
          </h2>
          <div className="space-y-3">
            {BANCOS.map((b) => {
              const valor = porBanco[b];
              const status = statusBanco(valor);
              const pct = Math.min((valor / 5000) * 100, 100);
              return (
                <div key={b} className="flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{b}</p>
                    <p className="text-[10px] text-slate-400">{formatarMoeda(valor)}</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background:
                          status === "LIMITE" ? "#ef4444" : status === "ALERTA" ? "#f59e0b" : "#059669",
                      }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-20 text-center shrink-0 ${
                      status === "LIMITE"
                        ? "bg-red-100 text-red-600"
                        : status === "ALERTA"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
          {BANCOS.some((b) => statusBanco(porBanco[b]) !== "OK") && (
            <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                Bancos com valores acima de R$ 4.000 podem gerar obrigações de declaração. Verifique com seu contador.
              </span>
            </div>
          )}
        </div>

        {/* Distribuição por tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Distribuição por Tipo de Receita
            </h2>
            {dadosPizzaTipo.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={dadosPizzaTipo} dataKey="valor" nameKey="tipo" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {dadosPizzaTipo.map((_, i) => (
                        <Cell key={i} fill={coresTipo[i % coresTipo.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {dadosPizzaTipo.map((d, i) => (
                    <div key={d.tipo} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: coresTipo[i] }} />
                        <span className="text-xs text-slate-600">{d.tipo}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{formatarMoeda(d.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">Sem dados</p>
            )}
          </div>

          {/* Sumário executivo */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Sumário Executivo
            </h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Total de lançamentos</span>
                <span className="font-bold text-slate-800">{lancamentos.filter((l) => l.ano === anoAtivo).length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Meses com receita</span>
                <span className="font-bold text-slate-800">{mesesComDados} de 12</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Receita total</span>
                <span className="font-bold text-[#c2714f]">{formatarMoeda(total)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Projeção anual (média)</span>
                <span className="font-bold text-[#059669]">{formatarMoeda(projecaoAnual)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Principal banco</span>
                <span className="font-bold text-slate-800">
                  {BANCOS.reduce((best, b) => (porBanco[b] > porBanco[best] ? b : best), BANCOS[0])}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Principal tipo</span>
                <span className="font-bold text-slate-800">
                  {TIPOS.reduce((best, t) => (porTipo[t] > porTipo[best] ? t : best), TIPOS[0])}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Principal cliente</span>
                <span className="font-bold text-slate-800">{topClientes[0]?.cliente || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
