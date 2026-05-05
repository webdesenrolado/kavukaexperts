# Marco 2 — Relatório consolidado de pesquisa

> Camadas 2, 3 e 4 da arquitetura Kavuka KYID.
> Status: ✅ **5/5 dossiês concluídos** (DISC, Label GUÉP, Gallup, Dark Triad, Hogan adaptado).

---

## Arquivos entregues

```
research/marco-2/
├── 01-disc-adapt.md       (336 linhas — DISC adaptado)
├── 02-label-guep.md       (317 linhas — Label GUÉP autoral)
├── 03-gallup-adapt.md     (362 linhas — Gallup CliftonStrengths adaptado)
├── 04-dark-triad.md       (402 linhas — Dark Triad com restrições)
└── 05-hogan-adapt.md      (Hogan derivado de IPIP+Dark Triad)
```

---

## Resumo de cada instrumento

### 01 — DISC adaptado
- **Status legal:** original Marston 1928 é domínio público; versões comerciais (Wiley/TTI) são proprietárias. Banco de itens IPIP públicos cobre a maior parte.
- **Score weight no Score Humano:** **0.10** (sub-conjunto do Big Five — pouca variância nova)
- **Resolução crítica:** 🚨 **perfis GUÉP (Executor / Estrategista / Operador / Influenciador) NÃO são tradução literal do DISC** (Executor / Comunicador / Planejador / Analista). Documentado em §7.5 do dossiê.

### 02 — Label GUÉP
- **Status legal:** instrumento autoral GUÉP, sem dependência licenciada.
- **Score weight:** **0.0** (camada de rotulagem **derivada**, não medição)
- **Decisão crítica:** 🚨 **Label NÃO é instrumento de avaliação** — é **labeling layer** (função pura sobre outputs de outros instrumentos). Documentar isso para auditoria CFP/LGPD evita classificação como teste psicológico.
- **8 rótulos propostos** em PT-BR: Conector / Construtor / Curador / Catalisador / etc. — verificar marca no INPI antes de finalizar.

### 03 — Gallup CliftonStrengths adaptado
- **Status legal:** 34 nomes de talentos são marcas registradas Gallup. **Construir 12 forças com nomes próprios em PT-BR** é defensável.
- **Score weight:** **0.10** (cada um dos 4 domínios mapeia 1:1 para fator Big Five — pouca variância nova)
- **Decisão crítica:** Gallup admite que "menos da metade dos 34 talentos demonstra consistência interna adequada" — fragilidade reconhecida. Foco da Kavuka: **resolução narrativa** (nomes específicos), não medição estatística adicional.
- **Conflito de naming:** "Conector" também é Label GUÉP. Recomendação: rebatizar para **"Articulador"** na adaptação Gallup pra evitar colisão.

### 04 — Dark Triad ⚠️ alto risco
- **Status legal:** SD3 (Jones & Paulhus 2014) e Dirty Dozen têm itens publicados em papers, mas para uso comercial recomenda-se **banco autoral GUÉP de 15-20 itens** inspirado na metodologia.
- **Score weight:** **0.05** (peso muito baixo — alta sensibilidade reputacional)
- **🚨 Restrições obrigatórias:**
  - Nunca apresentar como teste psicológico (não consta no SATEPSI)
  - Nunca usar termos clínicos (psicopatia → "estilo direto/utilitário")
  - Visibilidade restrita a roles seniores/alto stake
  - **Revisão humana obrigatória** antes de qualquer rejeição com Dark Triad como fator
  - Opt-out total da camada 4 disponível no consentimento LGPD
- **Achado crítico:** Dirty Dozen mede principalmente "baixa Conscienciosidade + baixo medo" — não psicopatia clássica (Miller et al., 2012). Não usar para inferências clínicas.
- **Recomendação Kavuka:** começar com **3 dimensões clássicas** (Maquiavelismo, Narcisismo subclínico, Psicopatia subclínica → renomeada). Sadismo (SD4) fica como roadmap.

### 05 — Hogan HDS adaptado
- **Status legal:** Hogan HDS original é proprietário. Kavuka usa modo **derivado** a partir de IPIP-NEO-120 + Dark Triad — zero dependência licenciada.
- **Score weight:** **0.10** (derivado mas adiciona acionabilidade narrativa)
- **🚨 Restrições obrigatórias:**
  - **Nunca usar a palavra "Hogan"** no produto consumer-facing
  - Visibilidade restrita a vagas com `seniority IN [senior, especialista, lideranca]`
  - Nomes em PT-BR: "Reativo emocional", "Avesso ao risco", "Conformista" etc.
  - **Constelação de alto risco** (3+ escalas em z ≥ 1.5) força revisão humana antes de rejeição
- **11 escalas em 3 clusters** (Moving Away / Against / Toward people)
- **Modo `derived` como padrão**, modo `direct` (66 itens autorais) como roadmap futuro

---

## Decisões críticas que afetam o projeto inteiro

### 🚨 Sobre arquitetura de microsserviços

1. **Padrão "derived" estabelecido** — Label, Hogan e (futuramente) MBTI-like usam o mesmo padrão: função pura sobre outputs de instrumentos antecedentes. Economiza fadiga do candidato + evita dupla contagem + zera risco psicométrico extra. Documentar no `services/_contract/contract.md` como modo válido oficial.

2. **Campo novo no contrato canônico:**
   ```ts
   mode: z.enum(["direct", "derived"]).default("direct"),
   depends_on: z.array(slugSchema).optional(),  // só preenchido em modo derived
   ```

3. **Campo `requires_seniority` por instrumento** — para Hogan e Dark Triad que devem ser exibidos só em vagas elegíveis:
   ```ts
   requires_seniority: z.array(z.enum(["junior","pleno","senior","especialista","lideranca"])).optional(),
   ```

4. **Flag `forces_human_review` no envelope** — instrumentos podem emitir flag que bloqueia rejeição automatizada. Hogan-derived com `high_risk_constellation: true` aciona isso. Score Humano UI deve respeitar.

### 🚨 Sobre Score Humano

Pesos consolidados sugeridos:

| Instrumento | score_weight | Justificativa |
|---|---:|---|
| `ipip-neo-120` | **0.40** | Big Five como espinha dorsal — captura quem a pessoa é |
| `disc-adapt` | **0.10** | Sub-conjunto do Big Five, mais resolução narrativa |
| `label-guep` | **0.0** | Derivado, narrativa pura |
| `gallup-adapt` | **0.10** | Resolução de talentos, redundância parcial com Big Five |
| `dark-triad` | **0.05** | Restrito a senior, alto cuidado interpretativo |
| `hogan-adapt` | **0.10** | Derivado, acionabilidade de risco em liderança |
| `arquetipos` | **0.10** | Identidade simbólica |
| `eneagrama` | **0.10** | Identidade motivacional |
| `mbti-like` | **0.0** | Derivado de Big Five (já decidido em Marco 1) |
| `bigfive-short` | **0.05** | Versão curta IPIP-50, baixo peso quando IPIP-NEO já existe |
| **TOTAL** | **1.00** | |

🚨 Pesos parametrizáveis por **tipo de vaga** (atendimento prioriza A+E; liderança prioriza C+Hogan; tech prioriza O+Big Five).

### 🚨 Sobre LGPD e CFP

- **Camada 4 (Dark Triad + Hogan) deve ter consent explícito separado** — checkbox dedicado "Aceito participar das avaliações de risco interpessoal" antes de aplicar
- **Opt-out granular**: candidato pode aceitar Camadas 1-3 mas recusar Camada 4. Sistema NÃO bloqueia a candidatura por isso.
- **Nenhum dos instrumentos da Kavuka é "teste psicológico"** no sentido CFP — todos são "medidas de auto-relato sobre estilo comportamental". Linguagem padrão em todo UX.
- **Vocabulário clínico bloqueado por teste automatizado** — já implementado para IPIP, replicar para todos os 5 do Marco 2.

### 🚨 Sobre marca/INPI

Antes de qualquer divulgação maior, registrar no INPI Brasil (Classe 42 — software):
1. **KYID** (já discutido)
2. **Label GUÉP** + os 8-12 nomes de rótulos
3. **Score Humano**
4. Verificar disponibilidade dos nomes das 12 forças da versão Gallup adaptada
5. Verificar disponibilidade dos nomes das 11 escalas Hogan adaptadas em PT-BR

Custo total: ~R$ 4.000-5.000 em taxas INPI para todos. Trivial vs. risco de clone.

---

## Resolução consolidada: perfis GUÉP × DISC

🚨 **Decisão final** (alinha 4 dossiês):

- **Macro-perfis GUÉP (Executor / Estrategista / Operador / Influenciador)** = output do **Label GUÉP**
- **DISC adaptado** = medida de **estilo de comunicação** (D/I/S/C), não classificação operacional
- **Naming clarification**: nunca usar "Executor" como tradução PT-BR de "D" do DISC — gera confusão semântica com macro-perfil GUÉP. Tradução proposta para o DISC PT-BR Kavuka: **D = Decisivo, I = Influente, S = Estável, C = Conforme**.

Atualizar contrato e UX em conformidade.

---

## Próximos passos (depois do Marco 2)

1. **Implementação técnica** dos 5 microsserviços em `services/{slug}/` seguindo o padrão IPIP-NEO-120 já estabelecido
2. **Marco 3** — Camadas 5 (Arquétipos, Eneagrama) e 6 (Score Humano completo, Avaliação contínua)
3. **Validação BR** — piloto interno N=30 (GUÉP) → externo N=200 (clientes piloto) → N=500 (norma BR)
4. **Registro INPI** das marcas críticas
5. **Implementar campos novos do contrato:** `mode`, `depends_on`, `requires_seniority`, `forces_human_review`. Bumpar para `CONTRACT_VERSION = "1.2.0"`.

---

> **Marco 2 fechado.** Kavuka tem agora a fundação científica e legal para implementar os 5 instrumentos da Camada 2-4 sem ficar refém de licenças proprietárias e com blindagem CFP/LGPD/marca.
