/**
 * JurisFinance — Lançamentos Mensais
 * Design: Escritório Jurídico Contemporâneo
 * Seletor de mês, formulário de entrada, tabela de lançamentos
 * Suporte a até 2 autores e 3 réus
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  BancoLancamento,
  Lancamento,
  MESES,
  REUS_PADRAO,
  TIPOS,
  TipoLancamento,
  TipoRegistro,
  formatarData,
  formatarMoeda,
  receitaMes,
  resetarDados,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormState {
  data: string;
  autor1: string;
  autor2: string;
  reu1: string;
  reu2: string;
  reu3: string;
  processo: string;
  tipo: TipoLancamento | "";
  valor: string;
  banco: BancoLancamento | "";
  tipoRegistro: TipoRegistro;
  observacoes: string;
}

const FORM_VAZIO: FormState = {
  data: new Date().toISOString().split("T")[0],
  autor1: "",
  autor2: "",
  reu1: "",
  reu2: "",
  reu3: "",
  processo: "",
  tipoRegistro: "Faturamento",
  tipo: "",
  valor: "",
  banco: "",
  observacoes: "",
};

export default function Lancamentos() {
  const { data, addLancamento, updateLancamento, deleteLancamento } = useData();
  const { lancamentos, anoAtivo } = data;

  const mesAtual = new Date().getMonth() + 1;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);

  const lancamentosMes = lancamentos
    .filter((l) => l.mes === mesSelecionado && l.ano === anoAtivo)
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalMes = receitaMes(lancamentos, mesSelecionado, anoAtivo);

  function abrirNovo() {
    setEditandoId(null);
    setForm({
      ...FORM_VAZIO,
      data: `${anoAtivo}-${String(mesSelecionado).padStart(2, "0")}-01`,
    });
    setDialogAberto(true);
  }

  function abrirEditar(l: Lancamento) {
    setEditandoId(l.id);
    setForm({
      data: l.data,
      autor1: l.autor1 || "",
      autor2: l.autor2 || "",
      reu1: l.reu1 || "",
      reu2: l.reu2 || "",
      reu3: l.reu3 || "",
      processo: l.processo || "",
      tipo: l.tipo,
      valor: String(l.valor),
      banco: l.banco,
      tipoRegistro: l.tipoRegistro || "Faturamento",
      observacoes: l.observacoes || "",
    });
    setDialogAberto(true);
  }

  function salvar() {
    if (!form.autor1 || !form.reu1 || !form.tipo || !form.banco || !form.valor) {
      toast.error("Preencha: Autor 1, Réu 1, Tipo, Banco e Valor");
      return;
    }
    const valorNum = parseFloat(form.valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error("Valor inválido");
      return;
    }
    const [y, m] = form.data.split("-").map(Number);
    const payload = {
      data: form.data,
      autor1: form.autor1,
      autor2: form.autor2 || undefined,
      reu1: form.reu1,
      reu2: form.reu2 || undefined,
      reu3: form.reu3 || undefined,
      processo: form.processo,
      tipo: form.tipo as TipoLancamento,
      valor: valorNum,
      banco: form.banco as BancoLancamento,
      mes: m,
      ano: y,
      tipoRegistro: form.tipoRegistro,
      observacoes: form.observacoes || undefined,
    };
    if (editandoId) {
      updateLancamento(editandoId, payload);
      toast.success("Lançamento atualizado");
    } else {
      addLancamento(payload);
      toast.success("Lançamento adicionado");
    }
    setDialogAberto(false);
  }

  function excluir(id: string) {
    deleteLancamento(id);
    toast.success("Lançamento excluído");
  }

  // Helper para exibir múltiplos autores
  function formatarAutores(l: Lancamento): string {
    const autores = [l.autor1, l.autor2].filter(Boolean);
    return autores.join(" + ");
  }

  // Helper para exibir múltiplos réus
  function formatarReus(l: Lancamento): string {
    const reus = [l.reu1, l.reu2, l.reu3].filter(Boolean);
    return reus.join(" + ");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">
              {anoAtivo}
            </p>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              Lançamentos
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={abrirNovo}
              className="bg-[#c2714f] hover:bg-[#a85e3f] text-white gap-2"
            >
              <Plus size={16} />
              Novo Lançamento
            </Button>
          </div>
        </div>

        {/* Seletor de mês */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {MESES.map((mes, i) => {
            const total = receitaMes(lancamentos, i + 1, anoAtivo);
            const ativo = mesSelecionado === i + 1;
            return (
              <button
                key={mes}
                onClick={() => setMesSelecionado(i + 1)}
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-all shrink-0 min-w-[52px]",
                  ativo
                    ? "bg-[#c2714f] text-white shadow-sm"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                <span className="font-semibold">{mes}</span>
                {total > 0 && (
                  <span className={cn("text-[9px] mt-0.5", ativo ? "text-white/80" : "text-slate-400")}>
                    {(total / 1000).toFixed(1)}k
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Resumo do mês */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-600">
            {MESES[mesSelecionado - 1]} {anoAtivo} — {lancamentosMes.length} lançamento(s)
          </h2>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total do mês</p>
            <p className="text-lg font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(totalMes)}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {lancamentosMes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
              <Plus size={32} className="mb-2" />
              <p className="text-sm">Nenhum lançamento em {MESES[mesSelecionado - 1]}</p>
              <button
                onClick={abrirNovo}
                className="mt-3 text-xs text-[#c2714f] hover:underline"
              >
                Adicionar primeiro lançamento
              </button>
            </div>
          ) : (
            <table className="w-full text-sm" style={{ minWidth: '100%' }}>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Autores</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Réus</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Banco</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {lancamentosMes.map((l, i) => (
                  <tr
                    key={l.id}
                    className={cn(
                      "border-b border-slate-50 hover:bg-slate-50/50 transition-colors",
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}
                  >
                    <td className="px-4 py-3 text-slate-600 text-xs">{formatarData(l.data)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium text-sm">{formatarAutores(l)}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{formatarReus(l)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{l.processo || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {l.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {formatarMoeda(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: `${Object.entries({
                            Santander: "#c2714f", Itaú: "#d97706", Nubank: "#7c3aed",
                            "Mercado Pago": "#059669", Wise: "#0284c7",
                          }).find(([k]) => k === l.banco)?.[1] || "#94a3b8"}18`,
                          color: Object.entries({
                            Santander: "#c2714f", Itaú: "#d97706", Nubank: "#7c3aed",
                            "Mercado Pago": "#059669", Wise: "#0284c7",
                          }).find(([k]) => k === l.banco)?.[1] || "#94a3b8",
                        }}
                      >
                        {l.banco}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => abrirEditar(l)}
                        className="p-1 text-slate-400 hover:text-[#c2714f] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => excluir(l.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialog de Novo/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar" : "Novo"} Lançamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data */}
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>

            {/* Autores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Autor 1 *</Label>
                <Input
                  placeholder="Primeiro autor"
                  value={form.autor1}
                  onChange={(e) => setForm({ ...form, autor1: e.target.value })}
                />
              </div>
              <div>
                <Label>Autor 2 (opcional)</Label>
                <Input
                  placeholder="Segundo autor"
                  value={form.autor2}
                  onChange={(e) => setForm({ ...form, autor2: e.target.value })}
                />
              </div>
            </div>

            {/* Réus */}
            <div>
              <Label className="mb-2 block">Réus (até 3)</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Réu 1 *"
                  value={form.reu1}
                  onChange={(e) => setForm({ ...form, reu1: e.target.value })}
                  list="reus-list"
                />
                <Input
                  placeholder="Réu 2 (opcional)"
                  value={form.reu2}
                  onChange={(e) => setForm({ ...form, reu2: e.target.value })}
                  list="reus-list"
                />
                <Input
                  placeholder="Réu 3 (opcional)"
                  value={form.reu3}
                  onChange={(e) => setForm({ ...form, reu3: e.target.value })}
                  list="reus-list"
                />
                <datalist id="reus-list">
                  {REUS_PADRAO.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Processo */}
            <div>
              <Label>Processo</Label>
              <Input
                placeholder="Número do processo"
                value={form.processo}
                onChange={(e) => setForm({ ...form, processo: e.target.value })}
              />
            </div>

            {/* Tipo, Valor, Banco */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as TipoLancamento })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  step="0.01"
                />
              </div>
              <div>
                <Label>Banco *</Label>
                <Select value={form.banco} onValueChange={(v) => setForm({ ...form, banco: v as BancoLancamento })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label>Observações</Label>
              <textarea
                placeholder="Notas sobre este lançamento (ex: Aguardando sentença, Recurso em andamento)"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c2714f]"
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvar} className="bg-[#c2714f] hover:bg-[#a85e3f] text-white">
                {editandoId ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
