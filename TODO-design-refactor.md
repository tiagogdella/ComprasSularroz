# TODO — Refatoração visual (design system em `layout/standalone/`)

TODO satélite, separado do `TODO.md` principal. Não mexe na ordem/roadmap de features —
só acompanha a aplicação do design system definido nos mockups em `layout/standalone/`
sobre as telas que já existem (e serve de checklist pras telas futuras quando chegar a vez delas).

Marque cada item com `[x]` conforme for concluindo. Pode ser feito aos poucos, sem pressa de terminar num dia só.

Mockups fonte: `layout/standalone/*.html` (são bundles auto-extraíveis — o HTML real está
em JSON escapado dentro de `<script type="__bundler/template">`; decodificar essa linha com
`json.loads()` pra ler o conteúdo).

---

## Base do tema (fundação — fazer antes do resto)

- [x] Adicionar fontes IBM Plex Sans (UI) e IBM Plex Mono (números/valores/códigos), via Google Fonts ou `@fontsource`
- [x] Montar o objeto `themeOverrides` do Naive UI com os tokens do Design System e aplicar via `n-config-provider` em `App.vue`
- [x] Limpar o `style.css` (hoje é sobra do scaffold padrão do Vite/Vue — roxo, hero, `#next-steps` etc., nada disso é usado)

## Layout base — `AppLayout.vue`

- [x] Sidebar escura (`#12233F`), 216px, nome do app no topo, itens de menu com ícone outline (stroke, sem preenchimento)
- [x] Realce do item ativo: fundo translúcido branco + borda esquerda âmbar (`#C2740A`)
- [x] Header branco de 56px: título da página à esquerda, nome do usuário + botão "Sair" à direita

## Login — `LoginView.vue`

- [ ] Split screen: painel escuro (38% da largura) à esquerda com branding + tagline, formulário sem card à direita
- [ ] Inputs e botão seguindo o estilo do Design System (bordas, radius 6px, cores dos tokens)

## Home — `HomeView.vue`

- [ ] Mensagem de boas-vindas ("Bem-vindo, {nome}") + 3 cards de atalho (Nova compra / Consultar peça / Ver histórico)

## Nova Compra — `PurchaseFormView.vue` (maior mudança)

- [ ] Seção "Dados da nota" em card: grid de 3 colunas (fornecedor, número da nota, data de emissão)
- [ ] Linha com chave de acesso opcional + toggle Manual / Código de barras
- [ ] Seção "Itens da compra": tabela editável (produto, categoria, quantidade, valor unitário, total em mono) com adicionar/remover linha
- [ ] Total da nota em destaque (mono, alinhado à direita)
- [ ] Barra de ações fixa no rodapé (Cancelar / Salvar compra)

## Telas futuras (alinhar ao design quando forem criadas — não é urgente agora)

- [x] Histórico de Compras: barra de filtros (data de/até, fornecedor, categoria, produto) + tabela (feita direto no design, junto com o Dia 21 do TODO principal)
- [ ] Consulta por Produto: campo de busca grande + lista de resultados à esquerda + painel de detalhe (métricas + histórico) à direita
- [ ] Dashboard de Gastos: cards KPI (mês atual, ano atual) + gráfico de barras dos últimos 12 meses + gasto por categoria + top 5 fornecedores

---

## Referência rápida de tokens

- Primária (steel-blue): `#1E4B8C` / hover `#2A5FA8` / pressed `#153A6E` / soft bg `#EAF1FA`
- Acento âmbar (só aviso/destaque): `#C2740A`, soft bg `#FDF1E2`
- Sucesso `#15803D` · Erro `#B91C1C`
- Sidebar `#12233F` · Fundo de página `#F7F9FB`
- Neutros: `#0F172A` / `#334155` / `#64748B` / `#CBD5E1` / borda `#E2E8F0`
- Tokens completos + objeto `themeOverrides` pronto: `layout/standalone/Design System (standalone).html`
