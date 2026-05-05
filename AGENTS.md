# Kavuka Experts — Project Instructions

This is the Kavuka Experts ATS — a recruitment platform with behavioral assessment microservices, part of the Guep CRM ecosystem.

## Stack
- Next.js 16.2.2 (App Router) — read `node_modules/next/dist/docs/` before writing code; this version has breaking changes vs your training data
- React 19, TypeScript 5
- Drizzle ORM + better-sqlite3 (`./data/kavuka.db`)
- Tailwind CSS 4
- JWT auth via `jose` (cookie `kavuka_token`)
- Port: **3355** (dev), 3355 (prod)

## Architecture overview
- `app/` — Next.js routes (UI + API route handlers)
- `db/` — Drizzle schema + migrations
- `lib/` — auth, utilities, integrations
- `services/` — assessment microservices (each instrument is a self-contained module — see `services/_contract/contract.md`)
- `scripts/` — CLI utilities (seed, imports, etc.)
- `research/` — scientific dossiers per assessment instrument (Marco 1, 2, 3)

## Assessment microservices
Each instrument (IPIP-NEO, Big Five, MBTI adapt., DISC, Hogan, Gallup, Dark Triad, Arquétipos, Eneagrama, Label, etc.) lives in `services/<slug>/` as a self-contained module with:
- `items.ts` — items repo
- `scoring.ts` — pure scoring function
- `norms.ts` — reference norms
- `interpretation.ts` — interpretation engine
- `apply.ts` — orchestration entrypoint
- `schema.ts` — Zod contract (extends `services/_contract/schema.ts`)

## Legal & ethical guardrails (non-negotiable)
- **Never** use clinical language ("neurótico", "psicopata", "transtorno"). Use "tendência a", "perfil de", "sinalização".
- Mark assessment outputs as "sinalização", **not** "diagnóstico clínico".
- Proprietary instruments (DISC, MBTI, Hogan, Gallup) must be implemented as "modelo adaptado" with original items — never reproduce their copyrighted item banks.
- Always require explicit LGPD consent before collecting assessment data.
- Score Humano output must be explainable and contestable.

## When in doubt
Read the consolidated project memory at `~/.claude/projects/-Users-sasso/memory/project_kavuka_experts.md`.
