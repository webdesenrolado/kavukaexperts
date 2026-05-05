# Contrato Canônico de Microsserviços de Avaliação — Kavuka Experts

> Versão: `1.0.0` — 2026-05-03
> Status: Draft estável — qualquer mudança no contrato exige bump de versão SemVer.

Este documento define o contrato JSON canônico que TODOS os microsserviços de
avaliação comportamental da plataforma Kavuka Experts devem produzir e consumir.
A intenção é que a plataforma central (Next.js 16, porta 3355) consiga consumir
qualquer instrumento (Big Five, IPIP-NEO-120, MBTI, DISC, Hogan, Gallup,
Dark Triad, Arquétipos, Eneagrama, Label, etc.) com a mesma camada de I/O,
mesmo quando os microsserviços evoluírem para serviços HTTP autônomos.

---

## 1. Princípios

1. **Identificação imutável**: cada aplicação de instrumento é identificada
   por `application_id` (uuid) e nunca pode ser sobrescrita.
2. **Versionamento explícito**: tanto o contrato quanto cada instrumento
   carregam SemVer; consumidores devem checar compatibilidade.
3. **Portabilidade**: o payload é JSON puro, sem dependências de runtime.
4. **Linguagem responsável**: `interpretation` jamais usa termos clínicos
   (ex.: "neurótico", "psicopata", "transtorno"). Sempre "tendência a",
   "sinalização", "perfil de".
5. **Conformidade LGPD**: toda aplicação carrega `consent_id` e
   `data_retention_until`.

---

## 2. Esquema de alto nível

```jsonc
{
  "instrument": "ipip-neo-120",        // slug do microsserviço
  "version": "1.0.0",                  // versão do INSTRUMENTO
  "contract_version": "1.0.0",         // versão do CONTRATO
  "subject_id": "uuid-do-avaliado",
  "application_id": "uuid-da-aplicacao",
  "responses": [ ... ],
  "scores": { ... },                   // tipado pelo schema do instrumento
  "interpretation": { ... },
  "meta": { ... },
  "quality_flags": [ ... ],
  "consent_id": "uuid-do-consentimento",
  "data_retention_until": "2031-05-03T00:00:00.000Z"
}
```

---

## 3. Campos de identificação

| Campo               | Tipo     | Obrigatório | Descrição                                                                                          | Exemplo                                  |
|---------------------|----------|-------------|----------------------------------------------------------------------------------------------------|------------------------------------------|
| `instrument`        | string   | sim         | Slug kebab-case do microsserviço. Único na plataforma.                                             | `"ipip-neo-120"`                         |
| `version`           | string   | sim         | SemVer da implementação do instrumento.                                                            | `"1.0.0"`                                |
| `contract_version`  | string   | sim         | SemVer do contrato canônico que este payload obedece.                                              | `"1.0.0"`                                |
| `subject_id`        | uuid     | sim         | Identificador opaco do avaliado (referência à pessoa).                                             | `"7c9e6679-..."`                         |
| `application_id`    | uuid     | sim         | Identificador único desta aplicação. Imutável.                                                     | `"550e8400-..."`                         |

---

## 4. Itens e respostas — `responses[]`

Array com pelo menos 1 item. Cada elemento representa a resposta a um item do
instrumento.

| Campo               | Tipo     | Obrigatório | Descrição                                                                                          | Exemplo                                  |
|---------------------|----------|-------------|----------------------------------------------------------------------------------------------------|------------------------------------------|
| `item_id`           | string   | sim         | ID do item dentro do instrumento (estável entre versões patch).                                    | `"ipip-neo-120-001"`                     |
| `value`             | union    | sim         | Resposta tipada — ver tabela abaixo.                                                               | `4`                                      |
| `response_time_ms`  | number   | não         | Tempo de resposta em ms. Usado em `quality_flags`.                                                 | `2350`                                   |

### 4.1. Tipos de `value`

| `kind`               | Forma de `value`                                            | Uso típico                  |
|----------------------|-------------------------------------------------------------|-----------------------------|
| Likert 1-5           | `{ "kind": "likert5", "value": 1\|2\|3\|4\|5 }`             | IPIP, Big Five              |
| Likert 1-7           | `{ "kind": "likert7", "value": 1..7 }`                      | Hogan, escalas longas       |
| Escolha forçada A/B  | `{ "kind": "forced_choice", "value": "A" \| "B" }`          | MBTI, DISC                  |
| Múltipla escolha     | `{ "kind": "multiple_choice", "value": "string-id" }`       | Eneagrama, arquétipos       |

> Observação: para retrocompatibilidade, `value` aceita também um número puro
> (interpretado como Likert 5 por padrão). Ver `schema.ts`.

---

## 5. Scores — `scores`

Objeto livre cuja forma é definida pelo Zod schema do instrumento.
Todo instrumento é OBRIGADO a publicar seu sub-schema. Exemplos:

- **Big Five**: `{ O, C, E, A, N }` — 5 chaves, cada uma `{ raw, percentile, level }`.
- **IPIP-NEO-120**: `{ domains: { O,C,E,A,N }, facets: { o1..o6, c1..c6, ... } }`.
- **DISC**: `{ D, I, S, C }`.

Cada score deve seguir o sub-tipo `Score`:

```ts
{
  raw: number,                   // pontuação bruta (soma de itens)
  percentile?: number,           // 0..100 (quando há normas)
  level: "very_low"|"low"|"average"|"high"|"very_high",
  z_score?: number               // opcional, quando aplicável
}
```

---

## 6. Interpretação — `interpretation`

| Campo         | Tipo                                  | Obrigatório | Descrição                                                                |
|---------------|---------------------------------------|-------------|--------------------------------------------------------------------------|
| `strengths`   | string[]                              | sim         | Pontos fortes em pt-BR, linguagem responsável.                           |
| `watchouts`   | string[]                              | sim         | Pontos de atenção (jamais clínicos). Linguagem "sinalização", "tendência a". |
| `narrative`   | string                                | sim         | Narrativa em prosa, 1-3 parágrafos.                                      |
| `confidence`  | `"low"\|"medium"\|"high"`             | sim         | Confiança do output em função de `quality_flags`, normas, completude.    |

---

## 7. Metadados — `meta`

| Campo                       | Tipo                                   | Obrigatório | Descrição                                                                |
|-----------------------------|----------------------------------------|-------------|--------------------------------------------------------------------------|
| `applied_at`                | ISO-8601 datetime                      | sim         | Quando a aplicação foi finalizada.                                       |
| `channel`                   | `"web"\|"whatsapp"\|"paper"`           | sim         | Canal de coleta.                                                         |
| `completion_time_seconds`   | number                                 | sim         | Tempo total para completar (segundos).                                   |
| `language`                  | string (BCP-47)                        | sim         | Ex.: `"pt-BR"`.                                                          |
| `version_of_instrument`     | string (SemVer)                        | sim         | Espelha `version`. Mantido por convenção/legibilidade.                   |
| `applier_id`                | uuid \| null                           | não         | Quem aplicou (recrutador, agente). `null` em auto-aplicação.             |
| `tenant_id`                 | uuid                                   | não         | Multi-tenant — qual cliente da plataforma.                               |

---

## 8. Qualidade — `quality_flags[]`

Array de flags emitidos pelo microsserviço de avaliação:

| Flag                         | Quando emitir                                                            |
|------------------------------|--------------------------------------------------------------------------|
| `too_fast`                   | Tempo médio por item < 1.5s ou tempo total < 30% do esperado.            |
| `inconsistent`               | Pares de itens reverse-keyed com correlação contraditória.               |
| `incomplete`                 | Itens faltando (mas dentro de tolerância para gerar score).              |
| `straightlining`             | Mesmo valor em ≥ 80% dos itens consecutivos de domínios distintos.       |
| `social_desirability_high`   | Padrão extremo de respostas socialmente desejáveis.                      |

Se `quality_flags.length > 0`, `interpretation.confidence` deve cair pelo menos um nível.

---

## 9. Auditoria LGPD

| Campo                  | Tipo                | Obrigatório | Descrição                                                          |
|------------------------|---------------------|-------------|--------------------------------------------------------------------|
| `consent_id`           | uuid                | sim         | Aponta para o registro de consentimento na plataforma central.     |
| `data_retention_until` | ISO-8601 datetime   | sim         | Data até quando o payload pode ser persistido.                     |

---

## 10. Eventos (futuro HTTP)

Quando os microsserviços forem extraídos para serviços HTTP, o transporte
esperado é:

- `POST /apply` — recebe `{ subject_id, application_id, responses[], meta, consent_id, data_retention_until }`, devolve o payload completo.
- `GET /instrument` — devolve `{ instrument, version, contract_version, items[] }`.
- `POST /score` — recebe `{ responses[] }`, devolve `{ scores }` (sem narrativa, mais barato).
- Evento async (opcional): `application.completed.v1` no message bus.

---

## 11. Exemplo de payload completo

```json
{
  "instrument": "ipip-neo-120",
  "version": "1.0.0",
  "contract_version": "1.0.0",
  "subject_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "application_id": "550e8400-e29b-41d4-a716-446655440000",
  "responses": [
    { "item_id": "ipip-neo-120-001", "value": { "kind": "likert5", "value": 4 }, "response_time_ms": 2350 },
    { "item_id": "ipip-neo-120-002", "value": { "kind": "likert5", "value": 2 }, "response_time_ms": 1980 }
  ],
  "scores": {
    "domains": {
      "O": { "raw": 92, "percentile": 78, "level": "high" },
      "C": { "raw": 88, "percentile": 65, "level": "high" },
      "E": { "raw": 70, "percentile": 45, "level": "average" },
      "A": { "raw": 95, "percentile": 80, "level": "high" },
      "N": { "raw": 55, "percentile": 30, "level": "low" }
    },
    "facets": {
      "o1_imagination": { "raw": 18, "level": "high" },
      "o2_artistic_interests": { "raw": 16, "level": "average" }
    }
  },
  "interpretation": {
    "strengths": [
      "Perfil com forte abertura a novas ideias e experiências.",
      "Tendência a colaborar e construir consenso em equipe."
    ],
    "watchouts": [
      "Sinalização de busca por estímulo intelectual constante — pode demandar projetos variados para manter engajamento."
    ],
    "narrative": "O perfil avaliado indica uma combinação de abertura intelectual e sociabilidade colaborativa...",
    "confidence": "high"
  },
  "meta": {
    "applied_at": "2026-05-03T18:30:00.000Z",
    "channel": "web",
    "completion_time_seconds": 720,
    "language": "pt-BR",
    "version_of_instrument": "1.0.0"
  },
  "quality_flags": [],
  "consent_id": "9f1c1d4e-1f4f-4a3e-9b1a-2b9e0c4a7d10",
  "data_retention_until": "2031-05-03T00:00:00.000Z"
}
```

---

## 12. Checklist de conformidade do microsserviço

Para um microsserviço ser aceito na plataforma, deve:

- [ ] Exportar uma função `apply<Instrument>(input): ApplicationResult` pura e determinística.
- [ ] Exportar um Zod schema que estende o contrato (`scores` tipado).
- [ ] Publicar `items[]` em pt-BR validados (ou marcar `translation: "pending_validation"`).
- [ ] Implementar `quality_flags` mínimos: `too_fast`, `incomplete`, `straightlining`.
- [ ] Disponibilizar normas (mesmo que provisórias) e marcar origem geográfica.
- [ ] Garantir que `interpretation` jamais use linguagem clínica.
- [ ] Cobrir scoring com testes unitários (extremos + caso misto).
