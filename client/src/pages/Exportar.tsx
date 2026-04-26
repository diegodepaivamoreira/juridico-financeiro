/**
 * JurisFinance — Exportar
 * Exportação para Excel (planilha anual + mensais vinculadas) e PDF
 * Design: Escritório Jurídico Contemporâneo
 */
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  MESES,
  TIPOS,
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
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

function gerarExcel(data: ReturnType<typeof useData>["data"]) {
  const { lancamentos, aReceber, anoAtivo } = data;
  const wb = XLSX.utils.book_new();

  // ── Abas mensais ──────────────────────────────────────────────────────────
  MESES.forEach((mes, i) => {
    const mesNum = i + 1;
    const lancMes = lancamentos
      .filter((l) => l.mes === mesNum && l.ano === anoAtivo)
      .sort((a, b) => a.data.localeCompare(b.data));

    const rows = [
      ["Data", "Autor 1", "Autor 2", "Réu 1", "Réu 2", "Réu 3", "Processo", "Tipo", "Valor", "Banco"],
      ...lancMes.map((l) => [
        l.data.split("-").reverse().join("/"),
        l.autor1,
        l.autor2 || "",
        l.reu1,
        l.reu2 || "",
        l.reu3 || "",
        l.processo,
        l.tipo,
        l.valor,
        l.banco,
      ]),
      [],
      ["", "", "", "", "", "", "", "TOTAL", lancMes.reduce((s, l) => s + l.valor, 0), ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Larguras de coluna
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];

    XLSX.utils.book_append_sheet(wb, ws, mes);
  });

  // ── Dashboard / Anual ─────────────────────────────────────────────────────
  const porBanco = receitaPorBanco(lancamentos, 0, anoAtivo);
  const porTipo = receitaPorTipo(lancamentos, anoAtivo);
  const porBanco2 = receitaPorBanco(lancamentos, 0, anoAtivo);
  const reus = rankingReus(lancamentos, anoAtivo);
  const clientes = rankingClientes(lancamentos, anoAtivo);
  const projecao = projecaoMensal(lancamentos, anoAtivo);
  const total = receitaAnual(lancamentos, anoAtivo);

  const dashRows: any[][] = [
    [`JURISFINANCE — DASHBOARD ANUAL ${anoAtivo}`],
    [],
    ["RECEITA MENSAL"],
    ["Mês", "Lançamentos", "Total"],
    ...MESES.map((mes, i) => {
      const mesNum = i + 1;
      const lancMes = lancamentos.filter((l) => l.mes === mesNum && l.ano === anoAtivo);
      return [mes, lancMes.length, receitaMes(lancamentos, mesNum, anoAtivo)];
    }),
    ["TOTAL ANUAL", lancamentos.filter((l) => l.ano === anoAtivo).length, total],
    [],
    ["RECEITA POR BANCO"],
    ["Banco", "Total Anual", "Status Limite"],
    ...BANCOS.map((b) => [b, porBanco[b], statusBanco(porBanco[b])]),
    [],
    ["RECEITA POR TIPO"],
    ["Tipo", "Total Anual"],
    ...TIPOS.map((t) => [t, porTipo[t] || 0]),
    [],
    ["PROJEÇÃO"],
    ["Média Mensal", projecao],
    ["Projeção Anual (12x média)", projecao * 12],
    [],
    ["RANKING DE RÉUS"],
    ["#", "Réu", "Total", "% do Total"],
    ...reus.map((r, i) => [i + 1, r.reu, r.total, total > 0 ? ((r.total / total) * 100).toFixed(2) + "%" : "0%"]),
    [],
    ["RANKING DE CLIENTES"],
    ["#", "Cliente", "Total", "% do Total"],
    ...clientes.map((c, i) => [i + 1, c.cliente, c.total, total > 0 ? ((c.total / total) * 100).toFixed(2) + "%" : "0%"]),
  ];

  const wsDash = XLSX.utils.aoa_to_sheet(dashRows);
  wsDash["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");

  // ── A Receber ─────────────────────────────────────────────────────────────
  const arRows = [
    ["Cliente", "Réu", "Tipo", "Valor", "Status"],
    ...aReceber.map((i) => [i.cliente, i.reu, i.tipo, i.valor ?? "", i.status]),
    [],
    ["", "", "TOTAL PENDENTE", aReceber.filter((i) => i.status === "Pendente").reduce((s, i) => s + (i.valor || 0), 0), ""],
    ["", "", "TOTAL RECEBIDO", aReceber.filter((i) => i.status === "Recebido").reduce((s, i) => s + (i.valor || 0), 0), ""],
  ];
  const wsAR = XLSX.utils.aoa_to_sheet(arRows);
  wsAR["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsAR, "A Receber");

  XLSX.writeFile(wb, `JurisFinance_${anoAtivo}.xlsx`);
}

function gerarPDF(data: ReturnType<typeof useData>["data"]) {
  const { lancamentos, aReceber, anoAtivo } = data;
  const total = receitaAnual(lancamentos, anoAtivo);
  const porBanco = receitaPorBanco(lancamentos, 0, anoAtivo);
  const porTipo = receitaPorTipo(lancamentos, anoAtivo);
  const projecao = projecaoMensal(lancamentos, anoAtivo);
  const reus = rankingReus(lancamentos, anoAtivo);
  const clientes = rankingClientes(lancamentos, anoAtivo);

  // Gerar HTML para impressão
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>JurisFinance — Relatório ${anoAtivo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; color: #1e293b; background: white; padding: 40px; font-size: 12px; }
  h1 { font-size: 24px; color: #c2714f; margin-bottom: 4px; }
  h2 { font-size: 14px; color: #475569; margin: 20px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .subtitle { color: #94a3b8; font-size: 11px; margin-bottom: 24px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .kpi-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi-value { font-size: 16px; font-weight: bold; color: #c2714f; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { background: #f8f7f4; text-align: left; padding: 6px 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
  tr:nth-child(even) td { background: #fafaf9; }
  .total-row td { font-weight: bold; background: #f1f5f9; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
  .badge-ok { background: #d1fae5; color: #059669; }
  .badge-warn { background: #fef3c7; color: #d97706; }
  .badge-err { background: #fee2e2; color: #dc2626; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>JurisFinance</h1>
<p class="subtitle">Relatório Financeiro Anual — Exercício ${anoAtivo} · Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>

<div class="kpis">
  <div class="kpi"><div class="kpi-label">Receita Total</div><div class="kpi-value">${formatarMoeda(total)}</div></div>
  <div class="kpi"><div class="kpi-label">Média Mensal</div><div class="kpi-value">${formatarMoeda(projecao)}</div></div>
  <div class="kpi"><div class="kpi-label">Projeção Anual</div><div class="kpi-value">${formatarMoeda(projecao * 12)}</div></div>
  <div class="kpi"><div class="kpi-label">Lançamentos</div><div class="kpi-value">${lancamentos.filter((l) => l.ano === anoAtivo).length}</div></div>
</div>

<h2>Receita Mensal</h2>
<table>
<tr><th>Mês</th><th>Lançamentos</th><th>Total</th></tr>
${MESES.map((mes, i) => {
  const mesNum = i + 1;
  const lancMes = lancamentos.filter((l) => l.mes === mesNum && l.ano === anoAtivo);
  const t = lancMes.reduce((s, l) => s + l.valor, 0);
  return `<tr><td>${mes}</td><td>${lancMes.length}</td><td>${t > 0 ? formatarMoeda(t) : "—"}</td></tr>`;
}).join("")}
<tr class="total-row"><td>TOTAL</td><td>${lancamentos.filter((l) => l.ano === anoAtivo).length}</td><td>${formatarMoeda(total)}</td></tr>
</table>

<h2>Receita por Banco</h2>
<table>
<tr><th>Banco</th><th>Total</th><th>Status</th></tr>
${BANCOS.map((b) => {
  const st = statusBanco(porBanco[b]);
  const cls = st === "LIMITE" ? "badge-err" : st === "ALERTA" ? "badge-warn" : "badge-ok";
  return `<tr><td>${b}</td><td>${formatarMoeda(porBanco[b])}</td><td><span class="badge ${cls}">${st}</span></td></tr>`;
}).join("")}
</table>

<h2>Receita por Tipo</h2>
<table>
<tr><th>Tipo</th><th>Total</th><th>% do Total</th></tr>
${TIPOS.map((t) => `<tr><td>${t}</td><td>${formatarMoeda(porTipo[t] || 0)}</td><td>${(((porTipo[t] || 0) / total) * 100).toFixed(1)}%</td></tr>`).join("")}
</table>

<h2>Ranking de Réus</h2>
<table>
<tr><th>#</th><th>Réu</th><th>Total</th><th>% do Total</th></tr>
${reus.map((r, i) => `<tr><td>${i + 1}º</td><td>${r.reu}</td><td>${formatarMoeda(r.total)}</td><td>${(r.total / total * 100).toFixed(1)}%</td></tr>`).join("")}
</table>

<h2>Ranking de Clientes</h2>
<table>
<tr><th>#</th><th>Cliente</th><th>Total</th><th>% do Total</th></tr>
${clientes.map((c, i) => `<tr><td>${i + 1}º</td><td>${c.cliente}</td><td>${formatarMoeda(c.total)}</td><td>${(c.total / total * 100).toFixed(1)}%</td></tr>`).join("")}
</table>

<h2>A Receber</h2>
<table>
<tr><th>Cliente</th><th>Réu</th><th>Tipo</th><th>Valor</th><th>Status</th></tr>
${aReceber.map((i) => `<tr><td>${i.autor1 || "—"}</td><td>${i.reu1 || "—"}</td><td>${i.tipo || "—"}</td><td>${i.valor !== null ? formatarMoeda(i.valor) : "—"}</td><td>${i.status}</td></tr>`).join("")}
</table>

<div class="footer">JurisFinance — Sistema de Gestão Financeira Jurídica · Documento gerado automaticamente</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

export default function Exportar() {
  const { data } = useData();
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [periodo, setPeriodo] = useState<'mensal' | 'semestral' | 'anual'>('anual');
  const [mesSelecionado, setMesSelecionado] = useState(1);
  const [semestreSelecionado, setSemestreSelecionado] = useState(1);

  function handleExcel() {
    setLoadingXlsx(true);
    try {
      gerarExcel(data);
      toast.success("Planilha Excel gerada com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar planilha");
    } finally {
      setLoadingXlsx(false);
    }
  }

  function handlePDF() {
    setLoadingPdf(true);
    try {
      gerarPDF(data);
      toast.success("Relatório PDF aberto para impressão");
    } catch (e) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setLoadingPdf(false);
    }
  }

  const { lancamentos, anoAtivo } = data;
  const total = receitaAnual(lancamentos, anoAtivo);
  const mesesComDados = MESES.filter((_, i) => receitaMes(lancamentos, i + 1, anoAtivo) > 0).length;

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Ferramentas</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Exportar Dados
        </h1>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Seletor de período */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Período</h2>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2"><input type="radio" checked={periodo === 'mensal'} onChange={() => setPeriodo('mensal')} /><span className="text-sm">Mensal</span></label>
            <label className="flex items-center gap-2"><input type="radio" checked={periodo === 'semestral'} onChange={() => setPeriodo('semestral')} /><span className="text-sm">Semestral</span></label>
            <label className="flex items-center gap-2"><input type="radio" checked={periodo === 'anual'} onChange={() => setPeriodo('anual')} /><span className="text-sm">Anual</span></label>
          </div>
          {periodo === 'mensal' && <div className="mt-3"><label className="text-xs text-slate-500 block mb-2">Mês:</label><select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">{MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>}
          {periodo === 'semestral' && <div className="mt-3"><label className="text-xs text-slate-500 block mb-2">Semestre:</label><select value={semestreSelecionado} onChange={(e) => setSemestreSelecionado(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg text-sm"><option value={1}>1º Semestre (Jan-Jun)</option><option value={2}>2º Semestre (Jul-Dez)</option></select></div>}
        </div>

        {/* Resumo do que será exportado */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Dados disponíveis para exportação — {anoAtivo}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Lançamentos</p>
              <p className="font-bold text-slate-800 text-lg">{lancamentos.filter((l) => l.ano === anoAtivo).length}</p>
            </div>
            <div>
              <p className="text-slate-400">Meses com dados</p>
              <p className="font-bold text-slate-800 text-lg">{mesesComDados} / 12</p>
            </div>
            <div>
              <p className="text-slate-400">Receita total</p>
              <p className="font-bold text-[#c2714f] text-lg">{formatarMoeda(total)}</p>
            </div>
          </div>
        </div>

        {/* Opções de exportação */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Excel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                  Planilha Excel (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Exporta planilha completa com abas mensais (Jan–Dez), aba Dashboard com totais anuais por banco e tipo, ranking de réus e clientes, projeção de receita e aba "A Receber".
                </p>
                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <p>✓ 12 abas mensais com lançamentos detalhados</p>
                  <p>✓ Aba Dashboard com consolidado anual</p>
                  <p>✓ Ranking de réus e clientes</p>
                  <p>✓ Aba A Receber com status</p>
                  <p>✓ Totais por banco com indicador de limite</p>
                </div>
                <Button
                  onClick={handleExcel}
                  disabled={loadingXlsx}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full"
                >
                  <Download size={16} />
                  {loadingXlsx ? "Gerando..." : "Baixar Excel"}
                </Button>
              </div>
            </div>
          </div>

          {/* PDF */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <FileText size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                  Relatório PDF
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Gera relatório anual formatado para impressão com todas as métricas, rankings, controle de limite por banco e sumário executivo.
                </p>
                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <p>✓ KPIs e métricas principais</p>
                  <p>✓ Receita mensal detalhada</p>
                  <p>✓ Controle de limite por banco</p>
                  <p>✓ Ranking completo de réus e clientes</p>
                  <p>✓ Lista A Receber com status</p>
                </div>
                <Button
                  onClick={handlePDF}
                  disabled={loadingPdf}
                  className="bg-red-500 hover:bg-red-600 text-white gap-2 w-full"
                >
                  <Download size={16} />
                  {loadingPdf ? "Gerando..." : "Gerar PDF / Imprimir"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Nota sobre instalação Windows */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Sobre o uso no Windows 11</p>
          <p>
            Este sistema funciona diretamente no navegador (Chrome, Edge, Firefox). Para uso offline no Windows 11,
            você pode instalar como PWA: clique no ícone de instalação na barra de endereço do navegador para
            adicionar à área de trabalho como aplicativo nativo.
          </p>
        </div>
      </div>
    </div>
  );
}
