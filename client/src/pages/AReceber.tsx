/**
 * JurisFinance — A Receber
 * Design: Escritório Jurídico Contemporâneo
 * Suporte a até 2 autores e 3 réus
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { ItemAReceber, REUS_PADRAO, TIPOS, formatarMoeda } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormState {
  autor1: string;
  autor2: string;
  reu1: string;
  reu2: string;
  reu3: string;
  tipo: string;
  valor: string;
  status: "Pendente" | "Recebido";
  dataVencimento: string;
}

const FORM_VAZIO: FormState = {
  autor1: "",
  autor2: "",
  reu1: "",
  reu2: "",
  reu3: "",
  tipo: "",
  valor: "",
  status: "Pendente",
  dataVencimento: new Date().toISOString().split("T")[0],
};

export default function AReceber() {
  const { data, addAReceber, updateAReceber, deleteAReceber } = useData();
  const { aReceber } = data;

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [filtro, setFiltro] = useState<"todos" | "Pendente" | "Recebido">("todos");

  const itens = aReceber.filter((i) => filtro === "todos" || i.status === filtro);
  const totalPendente = aReceber.filter((i) => i.status === "Pendente").reduce((s, i) => s + (i.valor || 0), 0);
  const totalRecebido = aReceber.filter((i) => i.status === "Recebido").reduce((s, i) => s + (i.valor || 0), 0);

  function abrirNovo() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setDialogAberto(true);
  }

  function abrirEditar(item: ItemAReceber) {
    setEditandoId(item.id);
    setForm({
      autor1: item.autor1 || "",
      autor2: item.autor2 || "",
      reu1: item.reu1 || "",
      reu2: item.reu2 || "",
      reu3: item.reu3 || "",
      tipo: item.tipo,
      valor: item.valor !== null ? String(item.valor) : "",
      status: item.status,
      dataVencimento: item.dataVencimento || new Date().toISOString().split("T")[0],
    });
    setDialogAberto(true);
  }

  function salvar() {
    if (!form.autor1 || !form.reu1 || !form.tipo) {
      toast.error("Preencha: Autor 1, Réu 1 e Tipo");
      return;
    }
    const valorNum = form.valor ? parseFloat(form.valor.replace(",", ".")) : null;
    const payload = {
      autor1: form.autor1,
      autor2: form.autor2 || undefined,
      reu1: form.reu1,
      reu2: form.reu2 || undefined,
      reu3: form.reu3 || undefined,
      tipo: form.tipo,
      valor: valorNum,
      status: form.status,
      dataVencimento: form.dataVencimento,
    };
    if (editandoId) {
      updateAReceber(editandoId, payload);
      toast.success("Item atualizado");
    } else {
      addAReceber(payload);
      toast.success("Item adicionado");
    }
    setDialogAberto(false);
  }

  function marcarRecebido(id: string) {
    updateAReceber(id, { status: "Recebido" });
    toast.success("Marcado como recebido");
  }

  function excluir(id: string) {
    deleteAReceber(id);
    toast.success("Item excluído");
  }

  // Helper para exibir múltiplos autores
  function formatarAutores(item: ItemAReceber): string {
    const autores = [item.autor1, item.autor2].filter(Boolean);
    return autores.join(" + ");
  }

  // Helper para exibir múltiplos réus
  function formatarReus(item: ItemAReceber): string {
    const reus = [item.reu1, item.reu2, item.reu3].filter(Boolean);
    return reus.join(" + ");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">
              Controle
            </p>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              A Receber
            </h1>
          </div>
          <Button
            onClick={abrirNovo}
            className="bg-[#c2714f] hover:bg-[#a85e3f] text-white gap-2"
          >
            <Plus size={16} />
            Novo Item
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Pendente</p>
            <p className="text-xl font-bold text-[#c2714f]" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(totalPendente)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Recebido</p>
            <p className="text-xl font-bold text-green-600" style={{ fontFamily: "'Fraunces', serif" }}>
              {formatarMoeda(totalRecebido)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Itens Pendentes</p>
            <p className="text-xl font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
              {aReceber.filter((i) => i.status === "Pendente").length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {(["todos", "Pendente", "Recebido"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filtro === f
                  ? "bg-[#c2714f] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              )}
            >
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
              <Clock size={32} className="mb-2" />
              <p className="text-sm">Nenhum item {filtro !== "todos" ? `${filtro.toLowerCase()}` : ""}</p>
            </div>
          ) : (
            <table className="w-full text-sm" style={{ minWidth: '100%' }}>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Autores</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Réus</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => {
                  const hoje = new Date().toISOString().split('T')[0];
                  const vencido = item.dataVencimento && item.dataVencimento < hoje && item.status === 'Pendente';
                  return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-slate-50 hover:bg-slate-50/50 transition-colors",
                      vencido ? "bg-red-50" : (i % 2 === 0 ? "bg-white" : "bg-slate-50/30")
                    )}
                  >
                    <td className="px-4 py-3 text-slate-700 font-medium text-sm">{formatarAutores(item)}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{formatarReus(item)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {item.valor !== null ? formatarMoeda(item.valor) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-semibold",
                        vencido ? "text-red-600 font-bold" : "text-slate-600"
                      )}>
                        {item.dataVencimento ? new Date(item.dataVencimento).toLocaleDateString('pt-BR') : "—"}
                        {vencido && " (VENCIDO)"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === "Pendente" ? (
                          <Clock size={14} className={vencido ? "text-red-500" : "text-orange-500"} />
                        ) : (
                          <CheckCircle2 size={14} className="text-green-600" />
                        )}
                        <span className={cn(
                          "text-xs font-semibold",
                          vencido ? "text-red-600" : (item.status === "Pendente" ? "text-orange-600" : "text-green-600")
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      {item.status === "Pendente" && (
                        <button
                          onClick={() => marcarRecebido(item.id)}
                          className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                          title="Marcar como recebido"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => abrirEditar(item)}
                        className="p-1 text-slate-400 hover:text-[#c2714f] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => excluir(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialog de Novo/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar" : "Novo"} Item A Receber</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            {/* Tipo, Valor, Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
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
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  step="0.01"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "Pendente" | "Recebido" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data de Vencimento */}
            <div>
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
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
