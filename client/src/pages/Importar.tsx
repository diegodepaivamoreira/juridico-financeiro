/**
 * JurisFinance — Importar Lançamentos em massa
 * Cola o texto no formato natural, revisa numa tabela editável e cadastra tudo de uma vez.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import {
  BANCOS,
  BancoLancamento,
  MESES,
  TIPOS,
  TipoLancamento,
  TipoRegistro,
  formatarMoeda,
} from "@/lib/store";
import { CheckCircle2, ClipboardPaste, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LinhaImport {
  data: string; // ISO
  autor1: string;
  reu1: string;
  reu2: string;
  tipo: TipoLancamento;
  valor: string;
  banco: BancoLancamento | "";
  tipoRegistro: TipoRegistro;
  observacoes: string;
}

const EXEMPLO = `01/07/26 - 1.300,00 - Iara X Rio + e Fab (PICPAY)
09/07/26 - 300,00 - CEMF Atrasados (DINHEIRO)
09/07/26 - 316,18 - Patrick x Nestlé (SANTANDER)`;

// Normaliza texto (sem acento, minúsculo) para comparação
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function acharBanco(txt: string): BancoLancamento | "" {
  const n = norm(txt);
  for (const b of BANCOS) {
    if (norm(b) === n) return b;
  }
  // correspondências parciais comuns
  if (n.includes("picpay")) return "PicPay";
  if (n.includes("dinheiro") || n.includes("especie") || n.includes("espécie")) return "Dinheiro";
  if (n.includes("mercado")) return "Mercado Pago";
  if (n.includes("santander")) return "Santander";
  if (n.includes("itau")) return "Itaú";
  if (n.includes("nubank") || n === "nu") return "Nubank";
  if (n.includes("wise")) return "Wise";
  if (n.includes("caixa") || n.includes("cef")) return "Caixa Econômica Federal";
  return "";
}

function parseData(txt: string): string {
  // aceita dd/mm/aa, dd/mm/aaaa
  const m = txt.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return "";
  const dia = m[1].padStart(2, "0");
  const mes = m[2].padStart(2, "0");
  let ano = m[3];
  if (ano.length === 2) ano = "20" + ano;
  return `${ano}-${mes}-${dia}`;
}

function parseValor(txt: string): string {
  // "1.300,00" -> "1300.00"
  const limpo = txt.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(limpo);
  return isNaN(num) ? "" : String(num);
}

function parseLinha(linha: string): LinhaImport | null {
  if (!linha.trim()) return null;

  // extrai o banco entre parênteses no fim
  let banco: BancoLancamento | "" = "";
  const bancoMatch = linha.match(/\(([^)]+)\)\s*$/);
  let resto = linha;
  if (bancoMatch) {
    banco = acharBanco(bancoMatch[1]);
    resto = linha.slice(0, bancoMatch.index).trim();
  }

  // separa por " - " (com espaços)
  const partes = resto.split(/\s+-\s+/);
  if (partes.length < 2) return null;

  const data = parseData(partes[0]);
  const valor = parseValor(partes[1]);
  const descricao = partes.slice(2).join(" - ").trim();

  // tenta separar autor X réu
  let autor1 = descricao;
  let reu1 = "";
  let reu2 = "";
  let tipo: TipoLancamento = "Acordo";
  let observacoes = "";

  const sep = descricao.split(/\s+[xX]\s+/);
  if (sep.length >= 2) {
    autor1 = sep[0].trim();
    const reuParte = sep.slice(1).join(" x ").trim();
    // réu 2 depois de " e "
    const reuSplit = reuParte.split(/\s+e\s+/);
    reu1 = reuSplit[0].trim();
    if (reuSplit.length > 1) reu2 = reuSplit.slice(1).join(" e ").trim();
  } else {
    // sem "x": provavelmente CEMF/FGTS/Outros
    reu1 = "Processo";
    tipo = "Outros";
    // separa possível observação (ex: "CEMF Atrasados" -> autor CEMF, obs Atrasados)
    const palavras = descricao.split(/\s+/);
    if (palavras.length > 1) {
      autor1 = palavras[0];
      observacoes = palavras.slice(1).join(" ");
    }
  }

  return {
    data,
    autor1,
    reu1,
    reu2,
    tipo,
    valor,
    banco,
    tipoRegistro: "Faturamento",
    observacoes,
  };
}

export default function Importar() {
  const { addLancamento } = useData();
  const [texto, setTexto] = useState("");
  const [linhas, setLinhas] = useState<LinhaImport[]>([]);

  function analisar() {
    const parsed = texto
      .split("\n")
      .map(parseLinha)
      .filter((l): l is LinhaImport => l !== null);
    if (parsed.length === 0) {
      toast.error("Nenhuma linha reconhecida. Confira o formato.");
      return;
    }
    setLinhas(parsed);
    toast.success(`${parsed.length} linha(s) reconhecida(s). Revise antes de cadastrar.`);
  }

  function atualizar(i: number, campo: keyof LinhaImport, valor: string) {
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? ({ ...l, [campo]: valor } as LinhaImport) : l)));
  }

  function remover(i: number) {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
  }

  function cadastrarTodos() {
    const invalidas = linhas.filter((l) => !l.data || !l.autor1 || !l.banco || !l.valor);
    if (invalidas.length > 0) {
      toast.error(`${invalidas.length} linha(s) com Data, Autor, Banco ou Valor faltando. Corrija antes.`);
      return;
    }
    let n = 0;
    linhas.forEach((l) => {
      const [y, m] = l.data.split("-").map(Number);
      addLancamento({
        data: l.data,
        autor1: l.autor1,
        reu1: l.reu1 || "Processo",
        reu2: l.reu2 || undefined,
        processo: "",
        tipo: l.tipo,
        valor: parseFloat(l.valor),
        banco: l.banco as BancoLancamento,
        mes: m,
        ano: y,
        tipoRegistro: l.tipoRegistro,
        observacoes: l.observacoes || undefined,
      });
      n++;
    });
    toast.success(`${n} lançamento(s) cadastrado(s) e sincronizando na nuvem!`);
    setLinhas([]);
    setTexto("");
  }

  const totalPreview = linhas.reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-semibold text-[#c2714f] uppercase tracking-widest mb-0.5">Ferramentas</p>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          Importar Lançamentos
        </h1>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Instruções + textarea */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Cole os lançamentos (um por linha)
          </h2>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Formato: <code className="bg-slate-100 px-1 rounded">data - valor - Autor x Réu (BANCO)</code>. Ex.:
          </p>
          <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 text-slate-600 overflow-x-auto">{EXEMPLO}</pre>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole aqui..."
            rows={7}
            className="w-full text-sm border border-slate-200 rounded-lg p-3 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#c2714f]/30"
          />
          <div className="flex justify-end mt-3">
            <Button onClick={analisar} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
              <ClipboardPaste size={16} />
              Analisar
            </Button>
          </div>
        </div>

        {/* Pré-visualização editável */}
        {linhas.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Fraunces', serif" }}>
                  Revisão — {linhas.length} lançamento(s)
                </h2>
                <p className="text-xs text-slate-400">Total: {formatarMoeda(totalPreview)}. Ajuste o que precisar antes de cadastrar.</p>
              </div>
              <Button onClick={cadastrarTodos} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 size={16} />
                Cadastrar todos
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <th className="text-left py-2 px-1">Data</th>
                    <th className="text-left py-2 px-1">Autor</th>
                    <th className="text-left py-2 px-1">Réu</th>
                    <th className="text-left py-2 px-1">Tipo</th>
                    <th className="text-left py-2 px-1">Valor</th>
                    <th className="text-left py-2 px-1">Banco</th>
                    <th className="text-left py-2 px-1">Registro</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-1.5 px-1">
                        <Input type="date" value={l.data} onChange={(e) => atualizar(i, "data", e.target.value)} className="h-8 text-xs w-36" />
                      </td>
                      <td className="py-1.5 px-1">
                        <Input value={l.autor1} onChange={(e) => atualizar(i, "autor1", e.target.value)} className="h-8 text-xs min-w-28" />
                      </td>
                      <td className="py-1.5 px-1">
                        <Input value={l.reu1} onChange={(e) => atualizar(i, "reu1", e.target.value)} className="h-8 text-xs min-w-24" />
                      </td>
                      <td className="py-1.5 px-1">
                        <Select value={l.tipo} onValueChange={(v) => atualizar(i, "tipo", v)}>
                          <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1.5 px-1">
                        <Input value={l.valor} onChange={(e) => atualizar(i, "valor", e.target.value)} className="h-8 text-xs w-24" />
                      </td>
                      <td className="py-1.5 px-1">
                        <Select value={l.banco} onValueChange={(v) => atualizar(i, "banco", v)}>
                          <SelectTrigger className={`h-8 text-xs w-40 ${!l.banco ? "border-red-300" : ""}`}><SelectValue placeholder="Escolher" /></SelectTrigger>
                          <SelectContent>
                            {BANCOS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1.5 px-1">
                        <Select value={l.tipoRegistro} onValueChange={(v) => atualizar(i, "tipoRegistro", v)}>
                          <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Faturamento">Faturamento</SelectItem>
                            <SelectItem value="Pessoal">Pessoal</SelectItem>
                            <SelectItem value="Apostila">Apostila</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1.5 px-1">
                        <button onClick={() => remover(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
