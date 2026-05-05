# Deploy no Vercel — Kavuka Experts

Guia passo-a-passo pra subir em **kavuka.ai/experts** ou **experts.kavuka.ai**.

---

## 1. Criar repositório no GitHub

```bash
# Na pasta do projeto:
git init
git add .
git commit -m "Kavuka Experts v0.1 — initial deploy"

# Criar repo privado via gh CLI (autentique com gh auth login se ainda não):
gh repo create rosasso/kavuka-experts --private --source=. --push
```

Se não tiver `gh` CLI:
- Cria repo manualmente em github.com/new (privado, nome `kavuka-experts`, **NÃO inicializar com README**)
- ```bash
  git remote add origin git@github.com:rosasso/kavuka-experts.git
  git branch -M main
  git push -u origin main
  ```

---

## 2. Criar banco Postgres no Neon

Mais simples: **dentro do Vercel**.

1. Faz login em https://vercel.com (conta `sasso@webdesenrolado.com.br`)
2. Importa o repo `kavuka-experts` (botão **Add New → Project**)
3. Antes de fazer deploy, vai na aba **Storage** → **Create Database** → **Neon Postgres** (free tier)
4. Conecta ao projeto → automaticamente injeta `DATABASE_URL` em todos os ambientes
5. Copia a `DATABASE_URL` (vai precisar local pra rodar migrations)

Alternativa direta: cria conta em https://neon.tech, cria projeto `kavuka-experts`, copia connection string.

---

## 3. Criar tabelas + popular dados (rodando local apontando pra Neon)

```bash
# 1. Cria .env local com DATABASE_URL do Neon + AUTH_SECRET
cp .env.example .env
nano .env   # cola DATABASE_URL do Neon + gera AUTH_SECRET com `openssl rand -base64 48`

# 2. Push do schema pro Postgres
npx drizzle-kit push

# 3. Rodar TODOS os seeds (cria GUÉP, master, vagas demo, candidatos, conversas)
npm run setup
```

Isso popula o Neon com:
- 1 empresa (GUÉP)
- 1 user master (rodrigo.sasso@guep.com.br / kavuka2026)
- 6 vagas (1 principal + 5 extras)
- 20 candidatos (Ana com 12 instrumentos)
- 4 canais omnichannel + 10 conversas
- KYID determinística da Ana

---

## 4. Configurar variáveis no Vercel

Vai em **Settings → Environment Variables** do projeto:

| Nome | Valor | Ambiente |
|---|---|---|
| `DATABASE_URL` | (já vem injetada pelo Neon — confirma que tá lá) | All |
| `AUTH_SECRET` | mesmo valor do .env local (importante!) | All |

---

## 5. Deploy

Vercel detecta automaticamente Next.js e faz build. Primeiro deploy demora ~2 min.

URL temporária: `https://kavuka-experts-xxx.vercel.app`

Testa:
- `/login` — `rodrigo.sasso@guep.com.br` / `kavuka2026`
- `/inbox` — Inbox Omnichannel
- `/kyid/demo-ana-carolina-kyid-token-2026-kavuka` — KYID pública da Ana
- `/carreiras` — portal público

---

## 6. Conectar domínio próprio

### Opção A — `experts.kavuka.ai` (subdomínio, recomendado)

1. Vercel → **Settings → Domains** → adiciona `experts.kavuka.ai`
2. No DNS (onde tá registrado kavuka.ai):
   - Adiciona `CNAME experts → cname.vercel-dns.com`
3. Aguarda propagação (5-30 min)
4. Vercel emite SSL automaticamente

### Opção B — `kavuka.ai/experts` (subpath)

Mais complexo. Requer ou:
- Reverse proxy (nginx) no servidor que hospeda kavuka.ai apontando `/experts/*` pro Vercel
- Ou mover kavuka.ai inteiro pra Vercel e usar rewrites

**Recomendação:** vai de subdomínio. Mais rápido e limpo.

---

## 7. Próximos deploys

Toda vez que fizer push pra branch `main` no GitHub, Vercel re-deploya automaticamente. Seeds **não** rodam de novo (DB persiste).

Pra novos schema changes:
```bash
# local
npx drizzle-kit push   # aplica no Neon
# commit + push
git push
# Vercel re-deploya automaticamente
```

---

## Troubleshooting

### "DATABASE_URL não configurada"
Confirma que a variável está em **all environments** (Production, Preview, Development) no Vercel.

### Build falha com erro de SQLite
Limpa cache do Vercel: **Deployments → ... → Redeploy → Clear build cache**.

### Tabelas não existem
Rodou o `npx drizzle-kit push` apontando pro Neon? Confere com `npx drizzle-kit studio` se as tabelas tão lá.

### Login falha mesmo com senha certa
`AUTH_SECRET` no Vercel TEM que ser igual ao local quando rodou seeds. Se diferente, sessões não validam.

### Seeds derrubam dados em produção
Seeds são **idempotentes** mas **destrutivos** — eles deletam linhas demo antes de re-criar. Não rode em produção real (apenas no setup inicial).

---

## Rotas principais (após deploy)

### Públicas
- `/login`
- `/carreiras`
- `/aplicar/[token]`
- `/kyid/[token]`

### Autenticadas
- `/` Dashboard
- `/inbox` Omnichannel
- `/vagas` + `/vagas/[id]` + `/vagas/[id]/kanban`
- `/candidatos` + `/candidatos/[id]` (Big Data 360°)
- `/avaliacoes`

---

> **Custo do stack**: Vercel Hobby (free) + Neon free (3GB, suficiente pra 100k candidatos) = R$ 0/mês até demo + tração inicial.
