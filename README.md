# Kavuka Experts — ATS GUÉP

> A plataforma que transforma currículos em inteligência humana.

ATS proprietário focado em RH, com automação WhatsApp e camada de avaliação comportamental construída como microsserviços independentes (12 instrumentos em 6 camadas científicas).

## Setup local

```bash
npm install
npm run db:push       # cria as tabelas no SQLite
npm run seed          # cria empresa GUÉP + usuário master
npm run dev           # http://localhost:3355
```

Login do master após o seed:
- Email: `rodrigo.sasso@guep.com.br`
- Senha: `kavuka2026`

## Arquitetura

```
rh-experts/
├── app/                    # Next.js App Router (UI + API routes)
├── components/             # Componentes compartilhados (AppShell, etc.)
├── db/                     # Drizzle schema + migrations
│   └── schema.ts           # companies, users, jobs, candidates, applications, assessments
├── lib/
│   └── auth/               # JWT cookie auth (jose + bcrypt)
├── services/               # Microsserviços de avaliação (1 pasta por instrumento)
│   ├── _contract/          # Contrato JSON canônico compartilhado
│   ├── ipip-neo-120/       # IPIP-NEO 120 itens (domínio público)
│   └── ...                 # big-five, mbti-adapt, disc-adapt, etc.
├── research/               # Dossiês científicos (Marco 1, 2, 3)
└── scripts/                # CLI utilities (seed, imports, etc.)
```

## Stack

- **Next.js 16.2.2** (App Router) — leia `node_modules/next/dist/docs/` antes de codar; tem breaking changes vs Next 14/15
- React 19, TypeScript 5
- Drizzle ORM + better-sqlite3
- Tailwind CSS 4
- Zod para validação
- jose + bcryptjs para auth

## Roadmap

Veja `~/.claude/projects/-Users-sasso/memory/project_kavuka_experts.md` para o plano completo:
- 17 etapas do funil ATS
- 12 microsserviços de avaliação em 6 camadas
- 5 MVPs definidos
- Score Humano proprietário
