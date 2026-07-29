# Deploy — ComprasSularroz (k3s)

## Arquitetura

```
Internet/LAN
    │
    ▼
Traefik (Ingress, porta 80)
    │
    ▼
Service frontend (ClusterIP)
    │
    ▼
Pod frontend (Nginx servindo o build do Vue)
    │
    ▼  proxy /api/
Service backend (ClusterIP)
    │
    ▼
Pod backend (Node/Express)
    │
    ▼
Service postgres (ClusterIP)
    │
    ▼
Pod postgres (PVC)
```

Namespace do Kubernetes: `comprassularroz`.

## Pré-requisitos

- k3s instalado e rodando no servidor (`sudo kubectl get nodes` deve mostrar o node `Ready`)
- Docker instalado na máquina onde as imagens são construídas (pode ser um desktop/notebook, não precisa ser o servidor)
- Login feito no `ghcr.io` tanto na máquina de build (`docker login`) quanto acesso a um Personal Access Token com escopo `read:packages`/`write:packages`

## Build e push das imagens

Feito na máquina de desenvolvimento (**não** no servidor):

```bash
# Backend
cd backend
docker build -t ghcr.io/tiagogdella/comprassularroz-backend:latest .
docker push ghcr.io/tiagogdella/comprassularroz-backend:latest

# Frontend
cd ../frontend
docker build -t ghcr.io/tiagogdella/comprassularroz-frontend:latest .
docker push ghcr.io/tiagogdella/comprassularroz-frontend:latest
```

## Manifests Kubernetes (pasta `k8s/` no servidor)

Aplicar nessa ordem (banco antes de migration, migration antes do backend):

```bash
cd ~/k8s

# 1. Namespace
sudo kubectl apply -f namespace.yaml

# 2. Secrets — ver seção "Secrets" abaixo (não versionados no Git)

# 3. Postgres
sudo kubectl apply -f postgres-pvc.yaml -f postgres-deployment.yaml -f postgres-service.yaml

# 4. Migrations (roda uma vez, aplica o schema)
sudo kubectl apply -f migration-job.yaml

# 5. Seed (roda uma vez, cria os usuários fixos)
sudo kubectl apply -f seed-job.yaml

# 6. Backend
sudo kubectl apply -f backend-deployment.yaml -f backend-service.yaml

# 7. Frontend + Ingress
sudo kubectl apply -f frontend-service.yaml -f frontend-deployment.yaml -f frontend-ingress.yaml
```

Acesso: `http://<IP-do-servidor>` (ex: `http://192.168.1.44`), via Traefik (já vem instalado com o k3s, escuta nas portas 80/443).

## Secrets (não versionados no Git)

**`app-secrets`** — credenciais do Postgres, `JWT_SECRET` e `DATABASE_URL`:

```bash
sudo kubectl create secret generic app-secrets \
  --namespace comprassularroz \
  --from-literal=POSTGRES_USER=purchases_app \
  --from-literal=POSTGRES_PASSWORD='<senha>' \
  --from-literal=POSTGRES_DB=purchases_db \
  --from-literal=JWT_SECRET='<string aleatória>' \
  --from-literal=DATABASE_URL='postgresql://purchases_app:<senha>@postgres:5432/purchases_db'
```

**`ghcr-secret`** — credencial pra puxar as imagens privadas do ghcr.io:

```bash
sudo kubectl create secret docker-registry ghcr-secret \
  --namespace comprassularroz \
  --docker-server=ghcr.io \
  --docker-username=tiagogdella \
  --docker-password='<personal access token>' \
  --docker-email=tigdella@gmail.com
```

Um modelo de referência (sem valores reais) fica versionado em `k8s/secret.example.yaml`.

## Atualizando uma imagem (rebuild/redeploy)

Como os Deployments usam a tag `:latest`, o Kubernetes baixa a versão nova ao reiniciar o Pod. Depois de dar `docker push` de uma imagem atualizada:

```bash
sudo kubectl rollout restart deployment/backend -n comprassularroz
# ou
sudo kubectl rollout restart deployment/frontend -n comprassularroz
```

Se a mudança for no schema/migrations do backend, recria o Job de migration também (Jobs não têm `rollout restart`):

```bash
sudo kubectl delete job prisma-migrate -n comprassularroz
sudo kubectl apply -f migration-job.yaml
```

`prisma migrate deploy` só aplica as migrations que ainda não rodaram — é seguro reaplicar esse Job quantas vezes precisar.

## Cadastrar/alterar usuários fixos

Os usuários de login são definidos em `backend/prisma/seed.ts` (não existe tela de auto-cadastro). Pra adicionar/remover um usuário:

1. Editar a lista de `prisma.user.create(...)` em `backend/prisma/seed.ts`
2. Rebuild + push da imagem do backend
3. Recriar o Job de seed:

```bash
sudo kubectl delete job prisma-seed -n comprassularroz
sudo kubectl apply -f seed-job.yaml
```

⚠️ O seed apaga (`deleteMany`) e recria **todos** os usuários a cada execução — não afeta fornecedores/produtos/compras reais.

## Troubleshooting comum

| Sintoma | Causa provável |
|---|---|
| `ImagePullBackOff` / `403 Forbidden` | Secret `ghcr-secret` com token errado/expirado, ou `imagePullSecrets` faltando no manifest |
| `unknown directive` no Nginx | Erro de digitação no `nginx.conf` |
| `host not found in upstream "backend"` | Testando o container do frontend isolado localmente (fora do cluster), sem nada respondendo por esse nome |
| `Could not find Prisma Schema` | Imagem sem `prisma/` e `prisma.config.ts` copiados no estágio de runtime do Dockerfile |
| `ERR_MODULE_NOT_FOUND .../src/...` no seed | Imagem sem a pasta `src/` copiada (o seed roda via `tsx`, não via `dist/` compilado) |
| Frontend `Service` tipo `LoadBalancer` fica `<pending>` | Porta 80 já ocupada pelo Traefik — usar `Ingress` em vez de um segundo `LoadBalancer` |

## Backup / restore do Postgres

```bash
# Backup
sudo kubectl exec -n comprassularroz deploy/postgres -- pg_dump -U purchases_app purchases_db > backup.sql

# Restore
sudo kubectl exec -i -n comprassularroz deploy/postgres -- psql -U purchases_app purchases_db < backup.sql
```
