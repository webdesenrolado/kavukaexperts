# Dossiê 03 — Gallup CliftonStrengths Adaptado

> Marco 2 · Camada 3 (Performance / Forças) · Instrumento de **identificação de talentos/forças** — output em forma de "top forças" (Kavuka 12 talentos autorais) clusterizadas em 4 domínios.

---

## 1. Resumo executivo

O Gallup CliftonStrengths® (originalmente "StrengthsFinder", desenvolvido por Donald Clifton a partir dos anos 1960, comercializado pela Gallup desde 1999) avalia a presença de **34 talentos** clusterizados em **4 domínios** — Executing, Influencing, Relationship Building, Strategic Thinking — usando **177 itens em formato forced-choice** ([Gallup Technical Report](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)). Os 34 nomes de talentos e o algoritmo de scoring são **trademark e copyright Gallup** ([Partnering With Gallup](https://www.gallup.com/cliftonstrengths/en/350171/partnering-with-gallup.aspx)) — não podem ser reproduzidos. Psicometricamente, o instrumento tem **test-retest aceitável** mas **menos da metade dos 34 talentos atinge consistência interna adequada em amostras populacionais grandes** ([Gallup Technical Report 2019](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)). Validade preditiva existe na literatura Gallup interna; reviews independentes são raras. Recomendação Kavuka: **construir microsserviço `gallup-adapt` autoral** com **12 forças GUÉP autorais** clusterizadas em 4 domínios (executar, influenciar, relacionar, pensar estratégico — taxonomia clusterizada que é livre, são apenas categorias funcionais), usando **itens IPIP públicos + VIA-inspired + autoral GUÉP**, sem qualquer reprodução do banco Gallup. `score_weight_in_human_score: 0.20` — peso médio porque **adiciona variância nova** (orientação positiva — para que serve a pessoa — não capturada pelo Big Five tradicional, que mede traços neutros).

🚨 **Decisão crítica:** os 4 domínios (Executing/Influencing/Relationship/Strategic) **são taxonomia funcional, não exclusiva da Gallup** — não há marca registrada sobre a palavra "Executing" como categoria. Mas os **34 nomes de talentos são marcas registradas Gallup**. Construir 12 forças com nomes próprios (português inclusive) é defensável e diferenciável.

---

## 2. Status legal e licenciamento

### 2.1 Camadas legais do CliftonStrengths

| Item | Situação |
|---|---|
| **Marca "CliftonStrengths®" e "StrengthsFinder™"** | 🚨 Trademark Gallup ([Coaching Materials — Strengths Resources](https://strengthsresources.com/coaching-materials-how-to-get-copyright-right/)) |
| **34 nomes de talentos** (Achiever, Activator, Adaptability, etc.) | 🚨 **Cada um é trademark Gallup individualmente** ([Gallup Help](https://support.gallup.com/)) — não usar literalmente |
| **177 itens forced-choice e algoritmo de scoring** | 🚨 Copyright Gallup, não publicados ([Gallup Technical Report](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)) |
| **4 domínios genéricos (Executing/Influencing/Relationship Building/Strategic Thinking)** | Termos descritivos genéricos. Risco de marca **baixo** se usados como categoria, mas alto se usados em conjunto com "CliftonStrengths" ou "Gallup" |
| **Definições gerais ("forças são padrões recorrentes de pensamento, sentimento e comportamento")** | Conceito genérico de positive psychology, não exclusivo Gallup |

🚨 **Risco real:** copiar os 34 nomes é violação direta. Copiar a estrutura (177 itens forced-choice + Top 5) é zona cinza. **Construir 12 forças com nomes em PT-BR é defensável.**

### 2.2 Caminho recomendado para o Kavuka

> **Construir `gallup-adapt` v1.0 (renomear internamente "Forças Kavuka") com 12 forças autorais clusterizadas em 4 domínios funcionais, itens 100% IPIP/autorais.** Nunca dizer "compatível com CliftonStrengths" ou "alternativa à Gallup".

**Marketing:**
- ✅ "Forças Kavuka" / "Identificação de Forças"
- ✅ "12 talentos profissionais" / "modelo de forças orientado ao trabalho"
- ✅ "baseado em positive psychology (Seligman, Peterson, Clifton — referencial teórico)"
- 🚨 **Nunca:** "CliftonStrengths-like", "StrengthsFinder adaptado", "compatível com Gallup", uso dos 34 nomes Gallup mesmo traduzidos

### 2.3 Status SATEPSI/CFP

CliftonStrengths **não consta no SATEPSI**. Mesmo regime do DISC (dossiê 01 §2.3): uso em RH como sinalização, não como teste psicológico clínico. Linguagem descritiva, output não-classificatório.

### 2.4 Bases públicas alternativas consideradas

| Alternativa | Licença | Adequação |
|---|---|---|
| **VIA Character Strengths (Peterson & Seligman, 2004)** | Gratuito para uso individual; **TOS restringe uso comercial sem licença** ([viacharacter.org](https://www.viacharacter.org/)) | Bom como **referencial teórico**; copiar os 24 nomes não é seguro |
| **IPIP-VIA** | Goldberg desenvolveu adaptação IPIP de algumas forças VIA. **Domínio público** ([ipip.ori.org](https://ipip.ori.org/newVIA_Key.htm)) | Excelente fonte de itens |
| **HEXACO Honesty-Humility** | Itens IPIP públicos ([Ashton, Lee, Goldberg, 2007](https://projects.ori.org/lrg/PDFs_papers/Ashton_Lee_Goldberg_2007_PAID.pdf)) | Cobre uma força que Big Five não cobre — entra como insumo |
| **Schwartz PVQ-21 / PVQ-RR** | Disponível para uso acadêmico, contato com Schwartz para uso comercial ([repositório GVSU](https://scholarworks.gvsu.edu/orpc/vol2/iss2/9/)) | Bom para captura de **valores**, não talentos — pode entrar em outra camada |

**Decisão:** itens 100% **IPIP + IPIP-VIA + autorais GUÉP**. Schwartz PVQ entra em outro instrumento (camada de Valores), não no `gallup-adapt`.

---

## 3. Modelo teórico

### 3.1 Don Clifton e a positive psychology aplicada

Donald O. Clifton, fundador da SRI (depois adquirida pela Gallup), perguntou nos anos 1960: "e se estudássemos o que faz as pessoas terem sucesso, em vez do que faz elas adoecerem?" — pergunta que antecipou a positive psychology de Seligman. A premissa central: **as pessoas crescem mais investindo em forças naturais do que tentando consertar fraquezas.** Clifton operacionalizou isso identificando padrões recorrentes de pensamento/sentimento/comportamento ("temas de talento") via entrevistas qualitativas com profissionais de alta performance, depois validando os padrões via questionário quantitativo ([Gallup Science of CliftonStrengths](https://www.gallup.com/cliftonstrengths/en/253790/science-of-cliftonstrengths.aspx)).

### 3.2 Os 4 domínios (taxonomia genérica)

A Gallup organiza os 34 talentos em 4 domínios baseados em **função** — o que a pessoa traz para o time. Esses domínios são **categoria funcional genérica** (não exclusivos Gallup):

| Domínio Gallup | Função | Big Five primário ([Gallup Tech Report](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)) |
|---|---|---|
| **Executing** | Tornar acontecer — execução, finalização | Conscienciosidade |
| **Influencing** | Mover pessoas — alcançar e persuadir | Extroversão |
| **Relationship Building** | Conectar e cuidar do tecido social | Amabilidade |
| **Strategic Thinking** | Pensar e prever — análise, ideação, futuro | Abertura/Intelecto |

🚨 **Cada domínio mapeia praticamente 1:1 para um fator Big Five.** Implicação: o `gallup-adapt` adiciona **resolução** (nomes específicos, narrativas de força) mas **pouca variância nova** ao Score Humano, porque os 4 domínios já estão capturados pelo IPIP-NEO-120.

### 3.3 O que adiciona variância nova

O Gallup adiciona **valor diferenciado** ao Score Humano em 2 dimensões:

1. **Orientação positiva ao trabalho** — Big Five mede traços neutros ("é introvertido"); Gallup mede **para que a pessoa serve no contexto profissional** ("é Especialista que vai fundo, ou Conector que abre redes"). Isso é variância narrativa, não variância estatística.
2. **Granularidade de força específica** — dentro de "Strategic Thinking" há diferença entre "Analítico" (avalia evidências), "Ideação" (gera novidade), "Aprendiz" (busca novidade). Big Five não distingue.

Tradução para Score Humano: peso 0.20 (médio-baixo), focado em **enriquecer a narrativa do candidato**, não em substituir Big Five.

### 3.4 Limitações psicométricas conhecidas

🚨 **Internal consistency:** o próprio relatório técnico Gallup admite que "less than half of the strength themes demonstrated adequate internal consistency in multiple large, general population samples" ([Gallup Technical Report](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)). Isso é uma **fragilidade real**: alguns dos 34 talentos não são escalas estatisticamente coerentes.

🚨 **Forced-choice + ipsativo:** os 177 itens são pares de afirmações ("Eu sou mais X" ou "Eu sou mais Y"). Isso produz **dados ipsativos** (a soma é constante) — bom para forçar diferenciação, ruim para correlacionar com escalas externas e calcular fit por similaridade vetorial.

🚨 **Validação predominantemente interna:** quase toda a literatura é de pesquisadores Gallup, publicada em white papers internos. Há poucos estudos peer-review independentes.

🚨 **Test-retest do Top 5:** o Top 5 é mais estável que os 34 ranqueados completos. A ordem dos Top 5 muda, mas a presença geralmente persiste em ~70% em retest de 1+ ano ([Gallup white paper](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)).

### 3.5 Por que adaptar (não copiar)

1. **Risco legal de copiar 34 nomes** = violação trademark direta.
2. **Custo de licenciar Gallup** = USD $25–50 por aplicação (proibitivo para ATS de massa).
3. **Resolução excessiva** — 34 talentos em ~Top 5 é cognitivamente sobrecarregado para recrutador. **12 forças** são suficientes para granularidade narrativa.
4. **Adaptação cultural** — terminologia em PT-BR pensada para o mercado brasileiro: "Realizador" funciona melhor que tradução literal de "Achiever".

---

## 4. Estrutura de itens

### 4.1 Recomendação Kavuka (`gallup-adapt` v1.0)

- **Total:** 60 itens (5 por força × 12 forças)
- **Origem:** IPIP + IPIP-VIA + autorais GUÉP — 100% sem itens Gallup
- **Formato:** Likert 5 pontos, **não** forced-choice (mantém compatibilidade com pipeline Big Five)
- **Tempo:** 8–12 min
- **Stem:** "No trabalho, eu..." ou "Eu sou alguém que..."
- **Output:** Top 5 forças do candidato + scores em todas as 12 + clusterização nos 4 domínios

### 4.2 Os 12 talentos GUÉP (proposta)

Lista candidata, organizada nos 4 domínios. **Calibrar com piloto antes de fechar.** Cada nome em PT-BR foi escolhido para evitar tradução literal de qualquer um dos 34 Gallup ou 24 VIA.

#### Domínio "Executar" (Executing — Big Five C)
1. **Realizador** — energia para finalizar o que começa (≈ análoga genérica a "Achiever")
2. **Disciplinado** — ordem, rotina, padrões claros (≈ "Discipline")
3. **Responsável** — cumpre o combinado, dono do compromisso

#### Domínio "Influenciar" (Influencing — Big Five E)
4. **Comandante** — toma decisão, assume liderança em ambiguidade
5. **Comunicador** — faz a ideia chegar, tradutor entre mundos
6. **Mobilizador** — acende ação coletiva, energiza o time

#### Domínio "Relacionar" (Relationship Building — Big Five A)
7. **Empático** — sente o estado do outro, traduz o não-dito
8. **Desenvolvedor** — vê potencial em pessoas e investe nelas
9. **Conector** — costura redes, sabe quem conhece quem

🚨 **Nota:** "Conector" também é um Label GUÉP (dossiê 02). Decidir UX: ou rebatizar essa força como "Articulador" para evitar colisão, ou aceitar que Label e Força podem ter o mesmo nome (Label é derivado, Força é medida). Recomendação: **rebatizar para "Articulador"** para evitar confusão.

#### Domínio "Pensar Estratégico" (Strategic Thinking — Big Five O)
10. **Analítico** — pesa evidências, busca padrões e causalidade
11. **Idealizador** — gera ideias novas, vê possibilidades
12. **Aprendiz** — energizado por aprender, devora novidade conceitual

### 4.3 Exemplo de itens (autorais ou IPIP/IPIP-VIA, públicos)

🚨 **Não reproduzir itens Gallup.** Os exemplos abaixo são IPIP públicos ([ipip.ori.org/newVIA_Key.htm](https://ipip.ori.org/newVIA_Key.htm)) ou autorais GUÉP:

| Força | Item exemplo |
|---|---|
| **Realizador** | *"Get chores done right away."* (IPIP-NEO C-Achievement-Striving, +) |
| **Disciplinado** | *"Like to keep things organized."* (IPIP, +) |
| **Comunicador** | *"Find it easy to express my ideas in words."* (IPIP-VIA Communication, +) |
| **Empático** | *"Sympathize with others' feelings."* (IPIP, +) |
| **Desenvolvedor** | *"Take pleasure in helping others to learn."* (autoral GUÉP, +) |
| **Analítico** | *"Like to solve complex problems."* (IPIP, +) |
| **Idealizador** | *"Have a vivid imagination."* (IPIP, +) |
| **Aprendiz** | *"Love to read challenging material."* (IPIP-VIA Love-of-Learning, +) |

**Tradução PT-BR:**

1. *"Costumo finalizar minhas tarefas o quanto antes."* (Realizador, +)
2. *"Tenho facilidade em explicar minhas ideias em palavras."* (Comunicador, +)
3. *"Sinto o que as pessoas ao meu redor estão sentindo."* (Empático, +)
4. *"Gosto de resolver problemas complexos."* (Analítico, +)

🚨 Tradução acima é **proposta de partida** — validar com psicólogo + piloto cognitivo.

### 4.4 Validação obrigatória antes de produção

- [ ] Banco de 60 itens autorais/IPIP/IPIP-VIA em PT-BR
- [ ] Revisão por psicólogo registrado (CFP)
- [ ] Piloto cognitivo think-aloud N=30
- [ ] Piloto quantitativo N=500 com IPIP-NEO-120 paralelo
- [ ] Confirmar correlações esperadas:
  - Domínio Executar ↔ Big Five C ≥ 0,5
  - Domínio Influenciar ↔ Big Five E ≥ 0,5
  - Domínio Relacionar ↔ Big Five A ≥ 0,5
  - Domínio Pensar ↔ Big Five O ≥ 0,5
- [ ] Aceitar internal consistency mínima α ≥ 0,70 por força (descartar/refazer forças com α < 0,70)

---

## 5. Lógica de scoring

### 5.1 Score por força (12)

```
score_forca_i = média(itens da força_i, com inversão)  → escala 1–5
```

### 5.2 Score por domínio (4)

```
score_dominio_executar = média(score_realizador, score_disciplinado, score_responsavel)
# análogo para os outros 3
```

### 5.3 Top 5 forças

```
top_5 = sort_descending(score_forca_1, ..., score_forca_12)[:5]
```

🚨 **Diferença crítica vs. Gallup:** o Gallup ranqueia 34. Nós ranqueamos 12. Top 5 sobre 12 é **mais expressivo** (~42% das forças no Top vs. ~15% no Gallup), o que reduz o efeito de "minha força nº 1 é Achiever, mas a nº 11 também é boa" — no nosso modelo, top 5 dentre 12 já discrimina bem o perfil.

### 5.4 Modo `derived`

Se candidato fez IPIP-NEO-120 e DISC, podemos derivar perfil de forças sem aplicar 60 itens novos:

```
realizador  ≈ z(C.achievement_striving) + z(C.self_efficacy)
disciplinado ≈ z(C.orderliness) + z(C.dutifulness)
comunicador ≈ z(E.assertiveness) + z(O.imagination)
empatico    ≈ z(A.sympathy) + z(N.depression — inverso)
analitico   ≈ z(O.intellect) + z(C.deliberation)
# ... etc
```

Reportar `mode: "derived"`. Modo `direct` aplica os 60 itens.

### 5.5 JSON canônico

```json
{
  "instrument": "gallup_adapt",
  "version": "1.0.0",
  "mode": "direct",
  "scores": {
    "top_5": ["Analítico", "Realizador", "Aprendiz", "Comunicador", "Empático"],
    "all_12": {
      "Realizador": 4.4,
      "Disciplinado": 3.6,
      "Responsável": 3.9,
      "Comandante": 3.2,
      "Comunicador": 4.1,
      "Mobilizador": 3.5,
      "Empático": 4.0,
      "Desenvolvedor": 3.7,
      "Articulador": 3.8,
      "Analítico": 4.6,
      "Idealizador": 3.4,
      "Aprendiz": 4.3
    },
    "domain_scores": {
      "Executar": 3.97,
      "Influenciar": 3.60,
      "Relacionar": 3.83,
      "Pensar Estratégico": 4.10
    },
    "primary_domain": "Pensar Estratégico"
  },
  "score_weight_in_human_score": 0.20,
  "norm_source": "internal_pilot_n_500_BR_2026"
}
```

---

## 6. Interpretação

### 6.1 Narrativa por força (esqueleto Kavuka)

Cada uma das 12 forças recebe um perfil narrativo de 200-300 palavras: (i) como a força aparece no dia a dia, (ii) que tipo de problema essa força resolve melhor, (iii) que parceria de equipe complementa essa força (Realizador + Idealizador, Empático + Comandante, etc.), (iv) que watchout existe (Realizador pode pular qualidade, Empático pode evitar conflito necessário).

### 6.2 Watchouts críticos

🚨 **Não há "força melhor" que outra.** Documentação UX deve enfatizar isso. Uma equipe ideal tem **diversidade de forças** — 4 Realizadores não é melhor que 1 Realizador + 1 Empático + 1 Analítico + 1 Mobilizador.

🚨 **Forças não são imutáveis** — uma pessoa pode ter "Analítico" baixo e ainda fazer trabalho analítico bem; significa só que isso não é onde ela tem **energia natural**. Não é gate.

🚨 **Faking good** — em contexto de seleção, candidatos elevam Realizador, Comunicador e Comandante (mais "vendáveis"). Mitigar: triangulação com Big Five (Conscienciosidade declarada vs. medida), itens reversos, validação cruzada.

🚨 **Não usar Top 5 como filtro de seleção** — se a vaga "exige Realizador" e candidato não tem no Top 5, isso **não significa** que ele não vai performar. Pode significar que ele é Analítico-Disciplinado e entrega resultado por outra rota.

🚨 **Linguagem responsável:** evitar "você é fraco em Empatia" (negativo) → preferir "sua energia natural está em outras forças; Empatia é uma força a desenvolver se for relevante para sua jornada".

🚨 **Resultado é frágil quando:** (a) tempo de resposta < 4 min, (b) > 50% respostas no neutro, (c) padrão linear, (d) discordância forte entre `direct` e `derived`.

---

## 7. Aplicação no contexto Kavuka

### 7.1 Posição na arquitetura

**Camada 3 — Performance / Forças.** O `gallup-adapt` é o **anchor** desta camada, complementando o Big Five (Camada 1) e o DISC (Camada 2) com **orientação positiva ao trabalho**.

### 7.2 Por que peso médio (0.20) no Score Humano

| Razão | Detalhe |
|---|---|
| **Adiciona variância nova** (orientação ao trabalho) | Big Five mede traços neutros; Gallup-adapt mede para que a pessoa serve |
| **Mas correlaciona com Big Five (~0,5 por domínio)** | Os 4 domínios mapeiam para 4 fatores Big Five — peso alto seria dupla contagem |
| **Resultado:** peso 0.20 | Captura a granularidade narrativa sem dobrar o Big Five |

### 7.3 Mapeamento Score Humano

| Score Humano sub-dimensão | Gallup-adapt contribuição |
|---|---|
| **Confiabilidade operacional** | +Realizador · +Disciplinado · +Responsável |
| **Energia colaborativa** | +Comunicador · +Empático · +Articulador |
| **Adaptabilidade cognitiva** | +Aprendiz · +Idealizador |
| **Resiliência sob pressão** | +Disciplinado · +Realizador (resiste à fadiga via foco) |
| **Liderança/influência** | +Comandante · +Mobilizador · +Desenvolvedor |

### 7.4 Mapeamento Gallup → perfis comportamentais GUÉP

| Perfil GUÉP | Domínio dominante esperado | Forças típicas no Top 5 |
|---|---|---|
| **Executor** | Executar | Realizador · Disciplinado · Comandante · Responsável |
| **Estrategista** | Pensar Estratégico | Analítico · Idealizador · Aprendiz · Curador (do Label, mapeia) |
| **Operador** | Executar (com viés Relacionar) | Disciplinado · Responsável · Empático |
| **Influenciador** | Influenciar / Relacionar | Comunicador · Mobilizador · Articulador · Empático |

🚨 Mapeamento heurístico — calibrar com cluster analysis em produção.

### 7.5 Mapeamento Gallup → Labels (dossiê 02)

| Label | Forças Gallup-adapt típicas |
|---|---|
| **Construtor** | Realizador + Disciplinado |
| **Curador** | Analítico + Disciplinado |
| **Catalisador** | Mobilizador + Idealizador + Aprendiz |
| **Conector** | Articulador + Comunicador + Empático |
| **Mentor** | Desenvolvedor + Empático + Comunicador |
| **Especialista** | Analítico + Aprendiz + Disciplinado |
| **Guardião** | Disciplinado + Responsável + Empático |
| **Explorador** | Aprendiz + Idealizador |

### 7.6 Fit Vaga-Pessoa

Para cada vaga, definir **forças ideais**:

- "Líder de Inovação" → forças ideais = `[Idealizador, Mobilizador, Aprendiz, Comunicador]`
- "Analista de Compliance" → `[Disciplinado, Responsável, Analítico]`
- "BDR Comercial" → `[Comunicador, Mobilizador, Realizador]`
- "Tech Lead" → `[Analítico, Disciplinado, Desenvolvedor, Aprendiz]`

Cálculo de fit: similaridade entre vetor de 12 forças do candidato e vetor da vaga (Jaccard sobre top-5 ou cosseno sobre vetor pleno).

### 7.7 Quando rodar `gallup-adapt` em vez de `derived`

| Cenário | Modo |
|---|---|
| Candidato senior, executivo, alto stake | `direct` (60 itens, narrativa rica) |
| Candidato operacional, gargalo de conversão | `derived` (zero itens novos, baseado em Big Five) |
| Re-aplicação 6 meses depois | `derived` |
| Candidato sem Big Five aplicado | `direct` obrigatório |
| Cliente enterprise pediu "queremos forças" | `direct` |

---

## 8. Referências

1. Clifton, D. O., & Harter, J. K. (2003). Investing in strengths. In K. S. Cameron et al. (Eds.), *Positive Organizational Scholarship.* Berrett-Koehler. — fundamento conceitual de "investir em força > consertar fraqueza".
2. Asplund, J., Agrawal, S., & Hodges, T. (2019). *The CliftonStrengths Technical Report: Development and Validation of the Clifton StrengthsFinder.* Gallup. [https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf](https://files.wmich.edu/s3fs-public/attachments/u590/2019/cliftonstrengths_technical_report.pdf)
3. Gallup — Science of CliftonStrengths. [https://www.gallup.com/cliftonstrengths/en/253790/science-of-cliftonstrengths.aspx](https://www.gallup.com/cliftonstrengths/en/253790/science-of-cliftonstrengths.aspx)
4. Gallup — Partnering With Gallup (licensing terms). [https://www.gallup.com/cliftonstrengths/en/350171/partnering-with-gallup.aspx](https://www.gallup.com/cliftonstrengths/en/350171/partnering-with-gallup.aspx)
5. Gallup — What Are the 34 CliftonStrengths Themes? [https://www.gallup.com/cliftonstrengths/en/253715/34-cliftonstrengths-themes.aspx](https://www.gallup.com/cliftonstrengths/en/253715/34-cliftonstrengths-themes.aspx)
6. Wikipedia — CliftonStrengths (curated reference list with critical perspective). [https://en.wikipedia.org/wiki/CliftonStrengths](https://en.wikipedia.org/wiki/CliftonStrengths)
7. Peterson, C., & Seligman, M. E. P. (2004). *Character Strengths and Virtues: A Handbook and Classification.* APA / Oxford University Press. [https://psycnet.apa.org/record/2004-13277-000](https://psycnet.apa.org/record/2004-13277-000) — referencial de positive psychology e VIA framework.
8. VIA Institute on Character. [https://www.viacharacter.org/](https://www.viacharacter.org/) · [https://www.viacharacter.org/character-strengths-and-virtues](https://www.viacharacter.org/character-strengths-and-virtues)
9. International Personality Item Pool — IPIP-VIA scales. [https://ipip.ori.org/newVIA_Key.htm](https://ipip.ori.org/newVIA_Key.htm)
10. Goldberg, L. R., et al. (2006). The international personality item pool and the future of public-domain personality measures. *Journal of Research in Personality*. [https://ipip.ori.org/Goldberg_etal_2006_IPIP_JRP.pdf](https://ipip.ori.org/Goldberg_etal_2006_IPIP_JRP.pdf)
11. Schwartz, S. H., & Cieciuch, J. (2022). Measuring the Refined Theory of Individual Values in 49 Cultural Groups: Psychometrics of the Revised Portrait Value Questionnaire. *Assessment*, 29(5), 1005–1019. [https://pmc.ncbi.nlm.nih.gov/articles/PMC9131418/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9131418/) — referência conceitual para a camada de Valores (futuro instrumento separado).
12. Conselho Federal de Psicologia — SATEPSI. [https://satepsi.cfp.org.br/](https://satepsi.cfp.org.br/)
13. Lei nº 13.709/2018 (LGPD). [https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
