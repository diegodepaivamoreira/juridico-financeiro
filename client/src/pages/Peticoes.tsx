/**
 * JurisFinance — Petições
 * Gerenciamento de petições: a fazer, em elaboração, prontas, protocoladas.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import {
  JUIZADOS,
  Peticao,
  STATUS_PETICAO,
  StatusPeticao,
  TIPOS_PETICAO,
  TipoPeticao,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Edit2,
  FileCheck2,
  FileEdit,
  FilePlus2,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface FormState {
  autor: string;
  reu: string;
  tipo: TipoPeticao | "";
  juizado: string;
  numeroProcesso: string;
  status: StatusPeticao;
  dataCadastro: string;
  prazo: string;
  dataProtocolo: string;
  observacoes: string;
}

function nowLocalDatetime(): string {
  // formato compatível com <input type="datetime-local">
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

const FORM_VAZIO: FormState = {
  autor: "",
  reu: "",
  tipo: "",
  juizado: "",
  numeroProcesso: "",
  status: "A fazer",
  dataCadastro: nowLocalDatetime(),
  prazo: "",
  dataProtocolo: "",
  observacoes: "",
};

const STATUS_STYLE: Record<StatusPeticao, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  "A fazer": {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: <FilePlus2 size={14} />,
    label: "A fazer",
  },
  "Em elaboração": {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <FileEdit size={14} />,
    label: "Em elaboração",
  },
  "Pronta": {
    bg: "bg-violet-50 border-violet-200",
    text: "text-violet-700",
    icon: <FileCheck2 size={14} />,
    label: "Pronta",
  },
  "Protocolada": {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={14} />,
    label: "Protocolada",
  },
};

function formatarDataHora(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataBr(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function Peticoes() {
  const { data, addPeticao, updatePeticao, deletePeticao } = useData();
  const peticoes = data.peticoes || [];

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [filtroStatus, setFiltroStatus] = useState<StatusPeticao | "todos">("A fazer");
  const [busca, setBusca] = useState("");

  const itens = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase();
    return peticoes
      .filter((p) => filtroStatus === "todos" || p.status === filtroStatus)
      .filter((p) => {
        if (!buscaLower) return true;
        return (
          p.autor?.toLowerCase().includes(buscaLower) ||
          p.reu?.toLowerCase().includes(buscaLower) ||
          p.juizado?.toLowerCase().includes(buscaLower) ||
          p.numeroProcesso?.toLowerCase().includes(buscaLower) ||
          p.observacoes?.toLowerCase().includes(buscaLower)
        );
      })
      .sort((a, b) => {
        // protocoladas no fim, restante por dataCadastro decrescente
        if (a.status === "Protocolada" && b.status !== "Protocolada") return 1;
        if (b.status === "Protocolada" && a.status !== "Protocolada") return -1;
        return (b.dataCadastro || "").localeCompare(a.dataCadastro || "");
      });
  }, [peticoes, filtroStatus, busca]);

  const contagem = useMemo(() => {
    const c: Record<StatusPeticao | "todos", number> = {
      todos: peticoes.length,
      "A fazer": 0,
      "Em elaboração": 0,
      "Pronta": 0,
      "Protocolada": 0,
    };
    peticoes.forEach((p) => {
      c[p.status] = (c[p.status] || 0) + 1;
    });
    return c;
  }, [peticoes]);

  function abrirNovo() {
    setEditandoId(null);
    setForm({ ...FORM_VAZIO, dataCadastro: nowLocalDatetime() });
    setDialogAberto(true);
  }

  function abrirEditar(p: Peticao) {
    setEditandoId(p.id);
    setForm({
      autor: p.autor || "",
      reu: p.reu || "",
      tipo: p.tipo,
      juizado: p.juizado || "",
      numeroProcesso: p.numeroProcesso || "",
      status: p.status,
      dataCadastro: p.dataCadastro ? p.dataCadastro.slice(0, 16) : nowLocalDatetime(),
      prazo: p.prazo || "",
      dataProtocolo: p.dataProtocolo ? p.dataProtocolo.slice(0, 16) : "",
      observacoes: p.observacoes || "",
    });
    setDialogAberto(true);
  }

  function salvar() {
    if (!form.autor || !form.reu || !form.tipo) {
      toast.error("Preencha: Autor, Réu e Tipo");
      return;
    }
    const payload: Omit<Peticao, "id"> = {
      autor: form.autor.trim(),
      reu: form.reu.trim(),
      tipo: form.tipo as TipoPeticao,
      juizado: form.juizado.trim(),
      numeroProcesso: form.numeroProcesso.trim() || undefined,
      status: form.status,
      dataCadastro: new Date(form.dataCadastro).toISOString(),
      prazo: form.prazo || undefined,
      dataProtocolo:
        form.status === "Protocolada"
          ? form.dataProtocolo
            ? new Date(form.dataProtocolo).toISOString()
            : new Date().toISOString()
          : form.dataProtocolo
            ? new Date(form.dataProtocolo).toISOString()
            : undefined,
      observacoes: form.observacoes.trim() || undefined,
    };

    if (editandoId) {
      updatePeticao(editandoId, payload);
      toast.success("Petição atualizada");
    } else {
      addPeticao(payload);
      toast.success("Petição adicionada");
    }
    setDialogAberto(false);
  }

  function mudarStatus(p: Peticao, novo: StatusPeticao) {
    const patch: Partial<Peticao> = { status: novo };
    if (novo === "Protocolada" && !p.dataProtocolo) {
      patch.dataProtocolo = new Date().toISOString();
    }
    updatePeticao(p.id, patch);
    toast.success(`Status: ${novo}`);
  }

  function excluir(p: Peticao) {
    if (confirm(`Excluir petição de ${p.autor} x ${p.reu}?`)) {
      deletePeticao(p.id);
      toast.success("Excluída");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Petições
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o fluxo das suas petições — desde o cadastro até o protocolo.
          </p>
        </div>
        <Button onClick={abrirNovo} className="bg-[#c2714f] hover:bg-[#a85e3f]">
          <Plus size={18} className="mr-1" />
          Nova petição
        </Button>
      </div>

      {/* Filtros por status — "A fazer" primeiro, "Todas" no final */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_PETICAO.map((s) => {
          const style = STATUS_STYLE[s];
          const ativo = filtroStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all inline-flex items-center gap-1.5",
                ativo
                  ? `${style.bg} ${style.text} border-current`
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {style.icon}
              {s} ({contagem[s] || 0})
            </button>
          );
        })}
        <button
          onClick={() => setFiltroStatus("todos")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            filtroStatus === "todos"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          )}
        >
          Todas ({contagem.todos})
        </button>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por autor, réu, juizado, processo ou observação…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista */}
      {itens.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Clock className="mx-auto mb-3 opacity-40" size={40} />
          <p className="text-sm">
            {peticoes.length === 0
              ? "Nenhuma petição cadastrada ainda. Clique em \"Nova petição\" pra começar."
              : "Nenhuma petição encontrada com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {itens.map((p) => {
            const style = STATUS_STYLE[p.status];
            return (
              <div
                key={p.id}
                className={cn(
                  "bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                          style.bg,
                          style.text
                        )}
                      >
                        {style.icon}
                        {style.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                        {p.tipo}
                      </span>
                      {p.numeroProcesso && (
                        <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                          {p.numeroProcesso}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      {p.autor} <span className="text-slate-400 font-normal">×</span> {p.reu}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                      {p.juizado && (
                        <span>
                          <span className="text-slate-400">Juizado:</span> {p.juizado}
                        </span>
                      )}
                      <span>
                        <span className="text-slate-400">Cadastro:</span> {formatarDataHora(p.dataCadastro)}
                      </span>
                      {p.prazo && (
                        <span>
                          <span className="text-slate-400">Prazo:</span> {formatarDataBr(p.prazo)}
                        </span>
                      )}
                      {p.dataProtocolo && (
                        <span>
                          <span className="text-slate-400">Protocolada em:</span> {formatarDataHora(p.dataProtocolo)}
                        </span>
                      )}
                    </div>

                    {p.observacoes && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-md p-2 whitespace-pre-wrap">
                        {p.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-1 shrink-0">
                    <Select
                      value={p.status}
                      onValueChange={(v) => mudarStatus(p, v as StatusPeticao)}
                    >
                      <SelectTrigger className="h-8 w-[160px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_PETICAO.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => abrirEditar(p)}
                      className="p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => excluir(p)}
                      className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar petição" : "Nova petição"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label>Autor *</Label>
                <Input
                  value={form.autor}
                  onChange={(e) => setForm({ ...form, autor: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label>Réu *</Label>
                <Input
                  value={form.reu}
                  onChange={(e) => setForm({ ...form, reu: e.target.value })}
                  placeholder="Parte contrária"
                />
              </div>
            </div>

            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as TipoPeticao })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PETICAO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StatusPeticao })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_PETICAO.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Juizado (onde deve cair a ação)</Label>
              <Select value={form.juizado} onValueChange={(v) => setForm({ ...form, juizado: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o juizado" />
                </SelectTrigger>
                <SelectContent>
                  {JUIZADOS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Número do processo</Label>
              <Input
                value={form.numeroProcesso}
                onChange={(e) => setForm({ ...form, numeroProcesso: e.target.value })}
                placeholder="Ex: 0820013-72.2025"
              />
            </div>

            <div>
              <Label>Data e hora de cadastro</Label>
              <Input
                type="datetime-local"
                value={form.dataCadastro}
                onChange={(e) => setForm({ ...form, dataCadastro: e.target.value })}
              />
            </div>

            <div>
              <Label>Prazo (opcional)</Label>
              <Input
                type="date"
                value={form.prazo}
                onChange={(e) => setForm({ ...form, prazo: e.target.value })}
              />
            </div>

            {(form.status === "Protocolada" || form.dataProtocolo) && (
              <div className="col-span-2">
                <Label>Data e hora do protocolo</Label>
                <Input
                  type="datetime-local"
                  value={form.dataProtocolo}
                  onChange={(e) => setForm({ ...form, dataProtocolo: e.target.value })}
                  placeholder="Preenchido automaticamente ao marcar como Protocolada"
                />
              </div>
            )}

            <div className="col-span-2">
              <Label>Observações / Expectativa de acordo viável</Label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Ex: Expectativa de acordo entre R$ 3.000 e R$ 5.000. Cliente aceita proposta a partir de R$ 2.500..."
                rows={4}
                className="w-full mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2714f]/40"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} className="bg-[#c2714f] hover:bg-[#a85e3f]">
              {editandoId ? "Salvar alterações" : "Adicionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
