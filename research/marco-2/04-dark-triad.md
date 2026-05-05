# Dossiê 04 — Dark Triad (Sinalização de Risco Comportamental)

> Marco 2 · Camada 4 (Risco) · Instrumento de **alta sensibilidade reputacional** — output em sinalizadores qualitativos, NÃO ranking, NÃO gate, NUNCA termos clínicos.

---

## 🚨 AVISO CRÍTICO — leia antes de implementar

Este instrumento sinaliza **tendências subclínicas** associadas a comportamento contraproducente no trabalho. **Nunca:**
1. **Reproduzir vocabulário clínico** ("psicopata", "narcisista", "transtorno", "patologia", "personalidade dark"). 🚨
2. **Usar como gate único de seleção.** O instrumento NÃO diagnostica nada. Ele sinaliza.
3. **Aplicar sem consentimento informado específico** (LGPD art. 7º + art. 11), distinto do consentimento dos demais instrumentos.
4. **Aplicar sem revisão humana obrigatória** antes de qualquer comunicação ao recrutador (LGPD art. 20).
5. **Tratar como "medida psicológica"** — ele é **sinalização de risco comportamental** baseada em auto-relato de candidato adulto.
6. **Compartilhar resultado com terceiros** sem ordem judicial ou consentimento adicional do candidato.

🚨 **Nos EUA, instrumentos que rastreiam "psicopatologia" caem na proibição da ADA (Americans with Disabilities Act)** — EEOC já multou empresas por uso indevido de personality tests análogos ao MMPI ([EEOC — Employment Tests and Selection Procedures](https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures); [Penn State Law Review, 2021](https://www.pennstatelawreview.org/wp-content/uploads/2021/03/Article-2-Timmons-Pre-Employment-Personality-Tests.pdf)). No Brasil, a CFP **não permite uso de testes psicológicos não-aprovados pelo SATEPSI para fins clínicos**, e o Dark Triad **não consta no SATEPSI**. Portanto: o `dark-triad` Kavuka é **expressamente NÃO um teste psicológico** — é uma **medida de auto-relato sobre estilo interpessoal**.

---

## 1. Resumo executivo

A "Tríade Sombria" (Dark Triad) é uma constelação proposta por Paulhus & Williams (2002) que agrega três traços socialmente aversivos **subclínicos** — Maquiavelismo, Narcisismo subclínico, Psicopatia subclínica — que, embora correlacionados (r ≈ 0,30–0,50 entre si), são distintos da Amabilidade-baixa e da Honesty-Humility-baixa do HEXACO ([Paulhus & Williams, 2002, *J. Research in Personality*](https://www.sciencedirect.com/science/article/abs/pii/S0092656602005056)). Dois instrumentos curtos peer-reviewed dominam a literatura: **Dirty Dozen** (Jonason & Webster, 2010 — 12 itens) e **SD3 Short Dark Triad** (Jones & Paulhus, 2014 — 27 itens). Em 2020, Paulhus et al. propuseram a **Dark Tetrad** adicionando Sadismo (SD4, validado para PT-BR em 2023 — [Hogrefe](https://econtent.hogrefe.com/doi/10.1027/2698-1866/a000100)). Ambos os instrumentos têm limitações sérias: **internal consistency moderada** (α 0,69–0,79 nas subescalas Dirty Dozen — [Maples-Lamkin et al., 2014](https://pubmed.ncbi.nlm.nih.gov/24274044/)), **validade de psicopatia particularmente fraca** ([Miller et al., 2012, *Assessment*](https://pubmed.ncbi.nlm.nih.gov/22612650/) "examination of the Dirty Dozen measure of psychopathy: a cautionary tale"), e **forte sobreposição com baixa Honesty-Humility do HEXACO** ([Howard & Van Zandt, 2020 — meta-analysis](https://www.sciencedirect.com/science/article/abs/pii/S0092656620300702) — "Dark Triad traits replicate Honesty-Humility variance almost perfectly"). Recomendação Kavuka: **construir microsserviço `dark-triad` autoral** baseado em itens IPIP Honesty-Humility-baixa + itens autorais GUÉP estilo Dirty Dozen, **renomeado externamente como "Estilo Interpessoal Direto"** ou **"Sinalizadores de Distanciamento Empático"** — output qualitativo "atenção/clareza/aprofundamento" sem score numérico ranqueável. `score_weight_in_human_score: 0.05–0.10` (baixo, como sinalizador de risco binário, não como traço dimensional). Aplicação restrita a **vagas senior, fiduciárias ou de alto stake** (executivos, finanças com poder de assinatura, security clearance, segurança privada, healthcare com contato direto) — **não** aplicado em vagas operacionais ou júnior.

🚨 **Decisão crítica:** Dark Triad **só faz sentido se Kavuka tiver capacidade técnica e jurídica para revisão humana qualificada**. Sem revisão humana, **não implantar**. É preferível não ter o instrumento do que tê-lo mal usado.

---

## 2. Status legal e licenciamento

### 2.1 Camadas legais

| Item | Situação |
|---|---|
| **Conceito "Dark Triad"** | Acadêmico, livre de uso (Paulhus & Williams, 2002 — termo descritivo) |
| **Dirty Dozen — 12 itens (Jonason & Webster, 2010)** | Publicados na íntegra em paper peer-review ([PubMed 20528068](https://pubmed.ncbi.nlm.nih.gov/20528068/)) — em geral autores acadêmicos não exigem licença para uso em pesquisa, mas para **uso comercial em ATS** o status é **zona cinza**. O paper original não declara licença explícita |
| **SD3 — 27 itens (Jones & Paulhus, 2014)** | Itens publicados em apêndice do paper ([PsychAssessment 2014](https://www2.psych.ubc.ca/~dpaulhus/research/DARK_TRAITS/ARTICLES/ASSESST.2014.with.Jones.pdf)) — Paulhus disponibiliza versões 1.1.1 com instruções de uso; **não há cobrança documentada para uso acadêmico, mas para uso comercial recomenda-se contato direto com Paulhus** |
| **SD4 — adição Sadismo, Paulhus et al. (2020)** | Paper peer-review; uso comercial deve ser confirmado com autores |
| **IPIP itens correspondentes** | Domínio público total. IPIP tem itens equivalentes a Honesty-Humility-baixa, antagonismo, etc. ([ipip.ori.org](https://ipip.ori.org/)) |

🚨 **Recomendação legal conservadora:** **não reproduzir** os 12 itens Dirty Dozen nem os 27 itens SD3 literalmente em produto comercial Kavuka. Construir um banco autoral GUÉP de 15-20 itens **inspirado na metodologia Dirty Dozen/SD3** mas usando linguagem própria + itens IPIP públicos.

### 2.2 Risco regulatório (Brasil)

| Lei | Risco | Mitigação |
|---|---|---|
| **LGPD art. 11** (dados sensíveis) | Alto se interpretado como dado de saúde mental | NÃO classificar como dado sensível — usar linguagem de "estilo interpessoal", não de saúde |
| **LGPD art. 20** (decisão automatizada) | Alto — candidato tem direito a revisão humana | Implementar fluxo: nenhum output Dark Triad chega ao recrutador sem revisão humana qualificada |
| **CDC** (Código Defesa do Consumidor) — discriminação | Médio — pode haver alegação de "discriminação por personalidade" | UI de contestação reforçada, direito a refazer, transparência sobre uso |
| **CFP Resolução 31/2022** (testes psicológicos) | Alto se apresentado como teste psicológico | Apresentar como **sinalização comportamental de auto-relato**, não como teste psicológico clínico — linguagem descritiva, sem pretensão diagnóstica |
| **CLT art. 442 e seguintes** (vínculo trabalhista) | Médio — pode haver alegação de discriminação na contratação | Triangulação com outros instrumentos, **nunca** decisão única baseada em Dark Triad, registro de revisão humana |

### 2.3 Risco regulatório (mercado internacional, futuro)

Se Kavuka for vendido para clientes nos EUA:

🚨 **ADA — alto risco** — instrumentos que rastreiam "psicopatologia" são considerados "medical exam" pela EEOC. Se o output do Kavuka for interpretado como "indicação de transtorno de personalidade", há **risco de processo classe** ([Penn State Law Review, 2021 — Algorithmic Bias and the ADA](https://www.pennstatelawreview.org/wp-content/uploads/2021/03/Article-2-Timmons-Pre-Employment-Personality-Tests.pdf); [Bloomberg Law, 2024](https://news.bloomberglaw.com/us-law-week/pre-hire-personality-tests-set-legal-challenges-for-employers)). Mitigação: nunca usar termos clínicos, sempre ratificar como "estilo interpessoal", documentação clara de que NÃO é teste de saúde.

🚨 **GDPR (UE)** — art. 22 (decisão automatizada significativa) é mais estrito que LGPD art. 20. Implementar mesmo fluxo de revisão humana, com possibilidade de opt-out total da camada 4.

### 2.4 Recomendação Kavuka v1.0

> **Construir `dark-triad` v1.0 com 15-20 itens autorais GUÉP**, output em **3 sinalizadores qualitativos** (não numéricos), com **revisão humana obrigatória**, aplicado **apenas em vagas de alto stake** com **consentimento explícito específico** (separado do consentimento geral).

**Renomeação externa proposta:**
- ✅ "Sinalizadores de estilo interpessoal direto"
- ✅ "Mapa de tendências comportamentais sob pressão"
- ✅ "Análise de fit ético-relacional para posições fiduciárias"
- 🚨 **Nunca**: "Dark Triad", "Tríade Sombria", "Psicopatia", "Maquiavelismo" (no front-end)

Internamente (auditoria, JSON, documentação técnica): manter `instrument: "dark_triad"` para rastreabilidade científica.

---

## 3. Modelo teórico

### 3.1 Origem: Paulhus & Williams (2002)

Paulhus e Williams identificaram que três traços socialmente aversivos **subclínicos** compartilham um núcleo comum (manipulativeness, callousness, deceitfulness) mas têm também variância distinta:

| Traço | Núcleo conceitual | Diferenciador |
|---|---|---|
| **Maquiavelismo** | Manipulação estratégica para fins próprios | Pragmatismo cínico, planejamento de longo prazo |
| **Narcisismo subclínico** | Grandiosidade, busca por admiração | Autoestima inflada, vulnerabilidade quando contestado |
| **Psicopatia subclínica** | Distanciamento empático, impulsividade | Baixo medo, baixo remorso, baixa ansiedade |

🚨 **"Subclínico" é a palavra-chave.** Esses traços, em populações normais, são **dimensões contínuas**, não categorias binárias. A psicopatia clínica (escore ≥ 30 no PCL-R, Hare 1991) é raríssima (~0,5–1% da população) e exige avaliação profissional. O Dark Triad em RH mede **distribuição normal de traços leves**, não diagnóstico.

### 3.2 Dark Tetrad (Paulhus, 2014–2020)

A revisão posterior adicionou **Sadismo subclínico** — prazer em causar desconforto a outros (não físico necessariamente; pode ser sutil/social) — formando a Dark Tetrad. SD4 (Short Dark Tetrad) tem 28 itens, validado em vários países incluindo Brasil ([Cross-cultural Adaptation of SD4 in the Brazilian Context, 2023](https://econtent.hogrefe.com/doi/10.1027/2698-1866/a000100)).

🚨 **Recomendação Kavuka:** começar com **Dark Triad (3 dimensões)**, não Tetrad — a 4ª dimensão (Sadismo) tem maior risco reputacional e é mais difícil de operacionalizar sem itens explícitos sobre "prazer em causar dano" que são desconfortáveis em UX. SD4 fica como roadmap futuro.

### 3.3 Convergência com HEXACO Honesty-Humility

🚨 **Achado crítico:** meta-análise de [Howard & Van Zandt, 2020](https://www.sciencedirect.com/science/article/abs/pii/S0092656620300702) mostra que **Dark Triad replica quase perfeitamente a variância de Honesty-Humility-baixa do HEXACO**. Implicação: rodar Dark Triad **em paralelo** ao HEXACO Honesty-Humility é **redundante**.

**Decisão arquitetural:** Kavuka pode escolher entre:

- **Opção A — Dark Triad explícito** (3 sinalizadores específicos: Maquiavelismo / Narcisismo / Psicopatia subclínica). Vantagem: nomenclatura reconhecida, granularidade. Desvantagem: alto risco reputacional, label clínico.
- **Opção B — HEXACO Honesty-Humility (rebatizado "Integridade Interpessoal")**. Vantagem: linguagem positiva (mede integridade alta — apenas valores baixos sinalizam atenção), itens IPIP-HEXACO públicos, validação BR existe ([Adaptation of HEXACO-PI-R to Brazilian sample, 2019](https://www.sciencedirect.com/science/article/abs/pii/S0191886919302740)). Desvantagem: nomenclatura menos reconhecida, granularidade menor.

**Recomendação:** **implementar AMBOS como instrumentos separados** — `hexaco-integridade` (Camada 1, peso médio) como medida positiva contínua, e `dark-triad` (Camada 4, peso baixo) **opcional** apenas em vagas de alto stake. O HEXACO faz o trabalho normativo; o Dark Triad faz o trabalho de **flag para escrutínio adicional**.

### 3.4 Convergência com Big Five

Dark Triad também correlaciona moderadamente com:
- **Amabilidade baixa** (todos os 3 — r ≈ −0,3 a −0,5)
- **Conscienciosidade baixa** (Psicopatia em particular)
- **Neuroticismo alto** (Narcisismo vulnerável)
- **Extroversão alta** (Narcisismo grandioso)

[(Howard & Van Zandt, 2020)](https://www.sciencedirect.com/science/article/abs/pii/S0092656620300702); [(Distinguishing the Dark Triad: Evidence from FFM and HDS, 2014)](https://www.researchgate.net/publication/267426801_Distinguishing_the_Dark_Triad_Evidence_from_the_Five-Factor_Model_and_the_Hogan_Development_Survey).

Implicação: parte da variância já está capturada pelo Big Five (IPIP-NEO-120). O Dark Triad adiciona **só a variância específica da intenção exploratória/manipulativa**. Daí o peso baixo no Score Humano (0.05–0.10).

### 3.5 Limitações psicométricas

🚨 **Internal consistency:** Dirty Dozen tem α 0,69–0,79 por subescala ([Maples-Lamkin et al., 2014](https://pubmed.ncbi.nlm.nih.gov/24274044/)), abaixo do limite tradicional de 0,80. SD3 tem α melhor (0,77–0,85) mas com mais itens ([Jones & Paulhus, 2014](https://www2.psych.ubc.ca/~dpaulhus/research/DARK_TRAITS/ARTICLES/ASSESST.2014.with.Jones.pdf)).

🚨 **Psicopatia particularmente problemática:** [Miller et al., 2012](https://pubmed.ncbi.nlm.nih.gov/22612650/) documentaram que a subescala de psicopatia do Dirty Dozen **mede principalmente baixa Conscienciosidade + baixo medo**, não psicopatia clássica. "Cautionary tale about the costs of brief measures" — não usar Dirty Dozen como medida de psicopatia substantiva.

🚨 **Faking good no Dark Triad é EXTREMO** — em contexto de seleção, candidatos dão respostas socialmente desejáveis com facilidade. Itens como "manipulo outros para conseguir o que quero" são fáceis de discordar, **independente de comportamento real**. Mitigação: tempo de resposta, padrões de resposta, triangulação com 360° quando possível, e consciência de que **nenhum dado Dark Triad é confiável isoladamente**.

🚨 **Viés de auto-percepção:** narcisistas tendem a **reportar honestamente seu narcisismo** (parte do construto é grandiosidade auto-declarada). Mas psicopatas subclínicos tendem a **mentir habilmente** sobre psicopatia. Validade diferencial é assimétrica.

### 3.6 Por que ainda assim implementar (com cuidado)

1. **Vagas fiduciárias de alto stake** — CFO, head jurídico, head de compliance, security officer — onde mesmo um sinal fraco merece escrutínio adicional.
2. **Triangulação** — quando combinado com 360°, entrevista estruturada e checagem de referências, melhora a calibração da decisão.
3. **Compliance interno** — algumas indústrias (finanças, segurança, healthcare) **exigem** triagem de risco comportamental.
4. **Pesquisa interna do Score Humano** — dados Dark Triad anonimizados podem calibrar o algoritmo Score Humano sobre quais combinações de traços predizem comportamento contraproducente real (turnover involuntário, processo trabalhista, denúncia interna).

---

## 4. Estrutura de itens

### 4.1 Recomendação Kavuka (`dark-triad` v1.0)

- **Total:** 18 itens (6 por dimensão Maq/Narc/Psicopatia)
- **Origem:** itens autorais GUÉP estilo Dirty Dozen/SD3 + itens IPIP-HEXACO Honesty-Humility-baixa (públicos)
- **Formato:** Likert 5 pontos (não 7 como o Dirty Dozen original — mantém compatibilidade com pipeline)
- **Tempo:** 4–6 min
- **Stem:** "Eu tendo a..." ou "É comum eu..."
- **Aplicação:** **opcional**, separada do fluxo padrão, **apenas em vagas com flag `requires_high_stake_screening: true`**
- **Consentimento:** **explícito específico** (LGPD art. 7º + art. 20), separado do TOS geral, com explicação clara do propósito e dos limites do instrumento

### 4.2 Linguagem dos itens

🚨 **Itens devem evitar termos pejorativos diretos** ("manipular", "psicopata", "narcisista") mesmo que a literatura científica use. Reformular para:
- "manipular" → "convencer outros usando argumentos que sei que vão funcionar com eles"
- "narcisista" → não usar; descrever comportamento ("gosto que reconheçam meu trabalho", "me importo com como sou percebido")
- "psicopata" → não usar; descrever comportamento ("não me afeto fácil com problemas dos outros")

### 4.3 Exemplos de itens (autorais ou IPIP-HEXACO públicos)

🚨 **Não reproduzir Dirty Dozen ou SD3 literalmente.** Os exemplos abaixo são **autorais GUÉP** ou **IPIP-HEXACO** públicos:

| Dimensão | Exemplo (autoral GUÉP em estilo Dirty Dozen) |
|---|---|
| **Maquiavelismo** | *"Costumo planejar minhas conversas com cuidado para conseguir o que preciso."* (autoral, +) |
| **Maquiavelismo** | *"Acho importante manter algumas informações guardadas até o momento certo."* (autoral, +) |
| **Narcisismo** | *"Gosto quando as pessoas notam que sou o melhor no que faço."* (autoral, +) |
| **Narcisismo** | *"Mereço reconhecimento mais alto do que costumo receber."* (autoral, +) |
| **Psicopatia subclínica** | *"Não me afeto fácil com os problemas emocionais dos outros."* (autoral, +) |
| **Psicopatia subclínica** | *"Posso tomar decisões duras sem perder o sono."* (autoral, +) |

**IPIP-HEXACO Honesty-Humility-baixa (público) como complemento:**

1. *"Use flattery to get ahead."* (IPIP, +) — Maq adjacente
2. *"Take advantage of others."* (IPIP, +) — Maq adjacente
3. *"Think highly of myself."* (IPIP, +) — Narc adjacente
4. *"Lack the desire to make a difference."* (IPIP, −) — Psic adjacente

### 4.4 Validação obrigatória antes de produção

🚨 **Padrão de validação MAIS rigoroso que outros instrumentos** porque o risco reputacional é alto:

- [ ] Banco de 18 itens autorais/IPIP em PT-BR
- [ ] **Dupla revisão por psicólogos registrados** (CFP), especificamente sobre tom não-pejorativo e ausência de terminologia clínica
- [ ] Revisão jurídica (LGPD + CFP + ADA-equivalente para preparar exportação futura)
- [ ] Piloto cognitivo think-aloud N=50 (não 30 — amostra maior por sensibilidade)
- [ ] Piloto quantitativo N=800 (não 500) com Dirty Dozen/SD3 acadêmico aplicado em paralelo (validade convergente esperada r ≥ 0,5 com SD3)
- [ ] Análise de viés por gênero, raça, classe — descartar itens com DIF (differential item functioning)
- [ ] Confirmar correlações esperadas:
  - Subescalas Dark Triad ↔ Honesty-Humility HEXACO ≤ −0,5 (negativa forte)
  - Subescalas Dark Triad ↔ Big Five Amabilidade ≤ −0,3 (negativa moderada)
- [ ] **DPIA (Data Protection Impact Assessment) específico** para este instrumento, separado do DPIA geral Kavuka

---

## 5. Lógica de scoring

### 5.1 Score por dimensão

```
score_maq = média(itens Maq, com inversão)  → 1–5
score_narc = média(itens Narc, com inversão)  → 1–5
score_psic = média(itens Psic, com inversão)  → 1–5
```

### 5.2 🚨 NÃO produzir score numérico ranqueável no output externo

🚨 **Decisão de design:** o output **para o recrutador** **não** é um número, é um **sinalizador qualitativo** em 3 níveis:

| Faixa interna | Sinalizador externo |
|---|---|
| score ≤ p70 (norma BR pós-piloto) | **Sem sinalização** (não aparece no card) |
| p70 < score ≤ p90 | **Atenção** — recomenda-se entrevista estruturada com perguntas específicas |
| score > p90 | **Aprofundamento** — recomenda-se 360°, checagem de referências reforçada, e escalonamento para gestor de RH senior |

🚨 **Sob hipótese alguma** o card mostra "Maquiavelismo: 4,3/5". Mostra "Sinalização Maquiavelismo: Atenção" + texto explicativo curto.

### 5.3 Output JSON canônico

```json
{
  "instrument": "dark_triad",
  "version": "1.0.0",
  "scores": {
    "maquiavelismo": {"signal": "atencao", "raw_score": 3.7, "internal_only": true},
    "narcisismo": {"signal": "sem_sinalizacao", "raw_score": 2.4, "internal_only": true},
    "psicopatia_subclinica": {"signal": "sem_sinalizacao", "raw_score": 2.1, "internal_only": true}
  },
  "score_weight_in_human_score": 0.05,
  "norm_source": "internal_pilot_n_800_BR_2026",
  "human_review_required": true,
  "human_review_status": "pending",
  "consent_specific_id": "consent_dark_triad_v1_2026_05_03"
}
```

🚨 **Campo `internal_only: true`** indica que o `raw_score` **não pode ser exposto na UI do recrutador**. Apenas a banda qualitativa `signal` é exposta, e mesmo assim, **só após `human_review_status = "approved"`**.

### 5.4 Workflow de revisão humana obrigatória

```
[candidato responde] 
  → [scoring backend] 
  → [output bloqueado em fila de revisão] 
  → [psicólogo/RH senior revisa em 24h] 
  → [aprova / contesta / pede re-aplicação] 
  → [só então output chega ao recrutador]
```

🚨 **Sem revisão humana, o output Dark Triad NUNCA é exposto.** Implementar essa restrição como **regra de negócio dura** no backend, não como toggle.

---

## 6. Interpretação

### 6.1 Narrativa por sinalizador

Cada sinalização deve ser apresentada com:

1. **O que esta sinalização significa** (1 parágrafo, descritivo, não-clínico)
2. **O que ela NÃO significa** (1 parágrafo, mitigando interpretação clínica)
3. **Como aprofundar** (perguntas estruturadas para a entrevista)
4. **Limitações específicas do dado** (faking, baixo retest, etc.)

Exemplo (Maquiavelismo, sinalização "Atenção"):

> **Estilo interpessoal direto / pragmático**
>
> O candidato reportou um estilo interpessoal mais pragmático que a média, com tendência a planejar interações para alcançar objetivos. Em si, isso pode ser uma **vantagem** em papéis comerciais ou de negociação, e uma **fragilidade** em papéis que exigem alta confiança intersubjetiva e cooperação espontânea.
>
> **O que esta sinalização NÃO significa:** o candidato é manipulador, desonesto ou inadequado. Esta é uma sinalização de auto-relato, com conhecidas limitações de validade, e **não deve ser usada como base única para decisão**.
>
> **Como aprofundar:** considere perguntar sobre situações em que precisou influenciar pessoas com agendas diferentes — observe se o candidato descreve táticas de transparência ou táticas de assimetria de informação.
>
> **Limitações:** auto-relato de Maquiavelismo é fácil de fingir; o sinal é mais informativo quando combinado com 360° de pares e checagem de referências.

### 6.2 Watchouts críticos

🚨 **NUNCA usar como gate único de seleção.** Mesmo "Aprofundamento" não é decisão — é input para investigação adicional.

🚨 **NUNCA combinar com outros dados sensíveis.** Não cruzar Dark Triad com gênero, raça, idade, condição de saúde, religião — risco de discriminação composta.

🚨 **NUNCA mostrar para terceiros.** Output Dark Triad **não** sai do ambiente Kavuka. Não exportar para CSV, não enviar por e-mail, não mostrar em integração com cliente externo.

🚨 **Direito de contestação reforçado:** candidato pode pedir revisão humana, refazer o teste, ou solicitar opt-out total da Camada 4 sem prejuízo na avaliação geral. Comunicar isso explicitamente no consentimento.

🚨 **Direito ao esquecimento:** candidato pode pedir apagamento dos dados Dark Triad mesmo se mantiver os outros dados (LGPD art. 18). Implementar fluxo de apagamento granular por instrumento.

🚨 **Linguagem responsável (lista de palavras proibidas):**
- ❌ "psicopata", "psicopático"
- ❌ "narcisista" (substantivo); ✅ "tendência narcísica" (com adjetivo, em laudo técnico interno apenas)
- ❌ "maquiavélico" (substantivo); ✅ "estilo pragmático/utilitário"
- ❌ "transtorno", "patologia", "personalidade dark"
- ❌ "manipulador", "predador"
- ❌ "perigoso", "tóxico"
- ✅ "estilo interpessoal direto"
- ✅ "tendência ao distanciamento empático sob pressão"
- ✅ "preferência por argumentação estratégica"
- ✅ "atenção a reconhecimento e status"

🚨 **Idade de aplicação:** apenas adultos ≥ 18 anos. **Não aplicar a estagiários menores ou jovem aprendiz.**

🚨 **Resultado é frágil quando:** (a) tempo < 2 min (faking ou speeding); (b) padrão linear; (c) discordância entre Dark Triad e Honesty-Humility-baixa (HEXACO) ≥ 1 SD — investigar inconsistência; (d) candidato pediu para refazer múltiplas vezes — sinal de gaming.

---

## 7. Aplicação no contexto Kavuka

### 7.1 Posição na arquitetura

**Camada 4 — Risco.** O Dark Triad é o **anchor opcional** desta camada. **Não é aplicado por default.** Aplicado apenas quando vaga tem `requires_high_stake_screening: true`.

### 7.2 Critérios para aplicar

| Cenário | Aplicar? |
|---|---|
| Vaga executiva (C-level, head, diretor) | Sim, com consentimento específico |
| Vaga fiduciária (CFO, jurídico, compliance, audit) | Sim |
| Vaga de segurança (security officer, vigilância armada, healthcare crítico) | Sim, com regulação setorial específica |
| Vaga comercial sênior (key account, lead negociador) | Avaliar caso a caso |
| Vaga operacional / júnior / estágio | **Não** |
| Re-aplicação para colaborador atual | **Não** sem nova base legal específica |
| Cliente solicita aplicação genérica para todas as vagas | **Recusar** — explicar à luz da LGPD/CFP |

### 7.3 Por que peso muito baixo (0.05–0.10) no Score Humano

| Razão | Detalhe |
|---|---|
| **Forte sobreposição com HEXACO Honesty-Humility** | Já capturado por outro instrumento; peso alto = dupla contagem |
| **Validade preditiva específica é modesta** | Literatura mostra correlação ≤ 0,2 com counterproductive work behavior medido objetivamente |
| **Faking severo em contexto de seleção** | Sinal é ruidoso por construção |
| **Risco reputacional alto** | Peso alto em cálculo significa que decisão depende de instrumento controverso — risco de processo |

### 7.4 Mapeamento Score Humano

| Score Humano sub-dimensão | Dark Triad contribuição |
|---|---|
| **Confiabilidade operacional** | −0,05 × score_psic (alto Psic indica baixa Conscienciosidade adjacente) |
| **Energia colaborativa** | −0,05 × score_maq (alto Maq indica baixa cooperação) |
| **Ética interpessoal/integridade** (sub-dimensão NOVA proposta) | −0,10 × média(maq, psic) |

🚨 Considerar **adicionar uma sub-dimensão "Integridade Interpessoal"** ao Score Humano, alimentada principalmente por HEXACO Honesty-Humility (peso positivo) + Dark Triad (peso negativo pequeno).

### 7.5 Mapeamento Dark Triad → perfis comportamentais GUÉP

🚨 **Dark Triad NÃO determina perfil GUÉP.** Os 4 perfis (Executor/Estrategista/Operador/Influenciador) são determinados pelas Camadas 1–3. O Dark Triad apenas adiciona um **flag** opcional ao card:

```
Maria Souza
─────────────
Perfil GUÉP: Executor
Label: Construtor
Sinalização Camada 4: ⚠️ Atenção (Maquiavelismo) — revisar com entrevista estruturada
Score Humano: 84/100 (com nota explicativa sobre como Camada 4 contribuiu)
```

### 7.6 Direito a opt-out e fluxo de contestação

- **Opt-out total da Camada 4:** candidato pode optar por **não responder** ao Dark Triad, mantendo o resto da avaliação. Isto **não pode** ser usado contra ele na decisão (registrar como "opt-out" no JSON, sem inferir).
- **Contestação de output:** candidato vê seu sinalizador (após revisão humana) e pode:
  - Pedir nova revisão humana com psicólogo diferente
  - Refazer o instrumento (uma única vez por candidatura)
  - Pedir apagamento dos dados (LGPD art. 18)
  - Adicionar comentário próprio que vai junto do sinalizador para o recrutador

### 7.7 Métrica de auditoria (mensal)

Implementar dashboard interno (acesso restrito a DPO + RH senior):

- % de aplicações Dark Triad por vaga (deve ser baixo — < 20% das vagas)
- Distribuição de sinalizações por gênero/raça/região (alerta se distribuição não-uniforme)
- Tempo médio de revisão humana (meta: ≤ 24h)
- % de candidatos que contestam (proxy de UX problemática se ≥ 5%)
- % de outputs aprovados/contestados/recomendados refazer pela revisão humana

### 7.8 Quando NÃO aplicar (lista de exclusão)

- Candidatos < 18 anos
- Candidatos com flag de transtorno mental autodeclarado (LGPD art. 11) — risco de combinação com dado sensível
- Candidatos que pediram opt-out na rodada anterior
- Candidatos em re-aplicação curta (< 6 meses entre rodadas)
- Vagas operacionais ou júnior (mesmo a pedido do cliente)
- Quando a base de comparação (norma BR) tiver < N=500 (não temos calibração suficiente)

---

## 8. Referências

1. Paulhus, D. L., & Williams, K. M. (2002). The Dark Triad of personality: Narcissism, Machiavellianism, and psychopathy. *Journal of Research in Personality*, 36(6), 556–563. [https://www.sciencedirect.com/science/article/abs/pii/S0092656602005056](https://www.sciencedirect.com/science/article/abs/pii/S0092656602005056)
2. Jonason, P. K., & Webster, G. D. (2010). The Dirty Dozen: A concise measure of the Dark Triad. *Psychological Assessment*, 22(2), 420–432. [https://pubmed.ncbi.nlm.nih.gov/20528068/](https://pubmed.ncbi.nlm.nih.gov/20528068/)
3. Jones, D. N., & Paulhus, D. L. (2014). Introducing the Short Dark Triad (SD3): A brief measure of dark personality traits. *Assessment*, 21(1), 28–41. [https://pubmed.ncbi.nlm.nih.gov/24322012/](https://pubmed.ncbi.nlm.nih.gov/24322012/) · PDF: [https://www2.psych.ubc.ca/~dpaulhus/research/DARK_TRAITS/ARTICLES/ASSESST.2014.with.Jones.pdf](https://www2.psych.ubc.ca/~dpaulhus/research/DARK_TRAITS/ARTICLES/ASSESST.2014.with.Jones.pdf)
4. Miller, J. D., Few, L. R., Seibert, L. A., Watts, A., Zeichner, A., & Lynam, D. R. (2012). An examination of the Dirty Dozen measure of psychopathy: A cautionary tale about the costs of brief measures. *Psychological Assessment*, 24(4), 1048–1053. [https://pubmed.ncbi.nlm.nih.gov/22612650/](https://pubmed.ncbi.nlm.nih.gov/22612650/)
5. Maples-Lamkin, J. L., et al. (2014). A test of two brief measures of the Dark Triad: The Dirty Dozen and Short Dark Triad. *Psychological Assessment*, 26(1), 326–331. [https://pubmed.ncbi.nlm.nih.gov/24274044/](https://pubmed.ncbi.nlm.nih.gov/24274044/)
6. Howard, M. C., & Van Zandt, E. C. (2020). The discriminant validity of honesty-humility: A meta-analysis of the HEXACO, Big Five, and Dark Triad. *Journal of Research in Personality*. [https://www.sciencedirect.com/science/article/abs/pii/S0092656620300702](https://www.sciencedirect.com/science/article/abs/pii/S0092656620300702)
7. Paulhus, D. L., et al. (2020). Screening for dark personalities: The Short Dark Tetrad (SD4). *European Journal of Psychological Assessment*. [https://econtent.hogrefe.com/doi/abs/10.1027/1015-5759/a000602](https://econtent.hogrefe.com/doi/abs/10.1027/1015-5759/a000602)
8. Cross-cultural Adaptation of the Short Dark Tetrad (SD4) in the Brazilian Context (2023). *Psychological Test Adaptation and Development*. [https://econtent.hogrefe.com/doi/10.1027/2698-1866/a000100](https://econtent.hogrefe.com/doi/10.1027/2698-1866/a000100)
9. Macedo, A., et al. (2017). Personality Dark Triad: Portuguese Validation of the Dirty Dozen. *European Psychiatry*. [https://www.cambridge.org/core/journals/european-psychiatry/article/personality-dark-triad-portuguese-validation-of-the-dirty-dozen/1D9A6DDDB4006A5B96CF6AAA6D06BE86](https://www.cambridge.org/core/journals/european-psychiatry/article/personality-dark-triad-portuguese-validation-of-the-dirty-dozen/1D9A6DDDB4006A5B96CF6AAA6D06BE86)
10. SciELO Brazil — Dark Triad Dirty Dozen: Avaliando seus Parâmetros Via TRI. *Psico-USF*. [https://scielo.br/scielo.php?pid=S1413-82712017000200299&script=sci_arttext](https://scielo.br/scielo.php?pid=S1413-82712017000200299&script=sci_arttext)
11. International Personality Item Pool — IPIP-HEXACO scales. [https://ipip.ori.org/](https://ipip.ori.org/) · [https://ipip.ori.org/newHEXACO_PI_key.htm](https://ipip.ori.org/newHEXACO_PI_key.htm)
12. Ashton, M. C., Lee, K., & Goldberg, L. R. (2007). The IPIP–HEXACO scales: An alternative, public-domain measure of the personality constructs in the HEXACO model. *Personality and Individual Differences*. [https://projects.ori.org/lrg/PDFs_papers/Ashton_Lee_Goldberg_2007_PAID.pdf](https://projects.ori.org/lrg/PDFs_papers/Ashton_Lee_Goldberg_2007_PAID.pdf)
13. EEOC — Employment Tests and Selection Procedures. [https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures](https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures)
14. Penn State Law Review (2021). Pre-Employment Personality Tests, Algorithmic Bias, and the Americans with Disabilities Act. [https://www.pennstatelawreview.org/wp-content/uploads/2021/03/Article-2-Timmons-Pre-Employment-Personality-Tests.pdf](https://www.pennstatelawreview.org/wp-content/uploads/2021/03/Article-2-Timmons-Pre-Employment-Personality-Tests.pdf)
15. Bloomberg Law (2024). Pre-Hire Personality Tests Set Legal Challenges for Employers. [https://news.bloomberglaw.com/us-law-week/pre-hire-personality-tests-set-legal-challenges-for-employers](https://news.bloomberglaw.com/us-law-week/pre-hire-personality-tests-set-legal-challenges-for-employers)
16. Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD), arts. 7º, 11, 18, 20. [https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
17. Resolução CFP nº 31/2022 — Uso de testes psicológicos. [https://satepsi.cfp.org.br/](https://satepsi.cfp.org.br/)
