# TODO — Sistema de Controle de Compras de Manutenção

Plano de trabalho dividido em fases semanais, com tarefas de ~1-2h cada, em ordem de execução.
Prioridade: lançamento manual funcionando bem primeiro (MVP), leitor de código de barras + SEFAZ-SC depois.

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
- [ ] Adicionar hash de senha ao model `Usuario` no schema, rodar migration
- [ ] `POST /auth/login`: validar usuário/senha (bcrypt) e emitir JWT
- [ ] Middleware de autenticação: validar o JWT no header `Authorization`

### Dia 15
- [ ] Proteger rotas de escrita (`POST`/`PUT`/`DELETE`) com o middleware de autenticação
- [ ] Adicionar 2-3 usuários fixos ao seed
- [ ] Testar login e acesso às rotas protegidas via Postman

---

## Semana 5 — Frontend: lançamento manual de compra + histórico

### Dia 16
- [ ] Criar projeto frontend com Vite + Vue 3 + TypeScript
- [ ] Instalar Vue Router, Pinia, axios e a lib de UI escolhida (Naive UI ou PrimeVue — ver nota abaixo)
- [ ] Organizar estrutura de pastas (`views/`, `components/`, `stores/`, `services/api`)
- [ ] Tela de login simples; guardar o JWT (Pinia + localStorage)

### Dia 17
- [ ] Layout base (header + menu lateral simples)
- [ ] Store de autenticação (Pinia) e guarda de rotas (redirecionar pro login se não autenticado)

### Dia 18
- [ ] Formulário de lançamento manual: dados da nota (fornecedor, número, data de emissão, forma de lançamento)
- [ ] Campo de fornecedor com autocomplete (buscar existente ou cadastrar rápido se não existir)

### Dia 19
- [ ] Seção de itens da compra: adicionar/remover linhas (produto, quantidade, valor unitário)
- [ ] Campo de produto com autocomplete (buscar existente ou cadastrar rápido)
- [ ] Cálculo automático do valor total por item e do total da nota

### Dia 20
- [ ] Validações do formulário (campos obrigatórios, valores maiores que zero, pelo menos 1 item)
- [ ] Integração com `POST /compras`, feedback visual de sucesso/erro
- [ ] Testar o fluxo manual completo, do zero, ponta a ponta

### Dia 21
- [ ] Tela de listagem/histórico de compras (tabela paginada)
- [ ] Filtros por data, fornecedor, categoria **e produto** (autocomplete de produto nos filtros)
- [ ] Tela de detalhe da compra, mostrando os itens

---

## Semana 6 — Consulta por produto + dashboard de gastos

> Uso principal: buscar uma peça e ver rapidamente quando foi comprada, com quem e a especificação. Análise de gastos é secundária, mas vale ter as duas.

### Dia 22
- [ ] Endpoint backend `GET /produtos/:id/historico`: todas as ocorrências de compra daquele produto (data, fornecedor, valor unitário, quantidade, especificação, nota vinculada)
- [ ] Tela de consulta por produto: buscar a peça (autocomplete) e ver a lista/linha do tempo de todas as vezes que foi comprada, com fornecedor, data e valor — este é o uso do dia a dia, deixar rápido e direto

### Dia 23
- [ ] Endpoint backend: total de gastos agregado por período (mês/ano)
- [ ] Endpoint backend: total de gastos agregado por categoria e por fornecedor
- [ ] Tela de dashboard: cards com totais (mês atual, ano atual)

### Dia 24
- [ ] Gráfico de gastos por período e por categoria/fornecedor (top 5) — biblioteca leve, ex: Chart.js
- [ ] Polish visual e revisão geral, com foco em deixar a busca por produto (Dia 22) rápida e visível no menu principal

**>>> Neste ponto o MVP com lançamento manual está funcional e é o marco principal do projeto. <<<**
**Tudo abaixo é a camada de leitor de código de barras + SEFAZ-SC, tratada como bônus.**

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

## Semana 8 — Integração com consulta pública SEFAZ-SC

### Dia 27
- [ ] Pesquisar a URL pública de consulta de NFC-e por chave de acesso da SEFAZ-SC e o formato do HTML retornado
- [ ] Criar `POST /notas/consulta-sefaz` no backend: recebe a chave, faz o fetch (só SC por enquanto)

### Dia 28
- [ ] Implementar o parser do HTML de retorno (ex: `cheerio`) pra extrair itens/valores/fornecedor quando disponíveis
- [ ] Definir a estrutura de retorno da API deixando claro o que foi encontrado automaticamente vs. o que precisa ser preenchido manualmente

### Dia 29
- [ ] Integrar no frontend: ao ler o código, chamar a consulta e pré-preencher o formulário de lançamento manual
- [ ] Sinalizar visualmente o que veio da SEFAZ vs. o que precisa de revisão/complemento manual
- [ ] Garantir que nada é salvo sem confirmação explícita do usuário no formulário

---

## Semana 9 — Tratamento de erros e polish

### Dia 30
- [ ] Tratar "nota não encontrada" na SEFAZ (mensagem clara, cai pro formulário manual vazio)
- [ ] Tratar chave de UF diferente de SC (mensagem "consulta automática não suportada para esta UF ainda", segue manual)
- [ ] Tratar timeout/erro de rede na consulta (não travar a tela, permitir seguir manualmente)

### Dia 31
- [ ] Estruturar o código da consulta SEFAZ de forma isolada por UF (ex: um "strategy" por UF), preparando pra adicionar outros estados no futuro sem mexer no restante do sistema
- [ ] Revisão geral de UX do fluxo de escaneamento

### Dia 32
- [ ] Ajustes finais de UI/UX em todas as telas
- [ ] Rodada de testes manuais gerais e correção dos bugs encontrados

---

## Semana 10 — Deploy final e documentação

### Dia 33
- [ ] Dockerfile do backend (build multi-stage)
- [ ] Dockerfile do frontend (build + servir estático via nginx)

### Dia 34
- [ ] Completar o `docker-compose.yml` final (postgres + backend + frontend/nginx), com volumes e healthchecks
- [ ] Revisar o `.env.example` com todas as variáveis usadas pela aplicação completa

### Dia 35
- [ ] Testar o deploy completo do zero em uma pasta limpa (simulando o servidor)
- [ ] Rodar migrations + seed nesse ambiente de teste "de produção"

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
- [ ] Suporte à consulta pública de NFC-e em outras UFs além de SC
- [ ] Notificações (ex: alerta de gasto acima do esperado numa categoria)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Múltiplos níveis de permissão de usuário (hoje é lista curta simples)

---

## Convenção de idioma

- Todo o código (nomes de variáveis, funções, tabelas, campos, commits) e toda a documentação (README, comentários, este TODO passará a ser reescrito em inglês na próxima revisão) devem ser em **inglês**.
- A conversa entre nós continua em português — é só o artefato final (código/docs) que vai em inglês.

## Notas de decisão em aberto

- **UI Kit do frontend**: sugestão é **Naive UI** — mais leve, ótima integração nativa com Composition API/TypeScript, sem depender de estilos globais pesados. PrimeVue é igualmente válido se você preferir mais componentes prontos (tabelas mais robustas, por exemplo). Decida no Dia 16, sem compromisso.
- **Express vs Fastify**: sugestão é **Express** por ser mais comum e ter mais material de referência para quem está começando; Fastify é mais rápido mas exige mais familiaridade com seu ecossistema de plugins. Decida no Dia 2.
