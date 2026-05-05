# Dossiê 01 — DISC Adaptado

> Marco 2 · Camada 2 (Comportamento) · Instrumento de **tipologia comportamental** — output em quatro letras (D/I/S/C) acoplado aos quatro perfis GUÉP.

---

## 1. Resumo executivo

O modelo DISC nasce em William Marston (*Emotions of Normal People*, 1928), que descreve quatro padrões comportamentais — **Dominance · Inducement · Submission · Compliance** — derivados do cruzamento de duas dimensões (percepção do ambiente como antagônico/favorável × resposta ativa/passiva). Marston **não publicou um questionário psicométrico**: o instrumento foi construído por Walter Clarke (1956) e refinado em décadas seguintes pela Inscape/Wiley (Everything DiSC), TTI Insights e Pearson (PPA), todas **versões proprietárias com banco de itens fechado** ([Wiley Content License](https://register.everythingdisc.com/Everything_DiSC_Content_License_Agreement.pdf)). Psicometricamente, o DISC tem cobertura parcial do Big Five: Dominance e Influence se sobrepõem a Extroversão; Steadiness mapeia Amabilidade; Compliance é **só parcialmente Conscienciosidade** (correlaciona mais com cautela/análise do que com organização-realização) — e o DISC **não captura Abertura nem Neuroticismo** ([123test, 2018, *Concurrent validation DISC vs Big Five*](https://www.123test.com/content/disc-vs-big-five-123test.pdf); [Furnham comparison data](https://files.eric.ed.gov/fulltext/EJ1054970.pdf)). Recomendação Kavuka: **construir microsserviço `disc-adapt` autoral** usando itens do banco IPIP (domínio público) calibrados para as 4 quadrantes; expor as 4 letras (D/I/S/C) na UX **e** mapear para os perfis GUÉP no card; manter `score_weight_in_human_score: 0.10` (peso baixo, narrativo) por ser fortemente redundante com IPIP-NEO-120.

🚨 **Decisão crítica resolvida neste dossiê** — perfis GUÉP (Executor / Estrategista / Operador / Influenciador) **não são tradução literal do DISC brasileiro** (Executor / Comunicador / Planejador / Analista). Ver §7.5.

---

## 2. Status legal e licenciamento

### 2.1 Camadas legais do DISC

| Camada | Situação |
|---|---|
| **Teoria de Marston (1928)** | *Emotions of Normal People* publicado em 1928 nos EUA. Direito autoral original expirou (97 anos depois = 2025) ou está em domínio público pela falta de renovação dos termos do US Copyright Act 1909. Cópias estão livres no [Internet Archive](https://archive.org/details/emotionsofnormal0000mars). **A teoria é livre.** |
| **Sigla "DISC"** | Não há registro de marca exclusiva da palavra DISC isolada — várias empresas usam livremente (TTI, Wiley, Athena, John Maxwell etc.). Risco de marca: baixo. |
| **"Everything DiSC®"** | 🚨 **Marca registrada Wiley** ([Wiley Trademark Notice](https://www.discprofile.com/legal-trademark-copyright-notice)). Não usar grafia "DiSC" com 'i' minúsculo. |
| **Banco de itens Everything DiSC, TTI Success Insights, PPA Thomas** | 🚨 **Proprietário, copyright dos respectivos publishers**. Reproduzir itens é violação direta. |
| **Itens "Walter Clarke" (1956)** | Origem comercial — incorporados pela Inscape/Wiley. Não são domínio público. |
| **Itens IPIP que medem dimensões DISC** | **Domínio público total** ([ipip.ori.org](https://ipip.ori.org/)). É o caminho legal único. |

### 2.2 Caminho recomendado para o Kavuka

> **Construir `disc-adapt` v1.0 com itens 100% IPIP (ou autorais GUÉP), calibrados para os quadrantes D/I/S/C.** Documentar publicamente como "modelo DISC adaptado, baseado em itens públicos IPIP, inspirado na teoria de Marston (1928)".

**Como mapear IPIP para DISC:**

- **Dominance (D)** ≈ IPIP "Assertiveness" + facetas de Extroversão (assertiveness, activity) − Amabilidade (cooperation, modesty). O próprio IPIP fornece itens como *"Impose my will on others"*, *"Try to outdo others"*, *"Demand explanations from others"* que são proxies clássicos de dominance ([IPIP Interpersonal Circumplex](https://ipip.ori.org/)).
- **Influence (I)** ≈ IPIP Extroversão (warmth, gregariousness, positive emotions) + Abertura/Imaginação parcial.
- **Steadiness (S)** ≈ IPIP Amabilidade (cooperation, trust, modesty) + facetas de baixa Atividade (Extroversão E1).
- **Compliance/Conscientiousness (C)** ≈ IPIP Conscienciosidade (cautiousness, deliberation, dutifulness) + facetas de baixa abertura à mudança (closure preference).

🚨 **Marketing/UX:**
- Pode-se dizer "Perfil DISC adaptado" — DISC é nome genérico de modelo, não marca exclusiva.
- **Nunca** dizer "Everything DiSC", "DiSC profile" (com i minúsculo), "compatível com Wiley", "compatível com TTI".
- Dizer **"versão Kavuka do modelo DISC, baseada em Marston (1928) e itens públicos IPIP"** é defensável.

### 2.3 Status SATEPSI/CFP

O DISC **não consta na lista de testes favoráveis do SATEPSI** ([Lista oficial CFP](https://satepsi.cfp.org.br/imprimelistateste.cfm?status=1)). Implicação: psicólogos no Brasil **não podem usar DISC como teste psicológico para fins clínicos ou laudo formal**. Para uso em RH/recrutamento como **sinalização comportamental**, segue a mesma lógica do IPIP-NEO-120 (dossiê Marco 1 §2): linguagem descritiva, output não-classificatório clínico, revisão humana obrigatória, LGPD art. 20.

🚨 Conselho Regional já emitiu múltiplas notas técnicas alertando que DISC sem aprovação SATEPSI **não pode ser apresentado como teste psicológico** ([CFP Nota Técnica](https://satepsi.cfp.org.br/docs/notaTecnica.pdf)). UX deve dizer **"perfil comportamental DISC adaptado"**, não **"teste psicológico DISC"**.

---

## 3. Modelo teórico

### 3.1 Origem em Marston (1928)

Marston, mais conhecido fora da psicologia por ter criado a Mulher-Maravilha e o detector de mentiras, propôs em *Emotions of Normal People* que o comportamento humano normal (não-patológico) se organiza em duas dimensões:

| Eixo | Polos |
|---|---|
| **Percepção do ambiente** | Antagônico ↔ Favorável |
| **Resposta a ele** | Ativa ↔ Passiva |

O cruzamento gera 4 quadrantes:

| Quadrante | Marston original | Designação moderna |
|---|---|---|
| Ambiente antagônico + resposta ativa | **Dominance** | Dominance (D) |
| Ambiente favorável + resposta ativa | **Inducement** | Influence (I) |
| Ambiente favorável + resposta passiva | **Submission** | Steadiness (S) |
| Ambiente antagônico + resposta passiva | **Compliance** | Conscientiousness / Compliance (C) |

A renomeação de Submission→Steadiness e Compliance→Conscientiousness é resultado do trabalho de Walter Clarke (1956) e da Inscape/Wiley, motivada por evitar conotação negativa ("submisso") e alinhar com vocabulário organizacional ([DiSC Profile — History of DiSC](https://www.discprofile.com/what-is-disc/history-of-disc)).

### 3.2 Fragilidades psicométricas conhecidas

🚨 **A estrutura de 4 fatores do DISC NÃO foi derivada de análise fatorial empírica** — foi deduzida do modelo bidimensional de Marston ([Cogn-IQ blog, 2024 — *DISC vs Big Five*](https://www.cogn-iq.org/blog/disc-vs-big-five/)). Isso difere fundamentalmente do Big Five (que emergiu da análise lexical e questionária independentes). Implicação: o "DISC" é mais uma **rotulagem útil** do que uma estrutura psicométrica robusta.

🚨 **Internal consistency variável:** versões comerciais reportam alfas entre 0,70 e 0,85 ([Cogn-IQ, 2024](https://www.cogn-iq.org/blog/disc-vs-big-five/)) — aceitável mas inferior à Big Five. Análises fatoriais independentes raramente recuperam os 4 fatores limpos; itens carregam de modo cruzado.

🚨 **Validade preditiva:** literatura peer-review limitada de DISC predizendo job performance. Os publishers (Wiley, TTI) não publicam estudos em journals de impacto (preferem white-papers internos). Baseline: até onde existe evidência, performance preditiva ≈ Big Five mas com cobertura mais estreita ([Cogn-IQ, 2024](https://www.cogn-iq.org/blog/disc-vs-big-five/)).

### 3.3 Convergência com Big Five

Tabela síntese (a partir de [123test concurrent validation, N=125](https://www.123test.com/content/disc-vs-big-five-123test.pdf), [Furnham concurrent data](https://files.eric.ed.gov/fulltext/EJ1054970.pdf), e Crystal Knows Big5/DISC mapping):

| DISC | Big Five primária | Big Five secundária | Cobertura |
|---|---|---|---|
| **Dominance (D)** | Extroversão (assertiveness) | −Amabilidade (modéstia, cooperação) | Alta |
| **Influence (I)** | Extroversão (warmth, gregariousness) | +Abertura (energia, entusiasmo) | Alta |
| **Steadiness (S)** | Amabilidade (cooperation, trust) | −Extroversão (atividade) | Média |
| **Conscientiousness (C, na DISC)** | Conscienciosidade (cautiousness, deliberation) parcial | +Abertura (analytical) | **Baixa-média — não é "responsibility/organization" do Big Five C** |
| (sem dimensão DISC) | **Abertura** | — | **Não capturada** |
| (sem dimensão DISC) | **Neuroticismo** | — | **Não capturada** |

🚨 **Conclusão crítica de §3.3:** o DISC é, em larga medida, **um sub-conjunto do Big Five** rotulado de modo mais coloquial. A Abertura e o Neuroticismo ficam fora — então rodar DISC depois do IPIP-NEO-120 não adiciona muita variância nova. O valor do DISC é UX/narrativa, não resolução adicional. Daí a recomendação de `score_weight_in_human_score = 0.10` no Score Humano (§7.3).

### 3.4 Por que ainda implementar DISC

1. **Demanda de mercado real:** RH brasileiro reconhece DISC quase universalmente. ATS sem DISC tem desvantagem comercial direta.
2. **Output em 4 letras** (DI, ISC, DC etc.) é cognitivamente mais simples que 30 facetas.
3. **Pode ser "derivado"** do IPIP-NEO-120 já aplicado, sem rodar 24 itens adicionais — análogo ao modo `derived` do MBTI-like (Marco 1 dossiê 03 §7.3).
4. **Compõe a Camada 2 (Comportamento)** da arquitetura: o IPIP-NEO-120 entrega "quem a pessoa é" (Camada 1), o DISC entrega "como ela se comporta no trabalho" (Camada 2).

---

## 4. Estrutura de itens

### 4.1 Recomendação Kavuka (`disc-adapt` v1.0)

- **Total:** 24 itens (6 por quadrante D/I/S/C)
- **Origem:** itens 100% retirados do banco IPIP público + 4-6 itens autorais GUÉP para cobrir gaps específicos do DISC clássico
- **Formato:** Likert 5 pontos ("Discordo totalmente" → "Concordo totalmente"), **não** forced-choice
- **Tempo:** 4–6 min
- **Stem:** "No trabalho, eu..."

### 4.2 Por que NÃO usar forced-choice

Versões clássicas do DISC (Wiley, TTI) usam formato "Mais como eu / Menos como eu" — formato **ipsativo** que produz dados não-aditivos e dificulta cálculo de fit vaga-pessoa via similaridade vetorial. Manter Likert mantém compatibilidade com o pipeline existente do Big Five.

### 4.3 Exemplos de itens (autorais ou IPIP, públicos)

🚨 **Não reproduzir itens Wiley/TTI/PPA.** Os exemplos abaixo são **IPIP públicos** ([ipip.ori.org](https://ipip.ori.org/)) ou autorais GUÉP estilo Marston:

| Quadrante | Exemplo (IPIP ou autoral) |
|---|---|
| **D — Dominance** | *"Try to outdo others."* (IPIP, +) · *"Demand explanations from others."* (IPIP, +) · *"Take charge of group projects."* (IPIP, +) |
| **I — Influence** | *"Make friends easily."* (IPIP, +) · *"Talk to a lot of different people at parties."* (IPIP, +) · *"Show my enthusiasm in meetings."* (autoral GUÉP, +) |
| **S — Steadiness** | *"Sympathize with others' feelings."* (IPIP, +) · *"Wait for others to lead the way."* (IPIP, +) · *"Prefer steady, predictable work routines."* (autoral GUÉP, +) |
| **C — Compliance** | *"Pay attention to details."* (IPIP, +) · *"Follow established procedures."* (IPIP, +) · *"Double-check my work before submitting."* (autoral GUÉP, +) |

**Tradução PT-BR:**

1. *"No trabalho, gosto de assumir o comando dos projetos do grupo."* (D)
2. *"Faço amigos com facilidade no ambiente profissional."* (I)
3. *"Prefiro rotinas previsíveis a mudanças constantes."* (S)
4. *"Confiro o meu trabalho mais de uma vez antes de entregar."* (C)

🚨 Tradução acima é **proposta de partida** — não usar em produção sem revisão por psicólogo e piloto cognitivo.

### 4.4 Validação obrigatória antes de produção

- [ ] Banco de 24-32 itens autorais/IPIP em PT-BR
- [ ] Revisão por psicólogo registrado (CFP)
- [ ] Piloto cognitivo think-aloud N=30
- [ ] Piloto quantitativo N=500 com IPIP-NEO-120 paralelo
- [ ] Confirmar correlação esperada (D-Extroversão ≥ 0,5, I-Extroversão ≥ 0,5, S-Amabilidade ≥ 0,5, C-Conscienciosidade ≥ 0,3)
- [ ] Análise fatorial confirmatória — aceitar se χ²/df < 3 e CFI ≥ 0,90 (se não recuperar 4 fatores limpos, reportar honestamente como "estrutura quase-fatorial")

---

## 5. Lógica de scoring

### 5.1 Score por quadrante

```
score_D = média(itens chave-D, com inversão)  → escala 1–5
score_I = média(itens chave-I, com inversão)  → escala 1–5
score_S = média(itens chave-S, com inversão)  → escala 1–5
score_C = média(itens chave-C, com inversão)  → escala 1–5
```

### 5.2 Determinação do perfil "primário" e "secundário"

```
primary  = quadrante com maior score
secondary = quadrante com segundo maior score (se score >= primary - 0.5)
```

Output exemplo: `"DI"` (Dominance primário, Influence secundário). Se a diferença entre 1º e 2º for ≥ 1,0, reportar só o primário (`"D"`).

### 5.3 Modo `derived` (a partir do IPIP-NEO-120)

Quando o candidato já fez IPIP-NEO-120, o microsserviço pode rodar em `mode: "derived"` sem aplicar 24 itens novos:

```
score_D = z(Extroversão.assertiveness) + z(Extroversão.activity) − z(Amabilidade.modesty)
score_I = z(Extroversão.warmth) + z(Extroversão.gregariousness) + z(Extroversão.positive_emotions)
score_S = z(Amabilidade.cooperation) + z(Amabilidade.trust) − z(Extroversão.activity)
score_C = z(Conscienciosidade.cautiousness) + z(Conscienciosidade.deliberation) + z(Conscienciosidade.dutifulness)
```

🚨 Reportar `mode: "derived"` no JSON canônico. Modos `direct` e `derived` produzem perfis correlacionados ≥ 0,75 — uma medida operacional de validade convergente.

### 5.4 JSON canônico de saída

```json
{
  "instrument": "disc_adapt",
  "version": "1.0.0",
  "mode": "direct",
  "scores": {
    "primary": "D",
    "secondary": "I",
    "raw": {"D": 4.2, "I": 3.8, "S": 2.5, "C": 3.1}
  },
  "guep_profile": "Executor",
  "score_weight_in_human_score": 0.10,
  "norm_source": "internal_pilot_n_500_BR_2026"
}
```

---

## 6. Interpretação

### 6.1 Narrativa por quadrante (esqueleto Kavuka)

**Dominance alto (≥ 4,0):** orientado a resultado e ação rápida. Em RH: bom fit em comercial agressivo, gestão de crise, empreendedorismo. Watchout: pode ser percebido como autoritário em culturas colaborativas.

**Influence alto (≥ 4,0):** orientado a relacionamento e comunicação. Bom fit em vendas consultivas, marketing, RH como interlocutor. Watchout: pode subestimar análise técnica em decisões.

**Steadiness alto (≥ 4,0):** orientado a estabilidade e cooperação. Bom fit em operações, suporte, atendimento, atendimento a clientes recorrentes. Watchout: pode resistir a mudanças necessárias.

**Conscientiousness/Compliance alto (≥ 4,0):** orientado a precisão, regras e qualidade. Bom fit em compliance, qualidade, finanças, jurídico, engenharia. Watchout: pode emperrar em ambientes de alta ambiguidade.

### 6.2 Watchouts críticos

🚨 **Não é "personalidade", é "estilo comportamental no trabalho"** — DISC é stato-dependente: a mesma pessoa pode ser D em ambiente de pressão e S em ambiente de cooperação. Recomendação: stem "no trabalho, eu..." reforça o foco contextual, mas o resultado **não pode ser tratado como traço estável** como o Big Five.

🚨 **Faking good é alto** — em contexto de seleção, candidatos elevam D e I (mais "vendáveis") e diminuem S ([Birkeland et al., 2006](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-2389.2006.00354.x)). Mitigar com triangulação contra IPIP-NEO-120 e itens de validade.

🚨 **Sem capturar Abertura nem Neuroticismo:** o card do candidato deve **sempre** apresentar DISC ao lado dos 5 fatores Big Five — DISC sozinho deixa metade do espaço comportamental fora. Não usar DISC como gate único de seleção.

🚨 **Linguagem responsável:** evitar "perfil dominador", "perfil submisso", "compliance baixo = rebelde". Usar "preferência por liderança direta", "preferência por cooperação", "preferência por análise antes da ação".

🚨 **Resultado é frágil quando:** (a) tempo de resposta < 2 min, (b) > 50% das respostas no ponto neutro, (c) padrão linear (todos = 5), (d) discordância forte entre `direct` e `derived` (Pearson < 0,4).

---

## 7. Aplicação no contexto Kavuka

### 7.1 Posição na arquitetura de 6 camadas

**Camada 2 — Comportamento (como a pessoa atua).** O DISC é o **anchor narrativo** desta camada. Saída: 4 letras + perfil GUÉP correspondente.

### 7.2 Por que peso baixo (0.10) no Score Humano

Como demonstrado em §3.3, o DISC é cobertura parcial e redundante do Big Five. Já temos IPIP-NEO-120 (peso alto) entregando os 5 fatores + 30 facetas. Adicionar DISC com peso alto seria **dupla contagem** — mesmo problema do MBTI-like (Marco 1 dossiê 03).

| Decisão | Justificativa |
|---|---|
| `score_weight_in_human_score: 0.10` | Pequeno peso para capturar o **rótulo** (não o construto) que o RH brasileiro espera ver, sem dupla contagem |
| Output sempre **derivado quando possível** | Se candidato já fez IPIP-NEO-120, derivamos DISC sem aplicar mais 24 itens (reduz fadiga) |
| **Modo `direct` como fallback** | Para candidatos que entram pelo DISC sem ter feito Big Five (ex: integração com cliente que pediu DISC primeiro) |

### 7.3 Mapeamento Score Humano (proposta inicial)

| Score Humano sub-dimensão | DISC contribuição |
|---|---|
| **Confiabilidade operacional** | +S · +C |
| **Energia colaborativa** | +I · +S |
| **Adaptabilidade cognitiva** | (DISC não captura — usar Big Five Abertura) |
| **Resiliência sob pressão** | (DISC não captura — usar Big Five Neuroticismo) |
| **Liderança/influência** | +D · +I |

🚨 Pesos finais devem ser **calibrados empiricamente** com dados reais de outcome (turnover, performance review, fit de vaga).

### 7.4 Mapeamento DISC (D/I/S/C) para perfis comportamentais GUÉP

**Esta é a decisão crítica do dossiê.** Os perfis GUÉP **não são tradução literal** do DISC brasileiro tradicional. Comparação:

| DISC tradicional BR | Perfil GUÉP |
|---|---|
| **Executor** (D dominante) | **Executor** (mesmo nome, mesma intuição) |
| **Comunicador** (I dominante) | **Influenciador** (renomeação para escapar do "comunicador" genérico do mercado) |
| **Planejador** (S dominante) | **Operador** (renomeação — "Planejador" sugere estratégia, mas no DISC clássico é mais sobre estabilidade/execução metódica; "Operador" reflete melhor) |
| **Analista** (C dominante) | **Estrategista** (renomeação — "Analista" é restritivo e técnico; "Estrategista" reflete o pensamento crítico e antecipativo, mas com risco de confundir com Abertura — ver watchout) |

🚨 **Watchout sobre "Estrategista":**
- No DISC clássico, **Compliance/Conscientiousness ≠ pensamento estratégico** (literatura mostra C-DISC mede mais cautela/precisão do que visão sistêmica).
- O perfil GUÉP "Estrategista" tende a combinar **alta Abertura (Big Five) + alta C (Big Five) + médio C-DISC**, não C-DISC alto isolado.
- **Implicação:** o perfil GUÉP "Estrategista" só pode ser confiavelmente determinado quando **temos IPIP-NEO-120 disponível**, não só DISC. Se candidato fez **só** DISC, marcar perfil GUÉP como "Estrategista (provisório, baseado apenas em DISC)" ou cair em "Operador" como default mais conservador.

### 7.5 🚨 RECOMENDAÇÃO CONSOLIDADA — perfis GUÉP vs DISC

> **Os perfis GUÉP (Executor / Estrategista / Operador / Influenciador) NÃO devem ser apresentados como sinônimo dos quadrantes DISC.** Eles são uma **categorização autoral GUÉP** que sintetiza Big Five + DISC + outros instrumentos da Camada 2+.

**Regras operacionais:**

1. **No card do candidato** (UX): exibir **AMBOS**:
   - "Perfil GUÉP: **Executor**" (rótulo principal, Kavuka-branded)
   - "DISC adaptado: **DI**" (rótulo secundário, reconhecível pelo mercado)

2. **No JSON canônico**: campos separados:
   - `disc.primary: "D"`, `disc.secondary: "I"`
   - `guep_profile: "Executor"` (computado como função de Big Five + DISC + Camadas 3+)

3. **Quando candidato só fez DISC** (não fez Big Five): perfil GUÉP é **provisório** com flag `provisional: true`. O recrutador vê aviso "perfil determinado apenas pelo DISC — recomendamos rodar Big Five completo para confirmação".

4. **Quando candidato fez Big Five + DISC + Gallup/HEXACO**: perfil GUÉP é **consolidado** (`provisional: false`).

5. **Algoritmo de mapeamento DISC → GUÉP** (heurístico inicial, calibrar com dados):

```
if D >= 4.0 and (D - max(I,S,C)) >= 0.5:
    guep = "Executor"
elif I >= 4.0 and (I - max(D,S,C)) >= 0.5:
    guep = "Influenciador"
elif C >= 4.0 and (C - max(D,I,S)) >= 0.5 and big_five.openness >= p70:
    guep = "Estrategista"  # requer Abertura alta para diferenciar de Operador
elif C >= 4.0 and (C - max(D,I,S)) >= 0.5:
    guep = "Operador"  # C alto sem Abertura alta = perfil metódico
elif S >= 4.0:
    guep = "Operador"
else:
    guep = compute_from_big_five(big_five)  # fallback se DISC ambíguo
```

### 7.6 Fit Vaga-Pessoa

Para cada vaga, definir **perfil DISC alvo** + perfil GUÉP alvo:

- "Gerente Comercial Senior" → DISC alvo = `DI`, GUÉP = `Executor` ou `Influenciador`
- "Analista de Compliance Pleno" → DISC alvo = `CS`, GUÉP = `Operador`
- "Head de Estratégia" → DISC alvo = `CD` + Abertura alta, GUÉP = `Estrategista`
- "Gerente de Atendimento" → DISC alvo = `IS`, GUÉP = `Influenciador` ou `Operador`

Cálculo de fit: similaridade cosseno entre vetor (D,I,S,C) do candidato e vetor da vaga, normalizado.

---

## 8. Referências

1. Marston, W. M. (1928). *Emotions of Normal People.* Harcourt, Brace and Company. [Disponível em Internet Archive](https://archive.org/details/emotionsofnormal0000mars).
2. DiSC Profile (Inscape/Wiley) — History of DiSC. [https://www.discprofile.com/what-is-disc/history-of-disc](https://www.discprofile.com/what-is-disc/history-of-disc)
3. Wiley — Everything DiSC Content License Agreement (2024). [https://register.everythingdisc.com/Everything_DiSC_Content_License_Agreement.pdf](https://register.everythingdisc.com/Everything_DiSC_Content_License_Agreement.pdf)
4. Wiley — Legal/Trademark/Copyright Notice. [https://www.discprofile.com/legal-trademark-copyright-notice](https://www.discprofile.com/legal-trademark-copyright-notice)
5. International Personality Item Pool — Interpersonal Circumplex e itens dominance/influence. [https://ipip.ori.org/](https://ipip.ori.org/) · [https://ipip.ori.org/newCircumplexInterpersonalKey.htm](https://ipip.ori.org/)
6. Goldberg, L. R., et al. (2006). The international personality item pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40(1), 84–96. [https://ipip.ori.org/Goldberg_etal_2006_IPIP_JRP.pdf](https://ipip.ori.org/Goldberg_etal_2006_IPIP_JRP.pdf)
7. 123test.com (2018). *Concurrent validation study DISC vs. Big Five* [White paper, N=125]. [https://www.123test.com/content/disc-vs-big-five-123test.pdf](https://www.123test.com/content/disc-vs-big-five-123test.pdf)
8. Cogn-IQ (2024). DISC vs Big Five: Which Personality Framework Has Better Science? [https://www.cogn-iq.org/blog/disc-vs-big-five/](https://www.cogn-iq.org/blog/disc-vs-big-five/)
9. ERIC (Furnham et al.) — Comparing Correlations Between Four-Quadrant And Five-Factor Models. [https://files.eric.ed.gov/fulltext/EJ1054970.pdf](https://files.eric.ed.gov/fulltext/EJ1054970.pdf)
10. Springer Reference — Dominance, Influence, Steadiness, and Conscientiousness (DISC) Assessment Tool. [https://link.springer.com/rwe/10.1007/978-3-319-28099-8_25-1](https://link.springer.com/rwe/10.1007/978-3-319-28099-8_25-1)
11. Conselho Federal de Psicologia — SATEPSI Lista oficial e Nota Técnica sobre uso de testes não-aprovados. [https://satepsi.cfp.org.br/](https://satepsi.cfp.org.br/) · [https://satepsi.cfp.org.br/docs/notaTecnica.pdf](https://satepsi.cfp.org.br/docs/notaTecnica.pdf)
12. Birkeland, S. A., et al. (2006). A meta-analytic investigation of job applicant faking on personality measures. *International Journal of Selection and Assessment*. [https://onlinelibrary.wiley.com/doi/10.1111/j.1468-2389.2006.00354.x](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-2389.2006.00354.x)
13. Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD). [https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
