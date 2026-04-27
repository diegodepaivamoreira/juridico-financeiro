/**
 * JurisFinance — Store de Dados
 * Design: Escritório Jurídico Contemporâneo
 * Paleta: off-white + slate + terracota
 *
 * Armazena todos os lançamentos no localStorage com tipagem forte.
 */

export type TipoLancamento = "Acordo" | "Sucumbência" | "Sentença Principal" | "Multas e Diferenças" | "Execução" | "Consulta" | "Procuração" | "Salário" | "Outros";
export type BancoLancamento = "Santander" | "Itaú" | "Nubank" | "Mercado Pago" | "Wise" | "PicPay" | "Caixa Econômica Federal";
export type StatusReceber = "Pendente" | "Recebido";
export type TipoRegistro = "Faturamento" | "Pessoal" | "Apostila"; // Novo: Faturamento (conta nas métricas), Pessoal (não conta), Apostila (organização)

export const TIPOS: TipoLancamento[] = ["Acordo", "Sucumbência", "Sentença Principal", "Multas e Diferenças", "Execução", "Consulta", "Procuração", "Salário", "Outros"];
export const BANCOS: BancoLancamento[] = ["Santander", "Itaú", "Nubank", "Mercado Pago", "Wise", "PicPay", "Caixa Econômica Federal"];
export const REUS_PADRAO = ["Itaú", "Claro", "Rio+", "Pagseguro", "Ebazar", "TIM", "Buser", "Doctorália", "FGTS", "L. Comp."];
export const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const LIMITE_BANCO = 5000; // Limite MENSAL por banco

export interface Lancamento {
  id: string;
  data: string; // ISO date string
  autor1: string; // Primeiro autor (obrigatório)
  autor2?: string; // Segundo autor (opcional)
  reu1: string; // Primeiro réu (obrigatório)
  reu2?: string; // Segundo réu (opcional)
  reu3?: string; // Terceiro réu (opcional)
  processo: string;
  tipo: TipoLancamento;
  valor: number;
  banco: BancoLancamento;
  mes: number; // 1-12
  ano: number;
  tipoRegistro: TipoRegistro; // Novo: define se conta nas métricas
  observacoes?: string; // Novo: notas sobre o lançamento
  // Campos legados para compatibilidade
  cliente?: string;
  reu?: string;
}

export interface ItemAReceber {
  id: string;
  autor1: string; // Primeiro autor (obrigatório)
  autor2?: string; // Segundo autor (opcional)
  reu1: string; // Primeiro réu (obrigatório)
  reu2?: string; // Segundo réu (opcional)
  reu3?: string; // Terceiro réu (opcional)
  tipo: string;
  valor: number | null;
  status: StatusReceber;
  dataVencimento?: string; // Data de vencimento para alertas
  tipoRegistro?: TipoRegistro; // Novo: define se conta nas métricas
  observacoes?: string; // Novo: notas
  // Campos legados para compatibilidade
  cliente?: string;
  reu?: string;
}

export interface AppData {
  lancamentos: Lancamento[];
  aReceber: ItemAReceber[];
  anoAtivo: number;
  metas?: Record<string, number>;
  apostilas?: { id: string; data: string; descricao: string; valor: number; quantidade: number }[]; // Novo: controle de vendas de apostilas
}

const STORAGE_KEY = "jurisfinance_data";

function gerarId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

const DADOS_INICIAIS: AppData = {
  anoAtivo: 2026,
  lancamentos: [
    // JANEIRO 2026
    { id: gerarId(), data: "2026-01-07", autor1: "Logan", reu1: "Loggi", processo: "", tipo: "Acordo", valor: 94.65, banco: "Santander", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-02", autor1: "Inaya", reu1: "Nubank", processo: "", tipo: "Acordo", valor: 1050.00, banco: "Itaú", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-02", autor1: "Calvan", reu1: "Processo", processo: "", tipo: "Acordo", valor: 1000.00, banco: "Santander", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-19", autor1: "Hon. Suc. Adiliana", reu1: "Processo", processo: "", tipo: "Sucumbência", valor: 1019.48, banco: "Itaú", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-16", autor1: "Patrick", reu1: "COMF", processo: "", tipo: "Acordo", valor: 1211.45, banco: "Itaú", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-26", autor1: "Digo", reu1: "ML", processo: "", tipo: "Acordo", valor: 1684.24, banco: "Wise", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-01-26", autor1: "Adeilson", reu1: "Processo", processo: "", tipo: "Acordo", valor: 700.00, banco: "Mercado Pago", mes: 1, ano: 2026, tipoRegistro: "Faturamento" },
    // FEVEREIRO 2026
    { id: gerarId(), data: "2026-02-03", autor1: "Helainy", reu1: "Rio+", processo: "", tipo: "Acordo", valor: 2670.00, banco: "Wise", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-02", autor1: "Manuela", reu1: "99", processo: "", tipo: "Acordo", valor: 220.00, banco: "Nubank", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-05", autor1: "Flávio", reu1: "Puma", processo: "", tipo: "Acordo", valor: 500.00, banco: "Wise", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-08", autor1: "Caulan", reu1: "Processo", processo: "", tipo: "Acordo", valor: 1000.00, banco: "Itaú", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-01", autor1: "Luiza", reu1: "COMF", processo: "", tipo: "Acordo", valor: 1655.27, banco: "Santander", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-13", autor1: "Juliaux", reu1: "Itaú", processo: "", tipo: "Acordo", valor: 1300.00, banco: "Itaú", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-23", autor1: "Hagalix", reu1: "Light", processo: "", tipo: "Acordo", valor: 2162.00, banco: "Wise", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-02-30", autor1: "Obs.", reu1: "Processo", processo: "", tipo: "Outros", valor: 280.00, banco: "Santander", mes: 2, ano: 2026, tipoRegistro: "Faturamento" },
    // MARçO 2026
    { id: gerarId(), data: "2026-03-01", autor1: "Iara", reu1: "Rio+", processo: "0820013-72.2025", tipo: "Acordo", valor: 1770, banco: "Mercado Pago", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-02", autor1: "Adriana", autor2: "Vilma", reu1: "Pagseguro", processo: "", tipo: "Acordo", valor: 700, banco: "Santander", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-04", autor1: "Diego", reu1: "Ebazar", processo: "", tipo: "Acordo", valor: 2091.10, banco: "Mercado Pago", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-09", autor1: "Andreia", reu1: "L. Comp.", processo: "", tipo: "Sucumbência", valor: 1615.20, banco: "Itaú", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-09", autor1: "Andreia", reu1: "L. Comp.", processo: "", tipo: "Acordo", valor: 2422.78, banco: "Itaú", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-10", autor1: "Pedro", reu1: "Ebazar", processo: "", tipo: "Acordo", valor: 823.74, banco: "Wise", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-03-11", autor1: "CEMF", reu1: "Processo", processo: "", tipo: "Outros", valor: 928, banco: "Santander", mes: 3, ano: 2026, tipoRegistro: "Faturamento" },
    // ABRIL 2026
    { id: gerarId(), data: "2026-04-01", autor1: "Empresa", reu1: "FGTS", processo: "", tipo: "Outros", valor: 1383.20, banco: "Santander", mes: 4, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-04-01", autor1: "Jhonata", reu1: "TIM", processo: "", tipo: "Acordo", valor: 1340, banco: "Nubank", mes: 4, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-04-02", autor1: "Gabriel", reu1: "Itaú", processo: "", tipo: "Acordo", valor: 1200, banco: "Mercado Pago", mes: 4, ano: 2026, tipoRegistro: "Faturamento" },
    { id: gerarId(), data: "2026-04-02", autor1: "Magali", reu1: "Claro", processo: "", tipo: "Acordo", valor: 848.32, banco: "Santander", mes: 4, ano: 2026, tipoRegistro: "Faturamento" },
  ],
  aReceber: [
    { id: gerarId(), autor1: "Pastor Themis", reu1: "Processo", tipo: "Venda", valor: 1000, status: "Pendente", tipoRegistro: "Pessoal", observacoes: "Venda de iPhone em 3 parcelas de R$ 1.000 - Não é faturamento" },
    { id: gerarId(), autor1: "Stephanie", reu1: "Buser", tipo: "Acordo", valor: 800, status: "Pendente", tipoRegistro: "Faturamento" },
    { id: gerarId(), autor1: "Jackson", reu1: "Buser", tipo: "Acordo", valor: 800, status: "Pendente", tipoRegistro: "Faturamento" },
    { id: gerarId(), autor1: "Helainy", reu1: "Rio+", tipo: "Multa", valor: 680, status: "Pendente", tipoRegistro: "Faturamento" },
    { id: gerarId(), autor1: "Helainy", reu1: "Processo", tipo: "Procuração", valor: 400, status: "Pendente", tipoRegistro: "Faturamento" },
    { id: gerarId(), autor1: "Dr. Alexandre", reu1: "Processo", tipo: "Consulta", valor: 300, status: "Pendente", tipoRegistro: "Faturamento" },
    { id: gerarId(), autor1: "Flávio", reu1: "Doctoralía", tipo: "Acordo", valor: null, status: "Pendente", tipoRegistro: "Faturamento" },
  ],
  apostilas: [],
};

export function carregarDados(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      // Garantir compatibilidade com dados antigos (adicionar tipoRegistro se falta)
      if (parsed.lancamentos) {
        parsed.lancamentos = parsed.lancamentos.map((l) => ({
          ...l,
          tipoRegistro: l.tipoRegistro || "Faturamento",
        }));
      }
      // Garantir que dados iniciais estejam presentes se vazio
      if (!parsed.lancamentos || parsed.lancamentos.length === 0) {
        return DADOS_INICIAIS;
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return DADOS_INICIAIS;
}

export function salvarDados(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Função para resetar dados aos iniciais
export function resetarDados(): void {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string): string {
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export function receitaMes(lancamentos: Lancamento[], mes: number, ano: number): number {
  return lancamentos
    .filter((l) => l.mes === mes && l.ano === ano)
    .reduce((sum, l) => sum + l.valor, 0);
}

export function receitaPorBanco(lancamentos: Lancamento[], mes: number, ano: number): Record<BancoLancamento, number> {
  const result: Record<BancoLancamento, number> = {
    Santander: 0,
    Itaú: 0,
    Nubank: 0,
    "Mercado Pago": 0,
    Wise: 0,
    PicPay: 0,
    "Caixa Econômica Federal": 0,
  };
  lancamentos
    .filter((l) => l.mes === mes && l.ano === ano)
    .forEach((l) => {
      result[l.banco] += l.valor;
    });
  return result;
}

export function rankingReus(lancamentos: Lancamento[], ano: number): { reu: string; total: number }[] {
  const map: Record<string, number> = {};
  lancamentos
    .filter((l) => l.ano === ano && l.reu1)
    .forEach((l) => {
      const reu = l.reu1 || "";
      map[reu] = (map[reu] || 0) + l.valor;
    });
  return Object.entries(map)
    .map(([reu, total]) => ({ reu, total }))
    .sort((a, b) => b.total - a.total);
}

export function rankingClientes(lancamentos: Lancamento[], ano: number): { cliente: string; total: number }[] {
  const map: Record<string, number> = {};
  lancamentos
    .filter((l) => l.ano === ano && l.autor1)
    .forEach((l) => {
      const cliente = l.autor1 || "";
      map[cliente] = (map[cliente] || 0) + l.valor;
    });
  return Object.entries(map)
    .map(([cliente, total]) => ({ cliente, total }))
    .sort((a, b) => b.total - a.total);
}

export function projecaoMensal(lancamentos: Lancamento[], ano: number): number {
  const mesesComDados = MESES.map((_, i) => receitaMes(lancamentos, i + 1, ano)).filter((v) => v > 0);
  if (mesesComDados.length === 0) return 0;
  return mesesComDados.reduce((s, v) => s + v, 0) / mesesComDados.length;
}

export function statusBanco(valor: number): "OK" | "ALERTA" | "LIMITE" {
  if (valor >= LIMITE_BANCO) return "LIMITE";
  if (valor >= LIMITE_BANCO * 0.8) return "ALERTA";
  return "OK";
}

export function receitaAnual(lancamentos: Lancamento[], ano: number): number {
  return lancamentos.filter((l) => l.ano === ano).reduce((s, l) => s + l.valor, 0);
}

export function receitaPorTipo(lancamentos: Lancamento[], ano: number): Record<string, number> {
  const result: Record<string, number> = {};
  lancamentos
    .filter((l) => l.ano === ano)
    .forEach((l) => {
      result[l.tipo] = (result[l.tipo] || 0) + l.valor;
    });
  return result;
}
