/**
 * JurisFinance — Dashboard
 * Design: Escritório Jurídico Contemporâneo
 * Métricas principais, gráficos de receita mensal, por banco, por tipo
 * Paleta: terracota #c2714f, slate #475569, âmbar #d97706, verde #059669
 */
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  MESES,
  formatarMoeda,
  projecaoMensal,
  rankingClientes,
  rankingReus,
  receitaAnual,
  receitaMes,
  receitaPorBanco,
  receitaPorTipo,
  statusBanco,
} from "@/lib/store";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663515154498/6GaV8GGLmicDmG3DxEajvR/juris-hero-GEG9fANNwTuC4VRS9pLvaD.webp";

const CORES_BANCO: Record<string, string> = {
  Santander: "#c2714f",
  Itaú: "#d97706",
  Nubank: "#7c3aed",
  "Mercado Pago": "#059669",
  Wise: "#0284c7",
};

const CORES_TIPO = ["#c2714f", "#475569", "#d97706", "#059669", "#7c3aed"];

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent ? `${accent}18` : "#c2714f18" }}
        >
          <span style={{ color: accent || "#c2714f" }}>{icon}</span>
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-bold text-slate-800 leading-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {formatarMoeda(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data } = useData();
  const { lancamentos, anoAtivo, aReceber } = data;

  const receitaTotal = receitaAnual(lancamentos, anoAtivo);
  const projecao = projecaoMensal(lancamentos, anoAtivo);
  const mesAtualNum = new Date().getMonth() + 1;
  const porBanco = receitaPorBanco(lancamentos, anoAtivo, mesAtualNum);
  const porTipo = receitaPorTipo(lancamentos, anoAtivo);
  const topReus = rankingReus(lancamentos, anoAtivo).slice(0, 5);
  const topClientes = rankingClientes(lancamentos, anoAtivo).slice(0, 5);
  const pendentes = aReceber.filter((i) => i.status === "Pendente");
  const totalPendente = pendentes.reduce((s, i) => s + (i.valor || 0), 0);

  // Dados para gráfico de linha mensal
  const dadosMensais = MESES.map((mes, i) => ({
    mes,
    receita: receitaMes(lancamentos, i + 1, anoAtivo),
  }));

  // Dados para gráfico de barras por banco
  const dadosBanco = BANCOS.map((b) => ({
    banco: b,
    valor: porBanco[b],
    status: statusBanco(porBanco[b]),
  }));

  // Dados para pizza de tipo
  const dadosTipo = Object.entries(porTipo)
    .filter(([, v]) => v > 0)
    .map(([tipo, valor]) => ({ tipo, valor }));

  // Mês atual com maior receita
  const melhorMes = dadosMensais.reduce(
    (best, d) => (d.receita > best.receita ? d : best),
    dadosMensais[0]
  );

  const receitaMesAtual = receitaMes(lancamentos, mesAtualNum, anoAtivo);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero Banner */}
      <div
        className="relative h-28 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: '120%', backgroundPosition: 'center 30%' }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-4">
          <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-1">
            Exercício {anoAtivo}
          </p>
          <h1
            className="text-3xl font-bold text-slate-800"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Dashboard Financeiro
          </h1>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Receita Anual"
            value={formatarMoeda(receitaTotal)}
            sub={`${anoAtivo}`}
            icon={<BadgeDollarSign size={16} />}
            accent="#c2714f"
          />
          <MetricCard
            label="Mês Atual"
            value={formatarMoeda(receitaMesAtual)}
            sub={MESES[mesAtualNum - 1]}
            icon={<CalendarDays size={16} />}
            accent="#d97706"
          />
          <MetricCard
            label="Projeção Mensal"
            value={formatarMoeda(projecao)}
            sub="média dos meses com dados"
            icon={<TrendingUp size={16} />}
            accent="#059669"
          />
          <MetricCard
            label="A Receber"
            value={formatarMoeda(totalPendente)}
            sub={`${pendentes.length} pendentes`}
            icon={<Users size={16} />}
            accent="#7c3aed"
          />
        </div>

        {/* Gráficos linha + pizza */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Receita mensal - linha */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
                  Receita Mensal
                </h2>
                <p className="text-xs text-slate-400">Evolução ao longo do ano</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#059669] font-medium">
                <ArrowUpRight size={14} />
                {melhorMes.mes} foi o melhor mês
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="#c2714f"
                  strokeWidth={2.5}
                  dot={{ fill: "#c2714f", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Por tipo - pizza */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
              Por Tipo
            </h2>
            <p className="text-xs text-slate-400 mb-4">Distribuição de receita</p>
            {dadosTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={dadosTipo}
                    dataKey="valor"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {dadosTipo.map((_, i) => (
                      <Cell key={i} fill={CORES_TIPO[i % CORES_TIPO.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatarMoeda(v)}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-300 text-sm">
                Sem dados
              </div>
            )}
          </div>
        </div>

        {/* Gráfico por banco */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
                Receita por Banco
              </h2>
              <p className="text-xs text-slate-400">Controle de entradas por instituição</p>
            </div>
            <div className="flex gap-2">
              {dadosBanco.map((b) => (
                <span
                  key={b.banco}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === "LIMITE"
                      ? "bg-red-100 text-red-600"
                      : b.status === "ALERTA"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {b.banco.split(" ")[0]}: {b.status}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dadosBanco} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="banco" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" name="Valor" radius={[6, 6, 0, 0]}>
                {dadosBanco.map((b, i) => (
                  <Cell key={i} fill={CORES_BANCO[b.banco] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranking Réus */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Top Réus
            </h2>
            {topReus.length === 0 ? (
              <p className="text-sm text-slate-300">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {topReus.map((r, i) => (
                  <div key={r.reu} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: i === 0 ? "#c2714f" : i === 1 ? "#d97706" : "#94a3b8" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-slate-700 truncate">{r.reu}</span>
                        <span className="text-xs font-bold text-slate-800 ml-2 shrink-0">{formatarMoeda(r.total)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(r.total / topReus[0].total) * 100}%`,
                            background: i === 0 ? "#c2714f" : i === 1 ? "#d97706" : "#94a3b8",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ranking Clientes */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Top Clientes
            </h2>
            {topClientes.length === 0 ? (
              <p className="text-sm text-slate-300">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {topClientes.map((c, i) => (
                  <div key={c.cliente} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: i === 0 ? "#059669" : i === 1 ? "#0284c7" : "#94a3b8" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-slate-700 truncate">{c.cliente}</span>
                        <span className="text-xs font-bold text-slate-800 ml-2 shrink-0">{formatarMoeda(c.total)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(c.total / topClientes[0].total) * 100}%`,
                            background: i === 0 ? "#059669" : i === 1 ? "#0284c7" : "#94a3b8",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerta de limite por banco */}
        {dadosBanco.some((b) => b.status !== "OK") && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Atenção: Limite por Banco</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {dadosBanco
                  .filter((b) => b.status !== "OK")
                  .map((b) => `${b.banco} (${b.status}: ${formatarMoeda(b.valor)})`)
                  .join(" · ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
