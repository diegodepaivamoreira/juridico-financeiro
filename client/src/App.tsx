import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AuthGate from "./components/AuthGate";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AReceber from "./pages/AReceber";
import Anual from "./pages/Anual";
import Dashboard from "./pages/Dashboard";
import Exportar from "./pages/Exportar";
import Filtros from "./pages/Filtros";
import Historico from "./pages/Historico";
import Lancamentos from "./pages/Lancamentos";
import Ranking from "./pages/Ranking";
import Relatorio from "./pages/Relatorio";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/lancamentos" component={Lancamentos} />
        <Route path="/a-receber" component={AReceber} />
        <Route path="/anual" component={Anual} />
        <Route path="/ranking" component={Ranking} />
        <Route path="/relatorio" component={Relatorio} />
        <Route path="/filtros" component={Filtros} />
        <Route path="/historico" component={Historico} />
        <Route path="/exportar" component={Exportar} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Toaster position="top-right" />
        <AuthGate>
          {(session) => (
            <DataProvider session={session}>
              <TooltipProvider>
                <Router />
              </TooltipProvider>
            </DataProvider>
          )}
        </AuthGate>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
