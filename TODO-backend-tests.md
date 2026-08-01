# TODO — Testes de backend (Jest)

TODO satélite, separado do `TODO.md` principal. Não mexe na ordem/roadmap de features —
cobre a dívida técnica de não ter nenhum teste automatizado no `backend/` ainda.
Pode ser feito aos poucos, entre um dia e outro do TODO principal.

Marque cada item com `[x]` conforme for concluindo.

Stack: o backend é ESM + TypeScript (`"type": "module"` no `package.json`, roda via `tsx`),
então o setup do Jest precisa do preset certo pra ESM+TS — isso está detalhado na Fase 1.

**Prioridade (atualizado em 2026-08-01)**: foco em cobrir lógica de negócio crítica com testes
unitários (Fase 3) — não precisam de banco e já são um teste automatizado defensável.
Fase 2 (banco de teste) e Fase 4 (integração com Supertest) viraram *stretch goal* opcional,
não bloqueiam nada.

---

## Fase 1 — Setup do Jest

- [x] Instalar dependências: `jest`, `@types/jest`, `supertest`, `@types/supertest`
- [x] ~~`ts-jest`~~ **trocado por Babel** (`babel-jest`, `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`) — o `typescript@^7` instalado no projeto é a reescrita nativa (Go/"tsgo") e **não expõe mais a JS Compiler API** que o `ts-jest` precisa (erro real em runtime, não só peer-dep). Babel só remove a sintaxe de tipos, sem usar essa API, então não é afetado.
- [x] Criar `babel.config.cjs` (presets `@babel/preset-env` alvo `node: current` + `@babel/preset-typescript`) — o preset-env também converte ESM→CommonJS pros testes, então não precisa mais de `--experimental-vm-modules`
- [x] Criar `jest.config.js` com `transform` apontando pro `babel-jest` e `moduleNameMapper` pra resolver os imports `.js` (convenção NodeNext ESM) de volta pros arquivos `.ts`
- [x] Script `test` no `package.json` simplificado pra só `jest` (sem flag experimental, já que não estamos mais em modo ESM nativo)
- [x] Teste "smoke" trivial (`1 + 1 = 2`) em `src/__tests__/smoke.test.ts` — passou verde

## Fase 2 — Banco de dados de teste (opcional / adiado)

- [ ] Banco `purchases_test_db` criado no mesmo container Postgres (não precisou de serviço novo no `docker-compose.yml`) — feito, mas não usado ainda já que o foco virou unitários sem banco
- [ ] Criar `.env.test` com `DATABASE_URL` apontando pro banco de teste
- [ ] Script/helper que roda `prisma migrate deploy` no banco de teste antes da suíte (ex. `pretest` no `package.json`)
- [ ] Helper de limpeza entre testes (ex. `truncate` nas tabelas ou reset via transação) pra cada teste começar com estado previsível

## Fase 3 — Testes unitários (sem tocar banco) — foco atual

- [x] Cálculo do total da compra: extraída a função pura `buildPurchaseItems` de dentro de `createPurchase`/`updatePurchase` (eliminou duplicação de quebra) em `purchase.service.ts`, testada em `src/services/__tests__/purchase.service.test.ts` (cálculo por item, arredondamento de 2 casas, total sempre recalculado a partir dos itens) — módulo `prisma.ts` mockado com `jest.mock`, teste 100% isolado, sem banco
- [x] Validação dos schemas `zod`: feito pro `createPurchaseSchema` (`purchase.schema.ts`) em `src/schemas/__tests__/purchase.schema.test.ts` — payload válido, itens vazios, quantidade/valor não-positivos, chave de acesso com tamanho errado, enum inválido, nota sem número. Os schemas de `auth`/`product`/`supplier` ficam de fora por ora (mesmo padrão, baixo valor marginal replicar agora)
- [ ] `AppError` + mapeamento de erros do Prisma (P2002/P2025/P2003) no `errorHandler.ts`: cada código gera a resposta HTTP esperada
- [ ] `authenticate.ts` (middleware de JWT): sem token, token inválido, token expirado, token válido (mockando `jsonwebtoken`)
- [ ] Lógica de senha do `auth.service.ts` (hash/compare do `bcryptjs`) isolada da parte que toca banco

## Fase 4 — Testes de integração (Supertest + banco de teste)

> Cobrir o caminho feliz + os erros que a API já trata (400 de validação, 401/403 de auth, 404, 409 de conflito).

- [ ] `auth`: `POST /auth/login` (senha certa, senha errada, usuário inexistente)
- [ ] `suppliers`: CRUD completo (`GET`, `GET /:id`, `POST`, `PUT`, `DELETE`), incluindo validação de entrada e rota protegida sem token
- [ ] `products`: CRUD completo + `GET /products?search=` (busca parcial, case-insensitive) + `GET /products/:id/history`
- [ ] `purchases`: `POST /purchases` (criação aninhada + atomicidade: item inválido não deixa compra órfã), `GET /purchases` (paginação e filtros), `GET /purchases/:id`, `PUT /purchases/:id` (substituição de itens), `DELETE /purchases/:id` (transação)
- [ ] Cálculo do valor total da compra: teste garantindo que o backend recalcula a partir dos itens e ignora valor total enviado pelo frontend

## Fase 5 — Amarrando tudo

- [ ] Rodar a suíte completa localmente e conferir que passa do zero (banco de teste limpo)
- [ ] Adicionar `npm test` como passo obrigatório antes de commit/push (documentar no `README.md` do backend, sem necessidade de hook automático por enquanto)
- [ ] (Opcional) Configurar `collectCoverage` no `jest.config.ts` só pra visibilidade — sem meta de % por enquanto

---

## Fora de escopo por agora

- Testes de frontend (Vue) — fica pra depois, tema separado
- Testes end-to-end (Playwright/Cypress) — só faz sentido depois do MVP fechado