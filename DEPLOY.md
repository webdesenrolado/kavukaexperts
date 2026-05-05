# Deploy — Kavuka Experts

## Stack
- Next.js 16 (App Router)
- Node 20+
- SQLite (better-sqlite3) — DB local em `data/kavuka.db`

## Deploy passo a passo (VPS)

### 1. Subir os arquivos
```bash
scp kavuka-experts.zip user@servidor:/opt/
ssh user@servidor
cd /opt && unzip kavuka-experts.zip
cd kavuka-experts
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Variáveis de ambiente
```bash
cp .env.example .env
nano .env   # editar AUTH_SECRET com string aleatória forte
```

Exemplo de AUTH_SECRET seguro:
```bash
openssl rand -base64 48
```

### 4. Inicializar o banco
```bash
npm run db:push      # cria tabelas no SQLite
npm run seed         # cria empresa GUÉP + usuário master
npm run seed:demo    # popula com vaga + candidatos demo (Ana com 12 instrumentos)
npm run seed:demo-extra  # adiciona 5 vagas + 16 candidatos extras
```

Login após seed:
- **Email:** `rodrigo.sasso@guep.com.br`
- **Senha:** `kavuka2026`

### 5. Build de produção
```bash
npm run build
```

### 6. Subir o servidor
```bash
npm start    # roda na porta 3355
```

### 7. Servir em /experts (subpath)

Se o domínio é `kavuka.ai/experts`, há **duas opções**:

**Opção A — Subdomínio (recomendado):** subir como `experts.kavuka.ai` direto, sem subpath. Mais simples e robusto.

**Opção B — Subpath `/experts`:** precisa de `basePath` no `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  basePath: "/experts",
  // ... resto da config
};
```

E reverse proxy nginx/Traefik direcionando `kavuka.ai/experts/*` para `localhost:3355`.

### 8. PM2 (manter rodando)
```bash
npm install -g pm2
pm2 start npm --name kavuka-experts -- start
pm2 save
pm2 startup    # gera comando pra autostart no boot
```

### 9. Nginx exemplo
```nginx
location /experts/ {
    proxy_pass http://127.0.0.1:3355/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Rotas principais

### Públicas (sem login)
- `/login` — tela de login
- `/carreiras` — portal público de vagas (candidatos se inscrevem aqui)
- `/aplicar/[token]` — landing pra candidato fazer avaliação por convite
- `/kyid/[token]` — KYID permanente do candidato

### Autenticadas (recrutador master)
- `/` — Dashboard
- `/vagas` — lista de vagas
- `/vagas/[id]` — detalhe da vaga + mapa + tabela de candidatos
- `/vagas/[id]/kanban` — kanban drag-drop pra mover candidatos entre etapas
- `/candidatos` — banco de talentos com filtros por traço comportamental
- `/candidatos/[id]` — Big Data Dashboard 360° do candidato
- `/avaliacoes` — histórico de avaliações aplicadas

## Estrutura

```
apps/rh-experts/
├── app/                    # Next.js App Router
├── components/             # AppShell, MapView, KyidSeal, etc.
├── db/                     # Drizzle schema
│   └── kavuka.db           # criado em data/kavuka.db (gitignored)
├── lib/                    # auth, instruments, geo, labels
├── services/               # microsserviços de avaliação
│   ├── _contract/          # contrato JSON canônico
│   └── ipip-neo-120/       # IPIP funcional (120 itens)
├── public/brand/           # logos, login-bg
├── docs/                   # PRODUTO.md, DECK-KAVUKA.html, DECK-KAVUKA.pptx
├── research/               # dossiês Marco 1 e Marco 2
├── scripts/                # seed, seed-demo, seed-demo-extra, test-*
└── DEPLOY.md (este arquivo)
```

## Backup do banco
```bash
cp data/kavuka.db data/backup-$(date +%Y%m%d).db
```

## Logs
```bash
pm2 logs kavuka-experts --lines 100
```

## Restart após mudança
```bash
pm2 restart kavuka-experts
```
