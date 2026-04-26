# JurisFinance — Guia de Instalação

## 📱 Opção 1: PWA (Instalação no Navegador) — RECOMENDADO PARA COMEÇAR

A forma mais rápida e fácil de usar. Funciona como um app nativo no Windows 11, sem instalador.

### Passos:

1. **Abra o navegador** (Chrome, Edge ou Firefox)
2. **Acesse:** https://juridico-financeiro.manus.space (ou o link fornecido)
3. **Clique no ícone de instalação** na barra de endereço (canto superior direito)
   - Chrome/Edge: Ícone de "Instalar" ou "Adicionar à área de trabalho"
   - Firefox: Clique em "Instalar aplicativo"
4. **Confirme a instalação**
5. Pronto! Um atalho aparecerá na área de trabalho e no menu Iniciar

### Vantagens:
- ✅ Funciona offline (dados salvos localmente)
- ✅ Sem instalador, sem dependências
- ✅ Sempre atualizado automaticamente
- ✅ Dados persistem entre sessões
- ✅ Funciona em Windows, Mac, Linux

### Como usar:
- Abra como um app normal (clique no atalho da área de trabalho)
- Todos os dados ficam salvos no navegador (localStorage)
- Exporte para Excel/PDF quando precisar

---

## 🖥️ Opção 2: Electron (.exe Instalável) — PARA PRODUÇÃO

Versão standalone que funciona sem navegador. Ideal se você quer um executável tradicional.

### Requisitos:
- Windows 11 (64-bit)
- ~300 MB de espaço em disco

### Instalação:

1. **Baixe o arquivo:** `JurisFinance-Setup.exe`
2. **Execute o instalador**
3. **Siga os passos** (próximo, próximo, instalar)
4. **Pronto!** O app abrirá automaticamente

### Vantagens:
- ✅ Executável tradicional (.exe)
- ✅ Funciona sem navegador
- ✅ Integração nativa com Windows
- ✅ Atalho no menu Iniciar
- ✅ Desinstalação via Painel de Controle

### Como usar:
- Clique no atalho "JurisFinance" no menu Iniciar ou área de trabalho
- Todos os dados ficam salvos localmente
- Exporte para Excel/PDF quando precisar

---

## 🔄 Sincronização entre PWA e Electron

**Importante:** PWA e Electron armazenam dados em locais diferentes. Se você usar ambas:

- **PWA:** Dados no navegador (localStorage)
- **Electron:** Dados no app (banco de dados local)

**Recomendação:** Escolha uma e use consistentemente. Se precisar mudar:
1. Exporte seus dados em Excel (via "Exportar")
2. Importe em outra versão (copie os dados manualmente ou use a importação)

---

## 📊 Recursos Principais

- ✅ **Dashboard** com gráficos interativos
- ✅ **Lançamentos mensais** (Jan–Dez) com validação
- ✅ **A Receber** com controle de status
- ✅ **Visão Anual** com planilha consolidada
- ✅ **Ranking** de réus e clientes
- ✅ **Relatório anual** com projeção
- ✅ **Exportação Excel** (14 abas vinculadas)
- ✅ **Relatório PDF** para impressão
- ✅ **Limite de banco mensal** com alertas

---

## 🆘 Troubleshooting

### PWA não instala?
- Tente outro navegador (Chrome é mais confiável)
- Limpe o cache do navegador
- Verifique se o ícone de instalação aparece na barra de endereço

### Dados não aparecem?
- Verifique se está no mesmo navegador/app
- Limpe o cache (Ctrl+Shift+Delete)
- Recarregue a página (F5)

### Electron não abre?
- Desinstale e reinstale
- Verifique se tem permissões de administrador
- Verifique espaço em disco

---

## 💾 Backup de Dados

Recomendamos exportar seus dados regularmente:

1. Vá para **"Exportar"**
2. Clique em **"Baixar Excel"**
3. Salve o arquivo em local seguro

Assim você tem um backup em Excel que pode restaurar depois.

---

## 📞 Suporte

Se tiver dúvidas ou problemas, entre em contato com o desenvolvedor.

---

**Versão:** 1.0.0  
**Data:** Abril 2026  
**Desenvolvido para:** Gestão Financeira Jurídica
