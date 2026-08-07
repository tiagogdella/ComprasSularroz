# TODO — Sistema de Controle de Compras de Manutenção

Plano de trabalho dividido em fases semanais, com tarefas de ~1-2h cada, em ordem de execução.
Prioridade: lançamento manual funcionando bem primeiro (MVP), leitor de código de barras + consulta via certificado digital depois.

Marque cada item com `[x]` conforme for concluindo.

---

## Fase 0 — Preparação (antes de codar)

- [x] Confirmar que Docker e Docker Compose estão disponíveis no ambiente onde você vai desenvolver (pode ser sua máquina local, não precisa ser o servidor Ubuntu ainda)
- [x] Instalar Node.js LTS e escolher gerenciador de pacotes (npm é suficiente, sem necessidade de pnpm/yarn)
- [ ] Instalar um cliente de banco (DBeaver, TablePlus ou psql) pra inspecionar o Postgres durante o desenvolvimento

---

## Semana 1 — Setup do repo e infraestrutura básica

### Dia 1
- [ ] Criar repositório git com estrutura de pastas `backend/`, `frontend/`, `docs/`
- [x] Criar `.gitignore` geral (node_modules, dist, .env, etc.)
- [x] Criar `docker-compose.yml` inicial só com o serviço `postgres` (imagem, porta, volume nomeado, variáveis de ambiente)
- [x] Criar `.env.example` na raiz com as variáveis do Postgres (usuário, senha, database, porta)
- [x] Subir `docker compose up -d` e validar a conexão com o Postgres usando o cliente de banco

### Dia 2
- [x] Iniciar projeto backend (`npm init`, TypeScript, `tsconfig.json`, pasta `src/`)
- [x] Instalar Express + dependências básicas (`cors`, `dotenv`, `morgan`)
- [x] Criar servidor "Hello World" com rota `GET /health`
- [x] Configurar scripts no `package.json` (`dev` com `tsx watch`, `build`, `start`)
- [x] Rodar local e confirmar que sobe sem erro

### Dia 3
- [x] Instalar Prisma no backend e rodar `npx prisma init`
- [x] Apontar `DATABASE_URL` do Prisma pro Postgres do `docker-compose`
- [x] Validar a conexão (`npx prisma db pull` ou uma migration vazia)
- [x] Organizar estrutura de pastas do backend (`src/routes`, `src/controllers`, `src/services`, `prisma/`)
- [x] Commit inicial (backend + docker-compose + .env.example)

---

## Semana 2 — Schema do banco + migrations + seed

### Dia 4
- [x] Modelar no `schema.prisma`: `Supplier`, `Product` (com campo `specification`, além de `name`, `category` e `unit`), `User` (nomes em inglês, conforme convenção adotada)
- [x] Definir enum `PurchaseEntryMethod` (`MANUAL`, `SCANNED`)
- [x] Rodar primeira migration: `npx prisma migrate dev --name init_supplier_product_user`

### Dia 5
- [x] Modelar `Purchase` (chave de acesso opcional, número da nota, data de emissão, fornecedor, valor total, forma de lançamento, usuário que lançou) e `PurchaseItem` (produto, quantidade, valor unitário, valor total, vínculo com a compra) — nomes em inglês
- [x] Rodar migration: `npx prisma migrate dev --name add_purchase_purchaseitem`
- [x] Adicionar índice único na chave de acesso da nota (`accessKey`) — índice único no CNPJ do fornecedor já foi feito no Dia 4

### Dia 6
- [x] Criar `prisma/seed.ts` com dados de exemplo: 4 fornecedores, 12 produtos variados, 1 usuário admin, 2 compras completas com itens
- [x] Configurar o script de seed (`seed` no `prisma.config.ts` via `migrations.seed` + `npm run seed` no `package.json`)
- [x] Rodar o seed e validar os dados no banco (contagem de linhas confirmada via psql)

### Dia 7 (revisão)
- [x] Revisar nomes de campos/tabelas e ajustar o que incomodar antes de acumular mais migrations em cima
- [x] Gerar um diagrama simples do schema (diagrama Mermaid em `docs/erd.md`, renderizado pelo GitHub)
- [x] Commit

---

## Semana 3 — API REST básica (CRUD)

### Dia 8
- [x] CRUD de `Supplier`: `GET /suppliers`, `GET /suppliers/:id`, `POST`, `PUT`, `DELETE` (testado ponta a ponta via curl)
- [x] Validação de entrada com `zod` no corpo das requisições de `Supplier`

### Dia 9
- [x] CRUD de `Product`: rotas + validação de entrada (testado ponta a ponta via curl)
- [x] Endpoint `GET /products?search=` pra alimentar autocomplete no formulário depois (busca parcial, sem diferenciar maiúscula/minúscula)

### Dia 10
- [x] `POST /purchases`: criar a compra junto com os itens numa escrita aninhada atômica do Prisma (testada a atomicidade: item inválido não deixa compra órfã)
- [x] Calcular o valor total da compra a partir da soma dos itens no backend (não confia em valor enviado do frontend)

### Dia 11
- [x] `GET /purchases`: listagem paginada com filtros (data, fornecedor, categoria), testada via curl
- [x] `GET /purchases/:id`: detalhe da compra com os itens, produto, fornecedor e usuário incluídos

### Dia 12
- [x] `PUT /purchases/:id` (substitui itens via escrita aninhada `deleteMany`+`create`) e `DELETE /purchases/:id` (`$transaction` explícito, já que apagar a compra exige apagar os itens antes por causa da FK `RESTRICT`)
- [x] Testada a API manualmente (Postman) e salva a collection em `docs/api-collection.postman_collection.json`

### Dia 13 (revisão)
- [x] Middleware central de tratamento de erros (`AppError` + mapeamento de códigos Prisma P2002/P2025/P2003), respostas padronizadas em JSON, sem vazar stack trace; testados os casos que antes davam 500 feio
- [x] Revisão geral e commit

---

## Semana 4 — Autenticação simples

### Dia 14
- [x] Adicionar `passwordHash` ao model `User` no schema (bcryptjs), rodar migration
- [x] `POST /auth/login`: validar usuário/senha (bcryptjs) e emitir JWT (testado com senha certa/errada e login inexistente)
- [x] Middleware de autenticação (`authenticate.ts`): valida o JWT no header `Authorization: Bearer <token>` (ainda não aplicado a nenhuma rota — isso é o Dia 15)

### Dia 15
- [x] Proteger rotas de escrita (`POST`/`PUT`/`DELETE`) com o middleware de autenticação (`GET` continua público)
- [x] Adicionar 3 usuários fixos ao seed (`admin`, `joao`, `maria`)
- [x] Testado login e acesso às rotas protegidas via Postman (sem token, token inválido, token válido, e `GET` público confirmado)

---

## Semana 5 — Frontend: lançamento manual de compra + histórico

### Dia 16
- [x] Criar projeto frontend com Vite + Vue 3 + TypeScript
- [x] Instalar Vue Router, Pinia, axios e Naive UI (decisão tomada — ver nota abaixo)
- [x] Organizar estrutura de pastas (`views/`, `components/`, `stores/`, `services/api`, `router/`)
- [x] Tela de login simples; guarda o JWT (Pinia + localStorage), testada ponta a ponta com o backend

### Dia 17
- [x] Layout base (header + menu lateral simples) com rotas aninhadas (`AppLayout` envolvendo as telas autenticadas)
- [x] Guarda de rotas (`router.beforeEach`, redireciona pro login se não autenticado, e pro home se já estiver logado); store de autenticação (Pinia) já tinha sido feito no Dia 16

### Dia 18
- [x] Formulário de lançamento manual: dados da nota (fornecedor, número, data de emissão, forma de lançamento)
- [x] Campo de fornecedor com autocomplete (busca client-side no `n-select filterable`; cadastro rápido via modal quando não existe)

### Dia 19
- [x] Seção de itens da compra: adicionar/remover linhas (produto, quantidade, valor unitário)
- [x] Campo de produto com autocomplete (buscar existente ou cadastrar rápido)
- [x] Cálculo automático do valor total por item e do total da nota

### Dia 20
- [x] Validações do formulário (campos obrigatórios, valores maiores que zero, pelo menos 1 item)
- [x] Integração com `POST /compras`, feedback visual de sucesso/erro
- [x] Testar o fluxo manual completo, do zero, ponta a ponta

### Dia 21
- [x] Tela de listagem/histórico de compras (tabela paginada)
- [x] Filtros por data, fornecedor, categoria **e produto** (autocomplete de produto nos filtros)
- [x] Tela de detalhe da compra, mostrando os itens (implementado como drawer lateral, sem sair da listagem)

---

## Semana 6 — Consulta por produto + dashboard de gastos

> Uso principal: buscar uma peça e ver rapidamente quando foi comprada, com quem e a especificação. Análise de gastos é secundária, mas vale ter as duas.

### Dia 22
- [x] Endpoint backend `GET /products/:id/history`: todas as ocorrências de compra daquele produto (data, fornecedor, valor unitário, quantidade, especificação, nota vinculada), testado via curl
- [x] Tela de consulta por produto: buscar a peça (autocomplete) e ver a lista/linha do tempo de todas as vezes que foi comprada, com fornecedor, data e valor — este é o uso do dia a dia, deixar rápido e direto

### Dia 23
- [x] Endpoint backend: total de gastos agregado por período (mês/ano)
- [x] Endpoint backend: total de gastos agregado por categoria e por fornecedor
- [x] Tela de dashboard: cards com totais (mês atual, ano atual)

### Dia 24
- [x] Gráfico de gastos por período e por categoria/fornecedor (top 5) — implementado com barras em CSS puro, sem biblioteca externa
- [x] Polish visual e revisão geral, com foco em deixar a busca por produto (Dia 22) rápida e visível no menu principal

**>>> Neste ponto o MVP com lançamento manual está funcional e é o marco principal do projeto. <<<**
**Tudo abaixo é a camada de leitor de código de barras + consulta via certificado digital, tratada como bônus.**

---

## Semana 7 — Leitor de código de barras/QR (captura e validação)

### Dia 25
- [ ] Estudar o formato da chave de acesso da NFC-e (44 dígitos) e o algoritmo do dígito verificador (módulo 11)
- [ ] Criar função utilitária de validação da chave de acesso no backend, com testes unitários simples

### Dia 26
- [ ] Criar campo de input dedicado no frontend para o leitor USB (recebe o texto digitado + Enter)
- [ ] Implementar parsing: extrair a chave de 44 dígitos tanto de texto puro quanto da URL do QR Code da SEFAZ-SC
- [ ] Validar a chave e dar feedback visual (válida/inválida) antes de qualquer chamada à API

---

## Semana 8 — Integração via certificado digital (NFe Distribuição DFe)

> Mudança de plano (decidida em 29/07/2026): em vez de raspar o HTML da consulta pública da SEFAZ-SC, usar o webservice oficial **NFe Distribuição DFe**, autenticado via mTLS com o certificado digital (e-CNPJ) da empresa. É um webservice nacional (não por UF) e retorna XML estruturado e assinado da nota em vez de HTML pra parsear — elimina o risco de captcha/instabilidade da consulta pública e a necessidade de tratar cada UF separadamente. Depende de confirmar com o contador se o certificado é A1 (arquivo) ou A3 (token físico) — se for A3, esta semana precisa ser replanejada (exigiria um agente rodando na máquina com o token).

### Dia 27
- [ ] Confirmar com o contador: certificado é A1 (`.pfx`/`.p12`) ou A3 (token físico)? É e-CNPJ da empresa (não e-CPF pessoal)? Qual a validade?
- [ ] Se A1: combinar uma forma segura de repassar o arquivo `.pfx` + senha (nunca por WhatsApp/e-mail em texto plano) e guardar fora do git (caminho do arquivo + senha via `.env`, nunca commitado)
- [ ] Configurar um `https.Agent` no backend com `pfx` + `passphrase` e testar a conexão mTLS contra o webservice de Status do Serviço da SEFAZ (endpoint simples, sem lógica de negócio) só pra validar que o certificado funciona

### Dia 28
- [ ] Montar o XML de consulta (`consChNFe` com a chave de acesso) pro webservice nacional de Distribuição DFe, em ambiente de homologação primeiro
- [ ] Criar `POST /notas/consulta-sefaz` no backend: recebe a chave, faz a consulta autenticada, retorna erro claro se o certificado estiver inválido/expirado
- [ ] Tratar a resposta: descompactar o `docZip` (base64 + gzip) pra obter o XML puro da nota e parsear (ex: `fast-xml-parser`) pra extrair emitente, itens e valores

### Dia 29
- [ ] Definir a estrutura de retorno da API deixando claro o que foi encontrado automaticamente vs. o que precisa ser preenchido manualmente
- [ ] Integrar no frontend: ao ler o código, chamar a consulta e pré-preencher o formulário de lançamento manual
- [ ] Auto-cadastrar fornecedor (por `taxId`/CNPJ) e produtos que não existirem ainda, reaproveitando o padrão de `supplierPicker.create`/`productPicker.create` já usado no lançamento manual
- [ ] Sinalizar visualmente o que veio da SEFAZ vs. o que precisa de revisão/complemento manual, garantindo que nada é salvo sem confirmação explícita do usuário no formulário

---

## Aba "Consultar XML" (necessidade nova, decidida em 03/08/2026)

> Uso: o contador da empresa (funcionário interno, já tem login no sistema — não precisa de nível
> de acesso novo) às vezes precisa baixar o XML de alguma nota pontual pra questões contábeis/fiscais.
> Diferente do fluxo de lançamento de compra: aqui é só busca por **chave de acesso específica** e
> cobre **qualquer nota do CNPJ** (não só as que já foram lançadas como compra no sistema). Reaproveita
> a mesma consulta+manifestação que já validamos no `API_Sefaz` — só devolve o XML pra download em vez
> de pré-preencher formulário.

- [x] Endpoint no `API_Sefaz` que devolve o XML completo (`nfeProc`) pronto pra download — `POST /consultas/xml` (feito)
- [x] Backend do monolito: `GET /sefaz/xml/:accessKey` (autenticado) chama o `API_Sefaz` e devolve o XML — testado ponta a ponta com nota real (05/08/2026)
- [x] Tela `ConsultarXmlView.vue`: campo de chave + botão único "Baixar XML" (sem passo de busca separado — o endpoint já devolve o XML direto)
- [x] Download do `.xml` no navegador (blob + link temporário) — feito
- [x] Erros da SEFAZ (não encontrada, bloqueio, etc.) aparecem via `message.error` — inclui tratamento especial pra ler a mensagem de erro quando a resposta é `blob`
- [x] Item no menu lateral (`AppLayout.vue`), mesma autenticação já existente

**✅ Feature completa, testada de ponta a ponta em 05/08/2026** (frontend → backend → `API_Sefaz` → SEFAZ → download).

---

## Categorização automática de produto por IA (decidido em 06/08/2026)

> Contexto: quando o scan de nota cria um produto novo (não achou por nome), hoje cai sempre em
> categoria "Não classificado". A ideia é usar uma API de IA (Google Gemini, tier gratuito — sem
> mensalidade, sem depender de máquina forte) pra sugerir uma categoria a partir da descrição do
> item (`xProd`), só na hora de criar produto novo — não em toda compra.

### Categoria do produto

- [x] Conta + API key no [Google AI Studio](https://aistudio.google.com/) (tier gratuito)
- [x] `GEMINI_API_KEY` no `.env`/`.env.example` do backend
- [x] `backend/src/services/ai.service.ts` — `suggestCategory(description)`, chamada à API do Gemini (`generateContent`), prompt pedindo só o nome da categoria, sem explicação
- [x] `backend/src/controllers/ai.controller.ts` + `backend/src/routes/ai.routes.ts` — `POST /ai/suggest-category`, autenticado, com **fallback silencioso** pra "Não classificado" se a IA falhar (não pode travar o lançamento de compra)
- [x] Registrar a rota em `backend/src/index.ts`
- [ ] `frontend/src/services/api/ai.service.ts` — chama o endpoint novo
- [ ] Ligar no `handleScanned` do `PurchaseFormView.vue`: ao criar produto novo durante o scan, chama a sugestão de categoria antes de `productPicker.create`
- [ ] Testar com nota real que tenha produto novo (não cadastrado ainda) e conferir se a categoria sugerida faz sentido

### Alerta de preço (desenho final em 07/08/2026 — histórico + Mercado Livre combinados)

> Ideia original era pedir preço de referência direto pra IA — **descartada**: LLM não tem
> conhecimento confiável de preço atual de mercado (é fato numérico específico, não "julgamento"
> como categoria — risco real de alucinação). Desenho final: a IA só **interpreta dado real**,
> nunca "lembra" preço de cabeça.
>
> **Fontes, combinadas quando disponíveis (não é "um ou outro"):**
> 1. **Histórico de compra do próprio produto** (se já comprou antes)
> 2. **5 anúncios mais baratos do Mercado Livre** (busca real, sempre, produto novo ou não —
>    referência externa pega coisa que só olhar o próprio histórico não pegaria)
> 3. **IA gera um relatório único em texto**, juntando o que tiver disponível das duas fontes
>    (ex: "você pagou R$X; da última vez pagou R$Y; no Mercado Livre a média dos mais baratos é
>    R$Z" + veredito curto: dentro da média / atenção / alto)
>
> **Como aparece pro usuário**: selo por item na revisão do formulário pós-scan (🟢/🟡/🔴), texto
> completo da IA num tooltip/popover ao passar o mouse — não polui a tela, nunca bloqueia o
> lançamento.
>
> **Armazenamento**: **não guarda nada** (nem preço do Mercado Livre, nem texto da IA) — é um
> alerta do momento da revisão, o preço externo muda o tempo todo e ficaria desatualizado rápido.
> Só o que já é salvo hoje (produto/quantidade/valor pago) continua sendo salvo. Dá pra adicionar
> um registro histórico depois, se fizer falta — não é decisão que trava nada agora.

- [x] `backend/src/services/mercadolivre.service.ts` — busca em `api.mercadolibre.com/sites/MLB/search?q=...`, ordena por preço, devolve os 5 mais baratos
- [x] Helper pra buscar preço médio/último pago pro mesmo `productId` no histórico (`getRecentUnitPrices`, reaproveita dado que já existe, mesma info da tela "Consulta por Produto")
- [x] `ai.service.ts` — nova função `generatePriceReport(description, paidPrice, historyPrices, marketPrices)`: manda o que tiver disponível das duas fontes + o preço pago, pede relatório em JSON (`{ verdict, text }`) — veredito decidido pela IA, não calculado no código
- [x] Endpoint novo `POST /ai/price-report` (+ `POST /ai/suggest-category`) — busca histórico + Mercado Livre, chama a IA, devolve o relatório (sem salvar nada), com fallback silencioso em cada etapa
- [ ] Frontend: componente de selo/tooltip por item na revisão pós-scan do `PurchaseFormView.vue`
- [ ] Testar com produto já comprado antes (deve ter as duas fontes) e produto novo (só Mercado Livre)

**⚠️ Limitações externas descobertas em 07/08/2026 (testado via curl direto, fora do nosso código):**
- **Mercado Livre**: `/sites/MLB/search` e `/products/search` retornam `403 Forbidden` pra qualquer chamada não-autenticada no momento — não é bug nosso, é um bloqueio recente e amplo do lado da Mercado Livre (múltiplos relatos de outros devs, inclusive com token OAuth válido, sem explicação oficial). O `mercadolivre.service.ts` já tem fallback silencioso pronto (`marketPrices: []`), então a feature não quebra — só funciona hoje só com a fonte de histórico. Se a ML voltar a liberar o endpoint, funciona sem mudar nada no código. Revisitar se virar bloqueio permanente.
- **Gemini**: `429` com `limit: 0` — não é estouro de cota de uso, é cota gratuita **travada em zero** até vincular uma conta de faturamento (cartão) ao projeto do Google Cloud associado à API key. Continua gratuito dentro do tier free, é só verificação anti-abuso. Ação: vincular faturamento em [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

**Notas de decisão:**
- **Por que Gemini**: tier gratuito de verdade (não só crédito de teste que expira), sem mensalidade, roda na nuvem (não precisa de máquina forte local).
- **Por que não MCP aqui**: MCP server é outra coisa — serve pra expor dados/ações do sistema pra um assistente de IA *usar* (ex: perguntar gastos pelo Claude Desktop), não pra o backend chamar uma IA como utilitário. É um projeto separado, ainda a planejar.
- **Por que fallback silencioso**: a sugestão de categoria e o alerta de preço são "extras" — se a IA ou o Mercado Livre falharem, o scan continua funcionando normal, só sem a sugestão/alerta.
- **Por que não pedir preço direto pra IA**: risco de alucinação em fato numérico específico — a IA só processa números reais que a gente já buscou, nunca "lembra" de cabeça.
- **Por que o veredito (`verdict`) vem da IA em JSON, não calculado no código**: decisão em 07/08/2026 — mais simples de manter (um lugar só decide "bom/médio/alto" e escreve o texto, sem duplicar a lógica), com parse defensivo (remove markdown, cai em `"normal"` se vier fora do esperado) cobrindo o risco de inconsistência.

---

## Semana 9 — Tratamento de erros e polish

### Dia 30
- [ ] Tratar "nota não encontrada" (mensagem clara, cai pro formulário manual vazio)
- [ ] Tratar erro de certificado (expirado, senha errada, indisponível) com mensagem clara, sem travar o app, cai pro formulário manual
- [ ] Tratar timeout/erro de rede na consulta (não travar a tela, permitir seguir manualmente)

### Dia 31
- [ ] Trocar do ambiente de homologação pra produção na consulta à SEFAZ, validando com uma chave de acesso real
- [ ] Revisão geral de UX do fluxo de escaneamento

### Dia 32
- [ ] Ajustes finais de UI/UX em todas as telas
- [ ] Rodada de testes manuais gerais e correção dos bugs encontrados

---

## Semana 10 — Deploy final e documentação

### Dia 33
- [x] Dockerfile do backend (build multi-stage)
- [x] Dockerfile do frontend (build + servir estático via nginx)

### Dia 34
- [ ] Completar o `docker-compose.yml` final (postgres + backend + frontend/nginx), com volumes e healthchecks
- [ ] Revisar o `.env.example` com todas as variáveis usadas pela aplicação completa

### Dia 35
- [ ] Testar o deploy completo do zero em uma pasta limpa (simulando o servidor)
- [x] Rodar migrations + seed nesse ambiente de teste "de produção"

### Dia 36
- [ ] Escrever `README.md`: requisitos, passo a passo de deploy no Ubuntu Server, comandos de backup/restore do Postgres
- [ ] Documentar como cadastrar novos usuários fixos

### Dia 37
- [ ] Deploy real no servidor da empresa
- [ ] Conferir se faz sentido monitorar os novos containers no Prometheus/cAdvisor já existentes
- [ ] Retrospectiva: o que ficou faltando, registrar ideias futuras no backlog abaixo

---

## Backlog (não fazer agora — só para não esquecer)

- [ ] OCR de foto da nota fiscal
- [ ] Notificações (ex: alerta de gasto acima do esperado numa categoria)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Múltiplos níveis de permissão de usuário (hoje é lista curta simples)

---

## Convenção de idioma

- Todo o código (nomes de variáveis, funções, tabelas, campos, commits) e toda a documentação (README, comentários, este TODO passará a ser reescrito em inglês na próxima revisão) devem ser em **inglês**.
- A conversa entre nós continua em português — é só o artefato final (código/docs) que vai em inglês.

## Notas de decisão em aberto

- **UI Kit do frontend**: ✅ decidido no Dia 16 — **Naive UI**.
- **Express vs Fastify**: ✅ decidido no Dia 2 — **Express**.
- **Consulta de nota fiscal (leitor de código de barras)**: ✅ decidido em 29/07/2026 — usar o webservice oficial **NFe Distribuição DFe** autenticado com o certificado digital (e-CNPJ) da empresa via o contador, em vez de raspar o HTML da consulta pública da SEFAZ-SC. ⚠️ Pendente: confirmar com o contador se o certificado é A1 (arquivo) ou A3 (token físico) — isso é bloqueante pro Dia 27 da Semana 8, e se for A3 o plano precisa ser revisto (exigiria um agente rodando na máquina com o token, ao invés de consulta centralizada no backend).
