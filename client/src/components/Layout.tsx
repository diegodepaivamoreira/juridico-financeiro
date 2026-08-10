/**
 * JurisFinance — Layout Principal
 * Design: Escritório Jurídico Contemporâneo
 * Sidebar clara com navegação limpa, tipografia Fraunces + DM Sans
 * Acento terracota (#c2714f), slate (#475569), off-white (#f8f7f4)
 */
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useData } from "@/contexts/DataContext";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  CloudOff,
  Download,
  FileText,
  Filter,
  History,
  LayoutDashboard,
  LogOut,
  Scale,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} />, group: "principal" },
  { href: "/lancamentos", label: "Lançamentos", icon: <BookOpen size={18} />, group: "principal" },
  { href: "/a-receber", label: "A Receber", icon: <Clock size={18} />, group: "principal" },
  { href: "/peticoes", label: "Petições", icon: <FileText size={18} />, group: "principal" },
  { href: "/anual", label: "Visão Anual", icon: <Calendar size={18} />, group: "analise" },
  { href: "/ranking", label: "Ranking", icon: <TrendingUp size={18} />, group: "analise" },
  { href: "/relatorio", label: "Relatório", icon: <BarChart3 size={18} />, group: "analise" },
  { href: "/filtros", label: "Filtros e Metas", icon: <Filter size={18} />, group: "analise" },
  { href: "/historico", label: "Histórico", icon: <History size={18} />, group: "ferramentas" },
  { href: "/importar", label: "Importar", icon: <Upload size={18} />, group: "ferramentas" },
  { href: "/exportar", label: "Exportar", icon: <Download size={18} />, group: "ferramentas" },
];

const GROUP_LABELS: Record<string, string> = {
  principal: "Principal",
  analise: "Análise",
  ferramentas: "Ferramentas",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { syncing, offline } = useData();

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));

  return (
    <div className="flex h-screen bg-[#f8f7f4] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-slate-100", collapsed && "justify-center px-2")}>
          <div className="w-8 h-8 rounded-lg bg-[#c2714f] flex items-center justify-center shrink-0">
            <Scale size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                JurisFinance
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Gestão Jurídica</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
            return (
              <div key={group} className="mb-4">
                {!collapsed && (
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">
                    {GROUP_LABELS[group!] || group}
                  </p>
                )}
                {items.map((item) => {
                  const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5 transition-all cursor-pointer",
                          active
                            ? "bg-[#c2714f]/10 text-[#c2714f] font-medium"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                          collapsed && "justify-center"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className={cn("shrink-0", active ? "text-[#c2714f]" : "text-slate-400")}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="text-sm truncate">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sync status + logout + collapse */}
        <div className="p-2 border-t border-slate-100 space-y-1">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 text-[11px]",
              offline ? "text-amber-500" : "text-slate-400",
              collapsed && "justify-center"
            )}
            title={offline ? "Offline — dados salvos neste dispositivo" : syncing ? "Salvando na nuvem…" : "Sincronizado com a nuvem"}
          >
            {offline ? (
              <CloudOff size={14} className="text-amber-500" />
            ) : syncing ? (
              <Cloud size={14} className="animate-pulse" />
            ) : (
              <Check size={14} className="text-emerald-500" />
            )}
            {!collapsed && <span>{offline ? "Offline (local)" : syncing ? "Salvando…" : "Sincronizado"}</span>}
          </div>
          <button
            onClick={() => (offline ? window.location.reload() : supabase.auth.signOut())}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all",
              collapsed && "justify-center"
            )}
            title={offline ? "Voltar para o login (tentar nuvem)" : "Sair"}
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-xs">{offline ? "Entrar na nuvem" : "Sair"}</span>}
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
