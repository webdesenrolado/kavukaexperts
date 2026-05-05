# Dossiê 05 — Hogan HDS Adaptado

> Marco 2 · Camada 4 (Risco) · Instrumento adaptado autoral GUÉP — substitui o Hogan Development Survey (HDS) proprietário por uma medida derivada de instrumentos abertos já implementados pela Kavuka.

---

## 1. Resumo executivo

**Hogan HDS adaptado** é um instrumento de **risco comportamental sob estresse** — mede 11 padrões de comportamento contraproducente que aparecem quando a pessoa está sob pressão, fadiga ou frustração. É o instrumento **mais robusto cientificamente** para predizer "derailment" (fracasso de líder em transição), e por isso é amplamente usado em sucessão executiva e desenvolvimento de liderança.

🚨 **Decisão arquitetural crítica:** o Hogan HDS original é **proprietário Hogan Assessment Systems** (1997) — itens, escalas e algoritmos têm copyright forte e licenciamento caro (~USD 200-400 por aplicação institucional). A Kavuka **NÃO** vai reproduzir o HDS original. Em vez disso, propomos uma versão **derivada** (`hogan-derived`) que computa as 11 dimensões a partir de:
- **IPIP-NEO-120** (já implementado, domínio público) — facetas de Neuroticismo + Extroversão + Conscienciosidade
- **Dark Triad** (dossiê 04) — Maquiavelismo + Narcisismo + Psicopatia subclínica
- **HEXACO Honesty-Humility** (público) — para complementar o que IPIP-NEO não captura

🚨 **`score_weight_in_human_score: 0.10`** — peso modesto. Derivação a partir de instrumentos já capturados gera variância nova (combinação) mas não enorme. Justifica-se mais pela **acionabilidade narrativa** do que por adicionar resolução.

🚨 **Aplicação restritiva por design:** Hogan-derived **só é exibido para vagas de liderança ou alto stake** (`seniority: ["senior", "especialista", "lideranca"]`). Em vagas júnior/pleno operacionais, o instrumento permanece oculto. Razão: alto risco reputacional para o candidato + pouca utilidade preditiva fora de roles de exposição.

---

## 2. Status legal e licenciamento

| Item | Situação |
|---|---|
| **Hogan HDS original** | © Hogan Assessment Systems, Inc. 1997-presente. Marca registrada `Hogan Development Survey®`. |
| **Itens HDS originais** | Propriedade intelectual estrita — **não reproduzir literalmente**. |
| **Banco de itens autorais Kavuka** | © GUÉP / Kavuka 2026 — autorais. Inspiração metodológica permitida. |
| **Algoritmo derivado a partir de IPIP-NEO + Dark Triad** | Domínio público + autoral GUÉP. **Sem dependência licenciada.** |
| **Marca "Hogan-derived"** | 🚨 **Evitar a palavra "Hogan" no produto comercial.** Sugestão de UX: `Estilo sob pressão` ou `Risco interpessoal sinalizado` ou `Derailers Kavuka`. |

🚨 **Recomendação legal forte:** mesmo a versão derivada **não usar a palavra "Hogan"** no UX consumer-facing — só na documentação técnica interna. A taxonomia das 11 dimensões pode ser referenciada conceitualmente, mas com nomes próprios em pt-BR.

🚨 **CFP:** Hogan HDS **não consta no SATEPSI**. A versão derivada Kavuka **não é teste psicológico** — é "medida de auto-relato sobre estilo interpessoal sob pressão". Mesmo princípio aplicado ao Dark Triad (dossiê 04).

🚨 **ADA / EEOC (EUA):** Hogan HDS é considerado pela EEOC como possivelmente "medical exam" se usado pra screening pre-employment, dado seu fundamento em personality disorders. Mesma blindagem do Dark Triad: nunca apresentar como diagnóstico, sempre como "estilo".

---

## 3. Modelo teórico

### 3.1 Origem

**Hogan & Hogan (1997)** — *Hogan Development Survey Manual*, Hogan Assessment Systems. Construído sobre a observação clínica de que personalidades "derailing" sob estresse organizacional **mapeiam para clusters de transtornos de personalidade do DSM-IV** (Cluster A — odd/eccentric, Cluster B — dramatic, Cluster C — anxious) **em níveis subclínicos**.

🚨 **Insight central:** todo "talento" leva embutido um "risco" — quando levado ao extremo ou sob pressão, vira problema. Ex: "atenção a detalhes" (talento Conscienciosidade alto) vira "perfeccionismo paralisante" (Diligent derailer).

### 3.2 As 11 escalas (3 clusters comportamentais)

#### Cluster "Moving Away from People" (afastamento — sob estresse, isola)

| # | Escala original | Nome Kavuka proposto | Sinal de | Mapeia em (DSM-IV) |
|---|---|---|---|---|
| 1 | Excitable | Reativo emocional | Volatilidade, raiva, frustração | Borderline (subclínico) |
| 2 | Skeptical | Desconfiado | Cinismo, atribuição hostil | Paranoid (subclínico) |
| 3 | Cautious | Avesso ao risco | Indecisão, evitação | Avoidant (subclínico) |
| 4 | Reserved | Distante | Frieza, pouca empatia explícita | Schizoid (subclínico) |
| 5 | Leisurely | Passivo-resistente | Ressentimento, "sim mas não faz" | Passive-Aggressive |

#### Cluster "Moving Against People" (avanço — sob estresse, agride)

| # | Escala original | Nome Kavuka proposto | Sinal de | Mapeia em |
|---|---|---|---|---|
| 6 | Bold | Autoconfiança extrema | Arrogância, sobre-estimação | Narcissistic (subclínico) |
| 7 | Mischievous | Manipulador-encantador | Risco, regras como sugestão | Antisocial (subclínico) |
| 8 | Colorful | Performático | Drama, busca de atenção | Histrionic (subclínico) |
| 9 | Imaginative | Idealista-desconectado | Fantasia, ideias estranhas | Schizotypal (subclínico) |

#### Cluster "Moving Toward People" (aproximação — sob estresse, agrada/conforma)

| # | Escala original | Nome Kavuka proposto | Sinal de | Mapeia em |
|---|---|---|---|---|
| 10 | Diligent | Perfeccionista | Microgestão, paralisia analítica | Obsessive-Compulsive |
| 11 | Dutiful | Conformista | Dependência hierárquica, evita conflito | Dependent (subclínico) |

🚨 **Importante:** os "derailers" são **traços normais levados ao extremo**, não transtornos. A maior parte das pessoas tem 1-3 escalas em zona elevada — isso é normal. O sinal preocupante é quando **3+ escalas estão em zona muito alta simultaneamente** (perfil "high-risk constellation").

### 3.3 Conexão com Big Five e Dark Triad

Pesquisa peer-review (de Vries, Wiernik et al., 2016 — *Hogan Personality Inventory and HDS as Predictors of Workplace Performance*) demonstra que:

- **Excitable, Cautious, Leisurely** correlacionam fortemente com **Neuroticismo alto** (IPIP-NEO N1, N3, N6)
- **Reserved** correlaciona com **Extroversão baixa** (IPIP-NEO E1, E2)
- **Bold, Mischievous** correlacionam com **Dark Triad** (Narcisismo, Psicopatia subclínica)
- **Diligent, Dutiful** correlacionam com **Conscienciosidade alta** (IPIP-NEO C2, C6)
- **Skeptical** correlaciona com **Amabilidade baixa** (IPIP-NEO A1 Trust)
- **Colorful, Imaginative** correlacionam parcialmente com **Abertura alta + Extroversão alta**

🚨 **Implicação prática:** rodar Hogan **em paralelo** ao IPIP-NEO + Dark Triad é **redundante** em termos de variância. Por isso a versão Kavuka é **derivada**, não independente.

### 3.4 Validação preditiva

Hogan HDS tem das mais robustas validações preditivas em psicometria organizacional para **falha de líder** (Hogan, J., Hogan, R., & Kaiser, R. B., 2010). Meta-análise mostra correlações de 0.20-0.35 com performance gerencial e 0.30+ com derailment. Isso é **alto** para psicometria.

🚨 **Mas:** a validade preditiva é **para roles de liderança**, não para roles operacionais. Não estender uso indevidamente.

---

## 4. Estrutura de itens

### 4.1 Modo `derived` (default, recomendado)

🚨 **Decisão crítica:** o Hogan-derived **não tem banco de itens próprio.** É uma **função pura** sobre os outputs de IPIP-NEO-120 + Dark Triad.

```
hogan-derived(ipip_facets, dark_triad_scores) → 11 escalas
```

**Vantagens:**
- Zero fadiga adicional ao candidato (não responde mais nada)
- Zero risco psicométrico (não há nada novo pra validar)
- Zero risco legal (não criamos "mais um teste")
- **Mesmo princípio do Label GUÉP** (dossiê 02) — labeling layer derivativa

### 4.2 Modo `direct` (opcional, futuro)

Para cliente enterprise que demande questionário próprio:
- **66 itens autorais GUÉP** (6 itens × 11 escalas)
- Likert 5 pontos
- Tempo estimado: 12-15 minutos
- Itens construídos por casamento entre conceito Hogan + verbalizações IPIP públicas (ipip.ori.org)

🚨 **Não reproduzir os itens HDS originais.** Os exemplos abaixo são **autorais GUÉP estilo Hogan** ou IPIP públicos:

```
Reativo emocional (autoral, estilo Hogan):
  - "Quando algo dá errado, é difícil pra mim deixar pra lá rapidamente."
  - "Em momentos de pressão, perco a paciência mais rápido do que gostaria."

Desconfiado (IPIP A1 reverse, público — ipip.ori.org/AB5C.htm):
  - "Confio nos outros." (REVERSO)
  - "Tendo a desconfiar das motivações alheias."

Bold (autoral, estilo Narcisismo subclínico):
  - "Geralmente sou a pessoa mais qualificada na sala."
  - "Tenho talento natural pra liderar quando a situação exige."

Diligent (IPIP C5 + autoral):
  - "Reviso meu trabalho várias vezes antes de entregar."
  - "Tenho dificuldade pra aceitar quando algo está 'bom o suficiente'."
```

🚨 Tradução acima é **proposta de partida** — validar com psicometrista BR antes de produção.

---

## 5. Lógica de scoring

### 5.1 Modo derived

```typescript
function deriveHoganScales(ipip: IpipScoresPayload, darkTriad: DarkTriadScores): HoganDerivedScales {
  const N = ipip.domains.N.z_score;       // Neuroticismo
  const E = ipip.domains.E.z_score;
  const A = ipip.domains.A.z_score;
  const C = ipip.domains.C.z_score;
  const O = ipip.domains.O.z_score;

  const facets = ipip.facets;             // 30 facetas IPIP-NEO

  return {
    excitable:    weightedZ([N, facets.n2_anger, facets.n6_vulnerability], [0.4, 0.3, 0.3]),
    skeptical:    weightedZ([-A, -facets.a1_trust, darkTriad.machiavellianism], [0.3, 0.4, 0.3]),
    cautious:     weightedZ([N, -E, -facets.c5_self_discipline], [0.4, 0.3, 0.3]),
    reserved:     weightedZ([-E, -facets.e1_friendliness, -facets.a3_altruism], [0.4, 0.3, 0.3]),
    leisurely:    weightedZ([-A, facets.n2_anger, -facets.c3_dutifulness], [0.3, 0.4, 0.3]),
    bold:         weightedZ([darkTriad.narcissism, E, -N], [0.5, 0.3, 0.2]),
    mischievous:  weightedZ([darkTriad.psychopathy, -A, O], [0.5, 0.3, 0.2]),
    colorful:     weightedZ([E, facets.e6_cheerfulness, darkTriad.narcissism], [0.4, 0.3, 0.3]),
    imaginative:  weightedZ([O, facets.o1_imagination, -C], [0.4, 0.4, 0.2]),
    diligent:     weightedZ([C, facets.c2_orderliness, facets.c6_cautiousness], [0.4, 0.3, 0.3]),
    dutiful:      weightedZ([A, facets.c3_dutifulness, -darkTriad.machiavellianism], [0.4, 0.4, 0.2]),
  };
}
```

### 5.2 Output normalizado

```json
{
  "scales": {
    "excitable":    { "z": 0.42, "level": "average",  "label_pt": "Reativo emocional" },
    "skeptical":    { "z": -0.31, "level": "low",     "label_pt": "Desconfiado" },
    "cautious":     { "z": 1.85, "level": "very_high", "label_pt": "Avesso ao risco" },
    "reserved":     { "z": -0.18, "level": "average", "label_pt": "Distante" },
    "leisurely":    { "z": 0.05, "level": "average",  "label_pt": "Passivo-resistente" },
    "bold":         { "z": -0.92, "level": "low",     "label_pt": "Autoconfiança extrema" },
    "mischievous":  { "z": -1.42, "level": "very_low", "label_pt": "Manipulador-encantador" },
    "colorful":     { "z": 0.66, "level": "high",     "label_pt": "Performático" },
    "imaginative":  { "z": 0.20, "level": "average",  "label_pt": "Idealista-desconectado" },
    "diligent":     { "z": 1.34, "level": "high",     "label_pt": "Perfeccionista" },
    "dutiful":      { "z": 1.55, "level": "very_high", "label_pt": "Conformista" }
  },
  "high_risk_count": 2,        // escalas em zona "very_high"
  "high_risk_constellation": false,  // true se 3+ very_high
  "score_weight_in_human_score": 0.10,
  "norm_source": "computed_from_ipip_dark_triad",
  "mode": "derived",
  "depends_on": ["ipip-neo-120", "dark-triad"]
}
```

### 5.3 Limiares de risco

- **z < 0.5**: zona normal, derailer dormente
- **0.5 ≤ z < 1.0**: zona ativa, derailer ocasional
- **1.0 ≤ z < 1.5**: zona alta, derailer recorrente
- **z ≥ 1.5**: zona muito alta, derailer crônico

🚨 **Constelação de alto risco** (3+ escalas em z ≥ 1.5) → flag `high_risk_constellation: true` → UI exibe sinalização específica com **revisão humana obrigatória** antes de qualquer decisão.

---

## 6. Interpretação

### 6.1 Faixas e narrativa

Para cada escala, narrativa em **par com Hogan original**: descreve "luz" (talento subjacente) + "sombra" (derailer sob estresse).

**Exemplo — `cautious` (Avesso ao risco) em zona alta:**

> **Luz:** Você toma decisões com cuidado e raramente se mete em furada por impulso. Em ambientes de risco real (financeiro, regulatório, jurídico), seu cuidado é diferencial.
>
> **Sombra sob pressão:** Em momentos de incerteza ou pressão por velocidade, você pode ficar paralisado(a) — preferindo não decidir a decidir errado. Equipes de alta velocidade podem perceber como "trava".
>
> **Pra desenvolver:** Em decisões reversíveis (90% delas são), permita-se errar barato e ajustar rápido. Distinguir "risco real" de "incerteza desconfortável" é a chave.

### 6.2 Watchouts comuns

🚨 **Linguagem responsável** — proibido:
- "Você é narcisista" → use "Em zona de pressão, você tende a sobre-estimar suas capacidades"
- "Você tem traço psicopático" → use "Você prioriza eficácia sobre regras quando o stake é alto"
- "Você é borderline" → use "Sua reatividade emocional é alta — pode ser um sinal valioso quando bem direcionado"

🚨 **Forer/Barnum effect** — narrativa precisa ser **específica o suficiente** que pessoa em outro perfil NÃO se reconheça. Mitigação: textos mais longos com âncoras concretas (cenários de trabalho específicos), não horoscopia.

🚨 **Test-retest e estado emocional**: Hogan HDS tem test-retest médio (~0.65-0.75 em retest de 6 meses). Quem está em pico de estresse pessoal pode ter perfil temporariamente alterado. Mitigação: roadmap de re-aplicação a cada 12 meses.

### 6.3 Relatório híbrido (auxiliar Score Humano)

O Hogan-derived contribui pro Score Humano via **redutor**, não somador:
- Se candidato tem `high_risk_constellation: true`, Score Humano sofre redução de 5-10 pontos com aviso explícito ao recrutador
- Se nenhum derailer em zona crítica, contribuição neutra

---

## 7. Aplicação no contexto Kavuka

### 7.1 `score_weight_in_human_score`: **0.10**

Modesto e justificado:
- Derivativo (não adiciona variância nova primária)
- Mas adiciona **acionabilidade narrativa** (descreve risco específico, não só "alto neuroticismo")
- Em vagas de liderança, o peso pode ser elevado para 0.15 condicionalmente (parametrizar por vaga)

### 7.2 `norm_source`: `"computed_from_ipip_dark_triad"`

Não há norma populacional independente — as normas vêm dos instrumentos antecedentes. Ao acumular base BR Kavuka (N≥1000), atualizar para `"guep_br_pilot_v1"` e calibrar limiares localmente.

### 7.3 Visibilidade restrita por vaga

**Default:** Hogan-derived é computado mas **não exibido** na UI do recrutador.

**Exibido apenas se:**
- Vaga tem `seniority IN ["senior", "especialista", "lideranca"]` E
- Vaga tem `assessmentsJson` incluindo `"hogan-adapt"` explicitamente

🚨 **Razão:** evita uso indevido em vagas operacionais onde o instrumento não tem validade preditiva e cria viés contra candidatos perfeitamente aptos.

### 7.4 Integração com perfis GUÉP (Executor/Estrategista/Operador/Influenciador)

O Hogan-derived **não classifica** em perfil GUÉP — é camada de **risco**, não de macroperfil. Mas certos derailers correlacionam com certos perfis:
- Bold + Mischievous altos → comum em Executores extremos (precisa de governança)
- Cautious + Diligent altos → comum em Operadores extremos (precisa de delegação)
- Excitable + Skeptical altos → comum em Influenciadores extremos (precisa de regulação emocional)
- Imaginative + Reserved altos → comum em Estrategistas extremos (precisa de aterrissagem)

Isso vira **lente de desenvolvimento**, não rótulo de seleção.

### 7.5 Roadmap de implementação

1. **Fase 1 (curto prazo):** modo `derived` — implementação trivial assim que IPIP-NEO + Dark Triad estiverem em produção. Apenas matemática.
2. **Fase 2 (médio prazo):** banco de itens autorais GUÉP de 66 itens (modo `direct`) — co-criar com psicólogo BR e validar em piloto N=200.
3. **Fase 3 (longo prazo):** calibração com normas BR, validação preditiva contra performance real (após N=500 contratações com follow-up de 6+ meses).

---

## 8. Referências

1. **Hogan, R., & Hogan, J.** (1997). *Hogan Development Survey manual*. Hogan Assessment Systems. — manual original do instrumento.
2. **Hogan, J., Hogan, R., & Kaiser, R. B.** (2010). *Management derailment*. In S. Zedeck (Ed.), *American Psychological Association handbook of industrial and organizational psychology* (Vol. 3, pp. 555-575). APA. — síntese da pesquisa de derailment com HDS.
3. **De Vries, R. E., Wiernik, B. M., Hülsheger, U. R., & Stark, A.** (2016). *The Hogan Development Survey and the Big Five: A meta-analytic comparison*. Personality and Individual Differences, 100, 11-19. — meta-análise mostrando overlap HDS × Big Five.
4. **Furnham, A., Trickey, G., & Hyde, G.** (2012). *Bright aspects to dark side traits: Dark side traits associated with work success*. Personality and Individual Differences, 52(8), 908-913. — luz/sombra dos derailers.
5. **Kaiser, R. B., LeBreton, J. M., & Hogan, J.** (2015). *The dark side of personality and extreme leader behavior*. Applied Psychology, 64(1), 55-92. — derailers em níveis executivos.
6. **DSM-IV-TR** (American Psychiatric Association, 2000) — referência diagnóstica para clusters A/B/C que inspiram a taxonomia HDS. Apenas referência; Kavuka **não diagnostica**.
7. **IPIP** (https://ipip.ori.org/) — banco público de itens para construção do modo `direct`.
8. **HEXACO Personality Inventory** (https://hexaco.org/) — alternativa pública ao IPIP que captura Honesty-Humility (overlap forte com Mischievous derailer).

---

## Próximos passos para implementação

1. **Implementar modo `derived`** em `services/hogan-adapt/src/derive.ts` — função pura sobre IPIP + Dark Triad
2. **UX condicional**: exibir resultado apenas para vagas elegíveis (parametrizar por `seniority` + `assessmentsJson`)
3. **Co-criar narrativas** das 11 escalas com psicólogo organizacional BR
4. **Aviso de visibilidade restrita**: documentar no Termo de Uso da Kavuka que esse instrumento só aparece pra roles de liderança/alto stake
5. **Modo `direct`**: roadmap longo, com piloto e validação BR antes de produção
6. **Integração com Score Humano**: implementar redutor por `high_risk_constellation` (não somador)

---

## Decisões críticas que afetam o projeto

🚨 **Hogan-derived é computado, NÃO exibido por default.** Visibilidade controlada por nível da vaga + flag explícita do recrutador. Documentar no Termo de Uso.

🚨 **NUNCA usar a palavra "Hogan" no produto consumer-facing.** Apenas em documentação técnica interna. Marcas comerciais sugeridas: `Estilo sob pressão`, `Risco interpessoal sinalizado`, `Padrões de derailment`, ou simplesmente `Sinalização de risco`.

🚨 **Constelação de alto risco** (3+ escalas em z ≥ 1.5) **força revisão humana** antes de qualquer decisão de não-prosseguimento. UI deve bloquear "Rejeitar" sem justificativa textual nesses casos.

🚨 **Hogan-derived NÃO é diagnóstico clínico.** Sempre apresentar como "estilo comportamental sob pressão" — nunca como transtorno, condição clínica ou personalidade patológica.

🚨 **Test-retest médio implica recência**: re-aplicar instrumentos antecedentes (IPIP + Dark Triad) a cada 12 meses pra manter Hogan-derived atualizado. Pessoas mudam — especialmente sob terapia, mudança de fase de vida, mudança de contexto profissional.

---

## Recomendações arquiteturais

1. **Pasta `services/hogan-adapt/`** com modos `derive` (default) e `apply` (modo direct futuro)
2. **Campo `requires_seniority` no contrato** — instrumentos podem declarar nível mínimo de vaga elegível
3. **Trigger de revisão humana automática** — qualquer instrumento pode emitir flag que bloqueia rejeição automatizada (Score Humano UI deve respeitar)
4. **Modo `derived` como padrão arquitetural** para futuros instrumentos correlacionados (HEXACO honesty-humility, MBTI-like, etc.) — economiza fadiga + evita dupla contagem
