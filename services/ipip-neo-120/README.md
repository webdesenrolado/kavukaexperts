# IPIP-NEO-120 — Microsserviço de Avaliação

Implementação canônica do **IPIP-NEO-120** (Johnson, 2014) para a plataforma
Kavuka Experts. Mede os 5 domínios do Big Five (O, C, E, A, N) e suas 30 facetas
(Johnson IPIP mapping) com 120 itens em escala Likert 1-5.

> **Status**: skeleton funcional. Pronto pra integração programática; itens em
> pt-BR ainda **pendentes de validação por psicometrista** (ver "Pendências").

---

## Conformidade com o contrato canônico

Este microsserviço respeita o contrato em
[`/services/_contract/contract.md`](../_contract/contract.md) — versão `1.0.0`.

A função pública `applyIpipNeo120(input)` recebe um `ApplyInput` e devolve um
`IpipApplicationResult` (envelope canônico tipado), validado por Zod
(`ipipApplicationResultSchema`) antes de ser retornado.

```ts
import { applyIpipNeo120 } from "@kavuka-experts/ipip-neo-120";

const result = applyIpipNeo120({
  subject_id: "uuid-...",
  application_id: "uuid-...",
  responses: [
    { item_id: "ipip-neo-120-001", value: { kind: "likert5", value: 4 } },
    // ... 119 demais itens
  ],
  meta: {
    channel: "web",
    language: "pt-BR",
    version_of_instrument: "1.0.0",
  },
  consent_id: "uuid-...",
  data_retention_until: "2031-05-03T00:00:00.000Z",
});
```

`result` segue o contrato canônico: `{ instrument, version, contract_version,
subject_id, application_id, responses, scores, interpretation, meta,
quality_flags, consent_id, data_retention_until }`.

---

## Estrutura

```
services/ipip-neo-120/
  README.md           — este arquivo
  package.json        — workspace package (privado)
  tsconfig.json       — herda do workspace, mapeia @contract/*
  src/
    index.ts          — exports públicos
    items.ts          — 120 itens (en + pt-BR), keying e mapeamento facet→domain
    scoring.ts        — scoring puro (responses → scores)
    norms.ts          — normas Johnson 2014 (US) — VALIDAÇÃO BR PENDENTE
    interpretation.ts — strengths/watchouts/narrative/confidence
    copy.ts           — copy pt-BR (single source) — não acoplar à lógica
    schema.ts         — Zod schema do IPIP estendendo o contrato canônico
    apply.ts          — orquestrador: scoring + quality flags + interpretation
  tests/
    scoring.test.ts        — extremos (tudo 1, tudo 5, misto, parcial, reverse keying)
    interpretation.test.ts — linguagem responsável, confidence, narrativa
```

---

## Contratos públicos

- `applyIpipNeo120(input: ApplyInput): IpipApplicationResult`
- `scoreIpipNeo120(responses: Response[]): IpipScores`
- `buildInterpretation({ scores, qualityFlags? }): Interpretation`
- `IPIP_NEO_120_ITEMS: IpipItem[]`
- `ipipApplicationResultSchema`, `ipipScoresSchema`

Tudo é puro e determinístico — bom pra unit testing e fácil de extrair pra um
serviço HTTP no futuro (`POST /apply`).

---

## Pontos de qualidade automatizados

`apply.ts` emite os seguintes `quality_flags`:

| Flag             | Regra                                                                  |
|------------------|------------------------------------------------------------------------|
| `incomplete`     | `< 120` itens conhecidos respondidos.                                  |
| `too_fast`       | tempo total `< 180s` OU `> 50%` dos itens com `< 800ms` de resposta.   |
| `straightlining` | run de ≥ 25 respostas idênticas consecutivas.                          |

Quando há ≥ 1 flag, `interpretation.confidence` cai para `medium`.
Com ≥ 3 flags ou < 3 domínios respondidos, cai para `low`.

> `inconsistent` e `social_desirability_high` ainda não são detectados — ver
> "Pendências".

---

## Linguagem responsável (regra de produto)

Os textos de `strengths`, `watchouts` e `narrative` **nunca** podem usar
vocabulário clínico (ex.: "neurótico", "psicopata", "transtorno"). Use sempre
"tendência a", "sinalização", "perfil de", "preferência por".

Os testes em `interpretation.test.ts` falham automaticamente se um termo
proibido aparecer no output. Toda nova string adicionada em `copy.ts` é coberta
por essa proteção.

---

## Pendências (issues a abrir)

1. **[BLOQUEANTE] Validação dos itens em pt-BR.**
   Todos os 120 itens estão marcados `translation: "pending_validation"`.
   A tradução foi feita a partir dos itens IPIP em inglês (domínio público).
   Abrir issue: *"Revisar tradução pt-BR dos 120 itens IPIP-NEO com
   psicometrista (referência: Hutz et al. para Big Five no Brasil)."*

2. **[BLOQUEANTE] Normas brasileiras.**
   `norms.ts` usa médias/SDs do Johnson 2014 (amostra US adulta) e marca todas
   as entradas com `validated_for_brazil: false`. Os percentis só são emitidos
   quando essa flag for `true`. Abrir issue: *"Coletar amostra normativa BR
   (≥ 1.000 sujeitos) e atualizar norms.ts."*

3. `inconsistent` e `social_desirability_high` ainda não estão implementados.
   Próximo passo: pares de itens reverse-keyed para detectar incoerência;
   escala Marlowe-Crowne ou similar embutida pra desejabilidade social.

4. `apply.ts` retorna `responses` exatamente como recebido. Considerar normalizar
   (ex.: converter `value` numérico bruto para a forma `{ kind: "likert5",
   value }`) antes de persistir, pra simplificar consumidores downstream.

---

## Testes

```bash
cd services/ipip-neo-120
npx vitest run
```

Cobertura mínima exigida (verifique antes de mergear):
- Scoring: 5 cenários (extremos + misto + parcial + reverse-keying).
- Interpretation: linguagem responsável, narrativa, confidence escalonada.

---

## Próximos passos sugeridos

1. Plugar `applyIpipNeo120` no app central da Kavuka Experts (porta 3355) atrás
   de `POST /api/instruments/ipip-neo-120/apply`.
2. Persistir `IpipApplicationResult` via Drizzle/SQLite com TTL respeitando
   `data_retention_until`.
3. Construir o segundo microsserviço (Big Five 50-item) reusando as mesmas
   convenções (`_contract` + estrutura idêntica).
4. Criar painel de auditoria que destaca `quality_flags` e a fonte das normas
   (`validated_for_brazil`), pra deixar o vies metodológico explícito.
