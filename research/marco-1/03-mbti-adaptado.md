# Dossiê 03 — MBTI Adaptado (recomendação: OEJTS como base)

> Marco 1 · Camada 1 (Base científica) · Instrumento de **tipologia 16 letras** — output em formato MBTI-like, sem usar MBTI literal.

---

## 1. Resumo executivo

O Myers-Briggs Type Indicator (MBTI) original é **proprietário, com trademark da Myers & Briggs Foundation e licença comercial exclusiva pela The Myers-Briggs Company** ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/Trademarks)) — não pode ser reproduzido nem adaptado sem licença formal e taxa por aplicação. Além do problema legal, o MBTI tem **graves problemas psicométricos**: 39%–76% dos respondentes obtêm tipo diferente em retest após 5 semanas ([Pittenger, 1993; Stein & Swan, 2019, *Social and Personality Psychology Compass*](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)), e a estrutura dicotômica (4 letras) **não tem suporte fatorial em meta-análises** ([Stein & Swan, 2019](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)). Recomendação para o Kavuka: **adotar o Open Extended Jungian Type Scales (OEJTS) v1.2 de Eric Jorgenson como base do microsserviço, e expor ao usuário final o output como "16 letras estilo Jung"**, sem usar a marca MBTI. Justificativa: OEJTS é open source (Creative Commons BY-NC-SA, validado em N=25.568), entrega exatamente as 4 dicotomias (E/I, S/N, T/F, J/P) que o usuário leigo espera ver, e fica defensável em auditoria CFP/LGPD por ter base aberta.

🚨 **Recomendação adicional crítica:** o output do microsserviço deve **sempre apresentar as 16 letras como "perfil narrativo de preferências cognitivas" e nunca como diagnóstico ou predição de desempenho.** O MBTI-like serve como ferramenta de UX e auto-conhecimento; **o peso real no Score Humano vem do Big Five (IPIP-NEO-120)**, não do MBTI.

---

## 2. Status legal e licenciamento

### 2.1 MBTI original — não usar

| Item | Situação |
|---|---|
| **Trademark** | "Myers-Briggs Type Indicator", "MBTI", "Step I/II/III", logo MBTI — todos registrados pela Myers & Briggs Foundation, Inc. ([Myers & Briggs Foundation](https://www.myersbriggs.org/legal/)) |
| **Publisher exclusivo** | The Myers-Briggs Company (ex-CPP, Inc.) desde 1975 ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/Copyright-and-Permissions)) |
| **Licença para uso comercial** | Exigida, com taxa por aplicação. Adaptações, traduções e modificações precisam de permissão escrita ([Myers-Briggs Trademark Guidelines, PDF](https://www.mbtionline.com/-/media/MBTIonline/Files/Trademark_Guidelines.pdf)) |
| **Reproduzir itens do MBTI?** | 🚨 Proibido sem licença. Risco real de cease-and-desist. |
| **Usar a sigla "MBTI" no produto?** | 🚨 Violação de trademark — alto risco. |
| **Dizer "compatível com MBTI"?** | Zona cinza arriscada. Trademark Guidelines proíbem comparações que sugiram afiliação. |

### 2.2 Alternativas legais comparadas

| Instrumento | Licença | Validação | Risco legal | Risco de marca |
|---|---|---|---|---|
| **MBTI original** | Proprietário, USD ~50/aplicação | Baixa (test-retest 39–76% inconsistente) | 🚨 Alto sem licença | 🚨 Alto |
| **16Personalities / NERIS** | Proprietário fechado | Não publica psicometria revisada por pares | Médio (clonar UX é violação) | Médio |
| **Keirsey Temperament Sorter II** | Proprietário, Keirsey.com | Validação limitada, sem manual técnico ([Wikipedia](https://en.wikipedia.org/wiki/Keirsey_Temperament_Sorter)) | Médio-alto | Médio |
| **OEJTS v1.2** | **CC BY-NC-SA 4.0** ([openpsychometrics.org](https://openpsychometrics.org/tests/OJTS/development/OEJTS1.2.pdf)) | N=25.568, alfa "good to excellent" reportado, factor analysis confirma 4 escalas ([OpenJung research](https://openjung.org/research/)) | Baixo | Baixo |
| **Open Jungian Type Scales (OJTS, original)** | Open source | N≈10.000, mas substituído pelo OEJTS na prática | Baixo | Baixo |

🚨 **CC BY-NC-SA 4.0 e o problema do "NC" (Non-Commercial):** a licença Creative Commons NonCommercial-ShareAlike **proíbe uso primariamente comercial** dos itens em sua forma original. Isso é um problema relevante para um SaaS de RH pago.

### 2.3 Caminho recomendado para o Kavuka

> **Construir o microsserviço `mbti-like` em duas camadas:**
>
> 1. **Camada de framework (gratuita):** estrutura conceitual de 4 dicotomias jungianas (E/I, S/N, T/F, J/P) é **idéia, não obra** — Jung publicou em 1921, é público desde sempre. **Não tem dono.**
>
> 2. **Camada de itens (autoral GUÉP, inspirada na metodologia OEJTS):** escrever **64 itens próprios** (16 por dicotomia) seguindo o método publicado por Jorgenson — pares de descrições opostas em escala 5 pontos. Isso evita a cláusula "NC" do CC BY-NC-SA porque **a obra é nossa**, apenas a metodologia é referenciada (metodologia não é copyright).
>
> 3. **Validação:** estudo piloto N≥500 BR, comparar com IPIP-NEO-120 já aplicado na mesma população (medir convergência E↔Extroversão, T/F↔Amabilidade, S/N↔Abertura, J/P↔Conscienciosidade — convergências esperadas a partir de [McCrae & Costa, 1989, *J. Personality*](https://onlinelibrary.wiley.com/doi/10.1111/j.1467-6494.1989.tb00759.x)).

Resultado: produto com a **expressão "16 letras"** que o usuário pede, **sem violar trademark MBTI, sem licença NC**, e com base científica auditável.

🚨 **Marketing:** nunca usar "MBTI", "Myers-Briggs", "Myers & Briggs". Usar **"Perfil de preferências cognitivas (modelo jungiano)"** ou **"GUÉP 16-Tipos"**. Documentação interna pode citar Jung e Jorgenson; documentação externa não cita MBTI.

---

## 3. Modelo teórico

### 3.1 As 4 dicotomias jungianas

Origem: Carl Jung, *Psychological Types* (1921). As dicotomias são preferências sobre **como a pessoa direciona energia, processa informação, toma decisão e organiza vida**:

| Dicotomia | Polo A | Polo B |
|---|---|---|
| **Atitude (energia)** | Extroversion (E) — direciona para fora | Introversion (I) — direciona para dentro |
| **Percepção (input)** | Sensing (S) — concreto, fatos | iNtuition (N) — abstrato, padrões |
| **Julgamento (decisão)** | Thinking (T) — lógica impessoal | Feeling (F) — valores pessoais |
| **Orientação (lifestyle, adicionada por Myers)** | Judging (J) — fechar, decidir | Perceiving (P) — abrir, manter opções |

A 4ª dicotomia (J/P) **não está em Jung** — foi acréscimo de Isabel Myers para distinguir qual função (julgamento ou percepção) é dominante na atitude extrovertida. Esse acréscimo é uma das fontes de fragilidade psicométrica do MBTI, porque a J/P se sobrepõe parcialmente à C de Conscienciosidade do Big Five.

### 3.2 Convergência com o Big Five

A **única forma defensável** de usar tipos jungianos hoje é reconhecer que cada dicotomia mapeia para um (ou parte de um) fator do Big Five — confirmado em meta-análises:

| Dicotomia jungiana | Correlato Big Five |
|---|---|
| E/I | Extroversão (E) — quase 1:1 |
| S/N | Abertura (O) — N (intuição) ↔ Abertura alta |
| T/F | Amabilidade (A) — F ↔ Amabilidade alta |
| J/P | Conscienciosidade (C) — J ↔ Conscienciosidade alta |
| (sem dicotomia MBTI) | Neuroticismo — **não capturado pelo MBTI** |

Fonte: [McCrae & Costa, 1989](https://onlinelibrary.wiley.com/doi/10.1111/j.1467-6494.1989.tb00759.x), e replicado em meta-análises subsequentes ([Furnham, 1996, *Personality and Individual Differences*](https://www.sciencedirect.com/science/article/abs/pii/0191886995002060)).

🚨 Implicação operacional crítica: **rodar MBTI-like e Big Five no mesmo candidato é redundante em 4 dos 5 fatores.** O MBTI-like deve existir no Kavuka **apenas como camada de UX/narrativa**, não como medida independente que entra no Score Humano com peso autônomo. Caso contrário, dupla contagem.

### 3.3 Por que ainda assim implementar a "tipologia 16"

1. **Demanda de mercado real:** candidatos brasileiros conhecem 16Personalities e pedem "INFJ", "ESTP" etc. Recusar dá fricção comercial.
2. **Output narrativo é mais palatável** para leigos do que percentis de Big Five — perfis tipológicos funcionam como história.
3. **Diferenciação visual** no "Super Trunfo do profissional" — perfil em 4 letras é selo memorável.

### 3.4 NERIS / 16Personalities

O 16Personalities usa o framework "NERIS Type Explorer", que **declara-se híbrido Big Five + tipologia jungiana** ([16personalities.com/articles/our-theory](https://www.16personalities.com/articles/our-theory)). Adicionam um 5º eixo, A/T (Assertive/Turbulent), que é **Neuroticismo renomeado**. **Não publica psicometria revisada por pares.** Não é fonte científica e não pode ser clonado (é produto fechado).

### 3.5 OEJTS — fundamentação para uso como base metodológica

- **Autor:** Eric Jorgenson, em colaboração com Open Source Psychometrics Project ([openpsychometrics.org/tests/OJTS/](https://openpsychometrics.org/tests/OJTS/))
- **Versão:** 1.2 (2017)
- **Estrutura:** 32 pares de descrições opostas, escala Likert 5 pontos, 4 escalas (E/I, S/N, T/F, J/P) com 8 pares cada
- **Sample de desenvolvimento:** N=25.568 respondentes online, todos com tipo MBTI conhecido auto-reportado
- **Análise:** redução de pool inicial de 278 itens para 32 finais via análise de discriminação
- **Reliability:** alfas reportados pelo autor como "good to excellent" para as 4 escalas, com factor analysis confirmando estrutura de 4 fatores ([OpenJung Research & Methodology](https://openjung.org/research/))
- 🚨 **Limitação:** psicometria publicada **fora de peer-review** — está apenas em paper não-publicado e site openpsychometrics.org. Para uso em produto SaaS BR auditado, **rodar validação própria é obrigatório**.

---

## 4. Estrutura de itens

### 4.1 Recomendação Kavuka (`mbti-like` v1.0)

- **Total:** 64 itens autorais (16 por dicotomia, 8 chave-positiva e 8 chave-negativa por escala — balanceamento de aquiescência) — **mais granular que OEJTS**
- **Formato:** Likert 5 pontos, declarações simples ("Eu sou alguém que...")
- **Tempo:** 6–9 min
- **Stem:** "Em geral, eu...", para reduzir efeito de estado momentâneo

### 4.2 Exemplo de estilo (autoral, inspirado em OEJTS)

> Os itens abaixo são **propostas autorais GUÉP** seguindo a metodologia OEJTS (pares dicotômicos), **não são reproduções** do OEJTS nem do MBTI:

1. *"Em uma reunião nova, eu prefiro participar ativamente das conversas a observar antes de me posicionar."* (E, +)
2. *"Confio mais em fatos verificáveis do que em palpites sobre o que pode acontecer."* (S, +)
3. *"Quando preciso decidir algo difícil, eu peso primeiro o impacto nas pessoas envolvidas."* (F, +)
4. *"Prefiro fechar planos com antecedência a manter opções em aberto."* (J, +)
5. *"Costumo perceber padrões e conexões que outras pessoas não notam de imediato."* (N, +)

🚨 Os itens definitivos devem passar por: (i) revisão por psicólogo registrado, (ii) piloto cognitivo (think-aloud) com N≥30, (iii) piloto quantitativo N≥500 com análise fatorial confirmatória, (iv) teste de invariância por gênero/região/escolaridade.

### 4.3 Por que escolha forçada (forced-choice) NÃO é recomendada

O MBTI Step II usa formato escolha forçada ("Você prefere A ou B?"). Vantagem teórica: força preferência. Desvantagens reais: (a) perde resolução (perde a magnitude da preferência), (b) dificulta análise psicométrica clássica por gerar dados ipsativos, (c) frustra o respondente com pares mal calibrados ([Stein & Swan, 2019](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)). **Manter Likert.**

---

## 5. Lógica de scoring

### 5.1 Score por dicotomia

```
score_E_vs_I = Σ(itens chave-E, com inversão dos chave-I)  → escala -16 a +16 (com 16 itens)
                ou normalizada para 0–100 onde 50 = neutro
```

Mesmo procedimento para S/N, T/F, J/P.

### 5.2 Determinação da letra

```
letra = "E" se score_E_vs_I > limiar_neutro, senão "I"
       (similar para outras 3 dicotomias)
```

Limiar default: 0 (ponto médio). 🚨 **Reportar sempre a magnitude da preferência**, não apenas a letra. Pessoas com score próximo de zero ("X" no MBTI Step I) têm chance de ~50% de mudar de letra em retest — dado conhecido desde [Pittenger, 1993, *Review of Educational Research*](https://www.scribd.com/document/64500488/Measuring-the-MBTI-And-Coming-Up-Short-1993-Pittenger).

Recomendação UX: além das 4 letras, exibir **força da preferência em 3 níveis** (clara, moderada, leve). Para preferência "leve" (score em [-3, +3]), exibir a letra com asterisco e explicação textual sobre flexibilidade.

### 5.3 Os 16 tipos como concatenação

Output: string de 4 letras (ex.: `INFJ`, `ESTP`). Sem espaço para ambiguidade no JSON canônico, mas com `confidence_per_dimension` no payload:

```json
{
  "instrument": "mbti_like",
  "version": "1.0.0",
  "scores": {
    "type": "INFJ",
    "dimensions": {
      "E_I": {"letter": "I", "score": -7, "confidence": "moderate"},
      "S_N": {"letter": "N", "score": +9, "confidence": "clear"},
      "T_F": {"letter": "F", "score": +4, "confidence": "moderate"},
      "J_P": {"letter": "J", "score": +2, "confidence": "low"}
    }
  }
}
```

### 5.4 Sem normas populacionais necessárias

Diferente do Big Five, o MBTI-like usa pontos médios absolutos, não percentis populacionais — então **não exige normas BR para v1.0**. Vantagem operacional para o lançamento.

---

## 6. Interpretação

### 6.1 Narrativa por tipo

Cada um dos 16 tipos recebe um perfil narrativo curto (200–400 palavras) cobrindo: (i) modo de operar dominante, (ii) ambientes que tendem a energizar, (iii) ambientes que tendem a esgotar, (iv) padrões de comunicação, (v) padrões de decisão. **Os 16 textos devem ser autorais GUÉP** (não copiar do 16Personalities).

### 6.2 Watchouts críticos

🚨 **Test-retest baixo é fato científico, não bug.** A literatura mostra 39%–76% de mudança de tipo em retest curto ([Pittenger, 1993](https://www.scribd.com/document/64500488/Measuring-the-MBTI-And-Coming-Up-Short-1993-Pittenger); [Stein & Swan, 2019](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)). A causa: dicotomia força um corte binário em variável que é distribuída como contínuo gaussiano. Mitigação UX: exibir score contínuo + letra, e explicar ao usuário que tipos "no limite" são fluidos.

🚨 **Forer Effect / Barnum Effect:** narrativas de tipos são frequentemente percebidas como precisas mesmo quando aleatorizadas, porque são **suficientemente vagas** para servir a quase qualquer pessoa ([Pittenger, 1993](https://www.scribd.com/document/64500488/Measuring-the-MBTI-And-Coming-Up-Short-1993-Pittenger)). Mitigação: textos do GUÉP devem ter **especificidade verificável** (ex.: "tende a preferir reuniões agendadas a interações espontâneas no corredor"), não generalidades reconfortantes.

🚨 **Não usar tipo como gate de seleção.** Em meta-análises, MBTI tem validade preditiva de job performance ~0,10 — equivalente ao Big Five médio, **e o ganho explicativo é redundante com Big Five** ([Furnham, 1996](https://www.sciencedirect.com/science/article/abs/pii/0191886995002060)). Discriminar candidato por tipo MBTI-like pode ser questionado em auditoria. **Tipo é narrativa, Big Five é métrica.**

🚨 **Não há tipo "melhor".** Documentação UX deve enfatizar isso explicitamente. Em ATS, é tentador para um recrutador ver "ESTJ" e assumir liderança — mas estudos mostram que líderes efetivos vêm de todos os 16 tipos ([Stein & Swan, 2019](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)).

🚨 **Resultado é frágil quando:** (a) score de qualquer dimensão está em [-3, +3] (preferência leve), (b) tempo de resposta < 4 min, (c) candidato em segunda aplicação tem ≥ 2 letras diferentes da primeira (sinalizar inconsistência de auto-percepção, não erro do teste).

---

## 7. Aplicação no contexto Kavuka

### 7.1 Posição na arquitetura

**Camada 1 — Base científica.** Mas com peso baixo no Score Humano.

### 7.2 Peso no Score Humano: idealmente zero

Como demonstrado em §3.2, as 4 dicotomias do MBTI-like são redundantes com 4 dos 5 fatores Big Five já capturados pelo IPIP-NEO-120. Então:

> **O `mbti-like` NÃO deve contribuir features brutas para o Score Humano.** Sua função é **narrativa de saída para o candidato e UX**, não input para decisão.

Implicação JSON: o output do `mbti-like` é consumido pelo "Super Trunfo do profissional" (UX) e pelo módulo de narrativa do KYY (Know Your You), mas **não é injetado no pipeline de scoring do Score Humano**. Documentar essa decisão arquitetural explicitamente.

### 7.3 Validação cruzada com IPIP-NEO-120

Se o candidato já fez `bigfive-full`, podemos **derivar o tipo MBTI-like a partir do Big Five** com regras simples:

- Se Extroversão > p50 → E, senão I
- Se Abertura > p50 → N, senão S
- Se Amabilidade > p50 → F, senão T
- Se Conscienciosidade > p50 → J, senão P

Isso evita rodar 64 itens adicionais quando temos o Big Five. **Recomendação operacional:** o microsserviço `mbti-like` deve ter dois modos:
- **`mode: "derived"`** — calcula tipo a partir de Big Five existente (zero itens adicionais)
- **`mode: "direct"`** — aplica os 64 itens autorais (quando candidato não tem Big Five ou quer narrativa específica)

Comparar os dois modos em produção dá uma medida de validade convergente do instrumento.

### 7.4 Mapeamento perfis GUÉP

Os 4 perfis comportamentais GUÉP (Executor / Estrategista / Operador / Influenciador) **não devem ser determinados pelo MBTI-like.** Eles são produto da síntese do Big Five + DISC + outros instrumentos da Camada 2+. O MBTI-like apenas adiciona uma **etiqueta paralela** (16 letras) que coexiste com o perfil GUÉP no card do candidato.

Mapeamento aproximado para sanidade interna (não para classificação automática):

| Perfil GUÉP | Tipos MBTI-like prováveis (não exclusivos) |
|---|---|
| **Executor** | ESTJ, ENTJ, ISTJ |
| **Estrategista** | INTJ, INTP, ENTP |
| **Operador** | ISTJ, ISFJ, ESTJ |
| **Influenciador** | ENFJ, ESFJ, ENFP, ESFP |

🚨 Esse mapeamento é heurístico — **um candidato pode ser INFJ e Executor** e isso é normal, não erro. Não usar como regra rígida.

### 7.5 Checklist de implementação

- [ ] Banco de 64 itens autorais GUÉP escritos e revisados por psicólogo
- [ ] Piloto N=30 think-aloud
- [ ] Piloto quantitativo N=500 com IPIP-NEO-120 paralelo (validade convergente)
- [ ] 16 narrativas de tipo escritas (autorais) + revisão de viés (gênero, raça, classe)
- [ ] Modo `derived` implementado no microsserviço
- [ ] Documentação interna: instrument card explicando "não é MBTI"
- [ ] Documentação externa (candidato): "Perfil de preferências cognitivas — modelo jungiano"
- [ ] Política CFP/LGPD: linguagem descritiva, direito a contestação, revisão humana

---

## 8. Referências

1. Jung, C. G. (1921). *Psychologische Typen.* Rascher Verlag, Zürich. [Tradução inglesa: *Psychological Types*, Princeton University Press, 1971.]
2. Myers, I. B., & Briggs, K. C. (1962, revisões posteriores). *Myers-Briggs Type Indicator Manual.* — proprietária; referência conceitual apenas.
3. Pittenger, D. J. (1993). Measuring the MBTI… and coming up short. *Journal of Career Planning and Employment*. [https://www.scribd.com/document/64500488/Measuring-the-MBTI-And-Coming-Up-Short-1993-Pittenger](https://www.scribd.com/document/64500488/Measuring-the-MBTI-And-Coming-Up-Short-1993-Pittenger)
4. McCrae, R. R., & Costa, P. T. (1989). Reinterpreting the Myers-Briggs Type Indicator from the perspective of the five-factor model of personality. *Journal of Personality*, 57(1), 17–40. [https://onlinelibrary.wiley.com/doi/10.1111/j.1467-6494.1989.tb00759.x](https://onlinelibrary.wiley.com/doi/10.1111/j.1467-6494.1989.tb00759.x)
5. Furnham, A. (1996). The big five versus the big four: The relationship between the Myers-Briggs Type Indicator (MBTI) and NEO-PI five factor model of personality. *Personality and Individual Differences*, 21(2), 303–307. [https://www.sciencedirect.com/science/article/abs/pii/0191886995002060](https://www.sciencedirect.com/science/article/abs/pii/0191886995002060)
6. Stein, R., & Swan, A. B. (2019). Evaluating the validity of Myers-Briggs Type Indicator theory: A teaching tool and window into intuitive psychology. *Social and Personality Psychology Compass*, 13(2), e12434. [https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434](https://compass.onlinelibrary.wiley.com/doi/abs/10.1111/spc3.12434)
7. Jorgenson, E. (2017). *Open Extended Jungian Type Scales 1.2.* Open Source Psychometrics Project. [https://openpsychometrics.org/tests/OJTS/development/OEJTS1.2.pdf](https://openpsychometrics.org/tests/OJTS/development/OEJTS1.2.pdf) · página principal: [https://openpsychometrics.org/tests/OEJTS/](https://openpsychometrics.org/tests/OEJTS/)
8. OpenJung — Research & Methodology page (revisão da OEJTS). [https://openjung.org/research/](https://openjung.org/research/)
9. The Myers-Briggs Foundation — Trademark and Permissions guidelines. [https://www.myersbriggs.org/legal/](https://www.myersbriggs.org/legal/) · [https://www.themyersbriggs.com/en-US/Support/Copyright-and-Permissions](https://www.themyersbriggs.com/en-US/Support/Copyright-and-Permissions)
10. NERIS Analytics / 16Personalities — "Our Theory". [https://www.16personalities.com/articles/our-theory](https://www.16personalities.com/articles/our-theory)
11. Kelly, K. R., & Jugovic, H. (2001). Concurrent validity of the online version of the Keirsey Temperament Sorter II. *Journal of Career Assessment*, 9(1), 49–59. [https://journals.sagepub.com/doi/10.1177/106907270100900104](https://journals.sagepub.com/doi/10.1177/106907270100900104)
12. Wikipedia — Myers-Briggs Type Indicator (curated reference list). [https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator](https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator)
