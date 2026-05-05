# Dossiê 02 — Label GUÉP

> Marco 2 · Camada 2 (Comportamento) · Instrumento **proprietário interno autoral GUÉP** — uma classificação narrativa adicional (8–12 rótulos) que complementa Big Five + DISC sem duplicar dimensões.

---

## 1. Resumo executivo

O Label GUÉP é um **microsserviço autoral proprietário** que produz um rótulo qualitativo curto (uma palavra-tag, ex: `"Conector"`, `"Construtor"`, `"Curador"`, `"Catalisador"`) **derivado** de outras camadas (Big Five, DISC, Gallup adaptado, valores) e usado primariamente como **dispositivo de UX e narrativa**. A motivação é simples: candidatos e recrutadores brasileiros se conectam mais com **rótulos memoráveis** ("você é um Conector") do que com vetores de percentis. Mas — diferente do MBTI-like ou do DISC — o Label GUÉP **não é um instrumento psicométrico** com banco de itens próprio: ele é uma **função pura** sobre os outputs de outros instrumentos. Esta decisão é fundamental porque (a) evita acrescentar fadiga ao candidato (zero itens novos), (b) zera o risco psicométrico (nada para validar fatorialmente), (c) elimina o risco legal de "criar mais um teste". Recomendação: `score_weight_in_human_score: 0.0` — o Label não entra como feature no Score Humano, ele é **derivado** do Score Humano para narrativa.

🚨 **Decisão arquitetural crítica:** Label GUÉP **não é um instrumento de avaliação**, é uma **camada de rotulagem** (labeling layer). Documentar isso explicitamente para auditoria CFP/LGPD: o output não é uma "medida" — é uma "tradução narrativa" das medidas anteriores.

---

## 2. Status legal e licenciamento

### 2.1 Por ser autoral, está sob copyright GUÉP

| Item | Situação |
|---|---|
| **Banco de rótulos (8–12 palavras)** | © GUÉP / Kavuka 2026 — autorais |
| **Definições narrativas dos rótulos** | © GUÉP — autorais |
| **Função de mapeamento (algoritmo)** | © GUÉP — pode ser registrado como patente de software / marca registrada por categoria (Classe 42 Nice, software) |
| **Dependência de instrumentos externos** | Os rótulos são **derivados** de IPIP-NEO-120 (domínio público), DISC adaptado (autoral GUÉP, dossiê 01), Gallup adaptado (autoral GUÉP, dossiê 03). **Nenhuma dependência licenciada externamente.** |

### 2.2 Risco de marca

🚨 **Antes de finalizar os 8-12 nomes**, verificar marca registrada no INPI Brasil para cada palavra na Classe 41/42 (educação, software, RH). Palavras genéricas em PT-BR como "Conector", "Construtor" provavelmente já têm uso comercial em outras categorias — buscar combinação com prefixo "Kavuka" ou ícone visual exclusivo se a palavra-base for ambígua.

🚨 **Marcas a evitar por similaridade:**
- "Influenciador" — existe colisão com perfil GUÉP comportamental — usar termo diferente
- "Executor" — idem
- "Estrategista" — idem
- "Operador" — idem

Os 4 perfis GUÉP comportamentais já usam essas 4 palavras. Os Labels GUÉP devem ser **palavras diferentes** para não confundir.

### 2.3 Recomendação Kavuka v1.0

> **Banco fechado de 8 Labels GUÉP autorais**, descritos como "etiquetas narrativas Kavuka" (não como "perfil" ou "tipo"). Marca aplicada à interface, função pura no backend.

Lista candidata (revisar com marketing antes de fechar):

1. **Conector** — alto Influenciador + alta Amabilidade + alto Relacionamento (Gallup-adapt)
2. **Construtor** — alto Conscienciosidade + Executor + alta força "Executing" (Gallup-adapt)
3. **Curador** — alta Abertura + alto C-DISC + alta força "Strategic Thinking"
4. **Catalisador** — alta Energia + alto Influenciador + alta Abertura
5. **Guardião** — alto Operador + alta Conscienciosidade + alta Honesty-Humility (HEXACO)
6. **Explorador** — alta Abertura + médio Estrategista + baixa cautela
7. **Mentor** — alta Amabilidade + alto Influenciador + alto desenvolvimento (Gallup-adapt: Developer)
8. **Especialista** — alto Estrategista + alto Curator + alto Conscienciosidade

🚨 Esses 8 rótulos são **proposta**, não fechados — calibrar com casos reais e com testes de UX (8 é o limite cognitivo; menos de 6 reduz expressividade, mais de 12 dilui memorabilidade).

---

## 3. Modelo teórico

### 3.1 Não é um modelo psicométrico — é uma camada de UX

O Label GUÉP **não tem teoria psicológica subjacente própria.** Ele é uma **função de tradução** do espaço multivariado (Big Five + DISC + outros) para o espaço discreto de 8 rótulos.

Comparação com instrumentos reais:

| Instrumento | Tem itens? | Tem dimensões medidas? | Tem teoria? |
|---|---|---|---|
| IPIP-NEO-120 | Sim (120) | Sim (5+30) | Sim (FFM) |
| DISC adapt | Sim (24) | Sim (4) | Sim (Marston) |
| Gallup adapt | Sim (~60) | Sim (talents) | Sim (positive psych) |
| **Label GUÉP** | **Não** | **Não (deriva de outros)** | **Não — é UX** |

### 3.2 Inspirações sem cópia

Para construir os 8 rótulos do Label GUÉP, podemos inspirar-nos em sistemas comerciais conhecidos **sem reproduzir nenhum**:

- **Brand Archetypes (Mark & Pearson, 2001)** — 12 arquétipos de marca (Hero, Sage, Caregiver etc.) inspirados em Jung. Não são instrumento psicométrico, são vocabulário de marca ([Pearson-Marr Archetype Indicator, PMAI](https://scottjeffrey.com/12-brand-archetype-wheel/)). 🚨 **PMAI é proprietário** (CAPT — Center for Applications of Psychological Type) — não copiar literalmente os 12 nomes (Innocent, Hero, Outlaw, Caregiver, etc.).
- **VIA Character Strengths** (Peterson & Seligman, 2004) — 24 forças de caráter agrupadas em 6 virtudes ([viacharacter.org](https://www.viacharacter.org/)). VIA é **gratuito mas com termos de uso restritivos** para uso comercial — usar como inspiração teórica, não copiar nomes.
- **CliftonStrengths 34 talentos** — proprietário Gallup, não copiar (ver dossiê 03).
- **Caliper Profile** — 22 traços proprietários ([Caliper](https://www.tsatestprep.com/caliper-assessment/)). Não copiar.
- **Matrigma (Assessio)** — primariamente teste de raciocínio, não tem labels narrativas. ([Assessio](https://assessio.com/aptitude/))

### 3.3 Heurística para escolher os 8 rótulos GUÉP

Critérios de seleção:

1. **Palavras curtas, em português** (1-2 palavras), reconhecíveis pelo recrutador BR sem tradução.
2. **Cobrem cantos do espaço Big Five + DISC** que os 4 perfis (Executor/Estrategista/Operador/Influenciador) não capturam com granularidade. Ex: "Mentor" = Influenciador + alta Amabilidade — diferente de "Influenciador puro" (Influenciador + baixa Amabilidade).
3. **Conotação positiva** — todos os Labels devem ser **vantagens de fit em algum contexto**. **Nenhum Label pode ser pejorativo.** "Detalhista" pode ser positivo em compliance e negativo em design — usar palavra que carrega só a leitura positiva ("Curador").
4. **Memorabilidade** — palavra que vira hashtag interna ("#sou_conector").
5. **Sem sobreposição com os 4 perfis comportamentais GUÉP** (não usar Executor/Estrategista/Operador/Influenciador como Label).

### 3.4 Por que NÃO criar um instrumento psicométrico próprio

Tentação inicial: "vamos criar nosso teste GUÉP autoral, com 30 itens próprios, 5 dimensões próprias". **Não fazer isso.** Razões:

1. **Custo psicométrico:** validar instrumento novo requer N≥1000, análise fatorial confirmatória, dois pilotos, ~12 meses, ~BRL 200k. Não compensa.
2. **Risco de redundância:** qualquer dimensão nova vai correlacionar fortemente com Big Five. Estamos reinventando a roda.
3. **Risco regulatório:** mais um instrumento = mais um banco de itens auditável pelo CFP, mais um capítulo no LGPD DPIA.
4. **Linha do produto:** Kavuka tem 12 microsserviços de avaliação. Adicionar um 13º só por estética é over-engineering.

A solução elegante é **fazer do Label uma camada de tradução**, não um instrumento adicional.

---

## 4. Estrutura de itens

### 4.1 Não tem itens próprios

🚨 **Decisão chave:** o Label GUÉP **não tem banco de itens.** Ele consome o output dos outros microsserviços e produz um rótulo. Implementação técnica:

```
labelGuep.apply({
  bigFive: bigFiveResult,
  disc: discResult,
  gallup: gallupResult,
  hexaco?: hexacoResult,  // opcional
  guepProfile: guepProfile
}) → { label: "Conector", confidence: 0.78, alternates: ["Mentor", "Catalisador"] }
```

Tempo de execução: <50ms (lookup de regras). Tempo do candidato: **0 minutos** (não responde a nada).

### 4.2 Definição dos 8 Labels (proposta)

| Label | Definição curta (UX) | Combinação típica de inputs |
|---|---|---|
| **Conector** | Pessoa que une grupos e abre caminhos por relação | I-DISC alto · Amabilidade alta · "Woo" / "Communication" alto |
| **Construtor** | Pessoa que entrega resultado e finaliza obras | C-Big5 alto · D-DISC médio-alto · "Achiever" / "Discipline" alto |
| **Curador** | Pessoa que avalia, refina e eleva o padrão | Abertura alta · C-DISC alto · "Analytical" / "Deliberative" alto |
| **Catalisador** | Pessoa que acende mudança e mobiliza ação | Abertura alta · I-DISC alto · "Activator" / "Ideation" alto |
| **Guardião** | Pessoa que protege qualidade, ética e ordem | C-Big5 alto · S-DISC alto · Honesty-Humility (HEXACO) alta |
| **Explorador** | Pessoa que entra em terreno novo e descobre rotas | Abertura alta · "Learner" / "Input" alto · baixa cautela |
| **Mentor** | Pessoa que desenvolve outros e ensina | Amabilidade alta · "Developer" / "Empathy" alto · I-DISC médio-alto |
| **Especialista** | Pessoa que vai fundo num domínio e domina | Abertura média-alta · "Intellection" / "Focus" alto · C-Big5 alto |

🚨 **Definir descrições narrativas** (300-500 palavras cada) é trabalho de copywriter + revisor com viés (gênero, raça, classe). Os textos devem evitar Forer/Barnum effect — específicos o bastante para que pessoas em outro Label não se reconheçam.

### 4.3 Validação obrigatória antes de produção

Diferente de um instrumento psicométrico, o que precisa ser validado aqui é a **distribuição** e **interpretabilidade**:

- [ ] Rodar a função `labelGuep.apply()` em N=500 candidatos do piloto IPIP-NEO-120
- [ ] Verificar distribuição: nenhum Label deve receber < 5% nem > 25% (se Conector recebe 60%, o algoritmo está enviesado e diluído)
- [ ] Teste de UX: candidato lê seu Label e diz "se reconhece"? Meta: ≥ 70% de auto-reconhecimento (ver §6.2 sobre Forer)
- [ ] Teste de discriminação: candidatos pareados (mesmo cargo, mesma performance) podem ter Labels diferentes? Sim — isso é desejável, indica que o Label captura algo além de "bom funcionário"
- [ ] Revisão por psicólogo registrado para garantir linguagem não-clínica
- [ ] Revisão por marca/jurídico para INPI

---

## 5. Lógica de scoring

### 5.1 Não há "score" — há "atribuição de rótulo"

```python
def assign_label(big5, disc, gallup, hexaco=None) -> Label:
    candidates = []
    for label, rule in LABEL_RULES.items():
        score = rule.match(big5, disc, gallup, hexaco)  # 0.0 a 1.0
        candidates.append((label, score))
    
    candidates.sort(key=lambda x: -x[1])
    primary = candidates[0]
    secondaries = [c for c in candidates[1:3] if c[1] > primary[1] - 0.15]
    
    return Label(
        primary=primary[0],
        confidence=primary[1],
        alternates=[s[0] for s in secondaries]
    )
```

### 5.2 Regras (estilo, não final)

```python
LABEL_RULES = {
    "Conector": (
        z(disc.I) > 0.5 and z(big5.A) > 0.3 and z(gallup.relationship_building) > 0.5
    ),
    "Construtor": (
        z(big5.C) > 0.5 and z(disc.D) > 0.3 and z(gallup.executing) > 0.5
    ),
    # ...
}
```

### 5.3 Output JSON canônico

```json
{
  "instrument": "label_guep",
  "version": "1.0.0",
  "mode": "derived",
  "scores": {
    "primary": "Conector",
    "confidence": 0.78,
    "alternates": ["Mentor", "Catalisador"]
  },
  "score_weight_in_human_score": 0.0,
  "norm_source": "internal_rules_v1",
  "depends_on": ["bigfive_full", "disc_adapt", "gallup_adapt"]
}
```

🚨 **Importante:** o campo `depends_on` documenta que o Label só é confiável quando os instrumentos antecedentes existem. Se faltar Big Five, o Label vira `"primary": null, "fallback": "based_on_disc_only", "confidence": "low"`.

---

## 6. Interpretação

### 6.1 Narrativa por Label (esqueleto)

Cada um dos 8 Labels recebe um perfil narrativo de 300–500 palavras cobrindo: (i) o que move essa pessoa, (ii) como ela contribui em equipe, (iii) onde ela floresce, (iv) onde ela pode tropeçar, (v) sugestões de carreira/contexto.

Tom: **descritivo, encorajador, profissional**. Nunca patologizante, nunca prescritivo, nunca determinista.

### 6.2 Watchouts críticos

🚨 **Forer/Barnum effect** — o maior risco do Label é virar "horóscopo corporativo". Mitigação:
- Cada texto deve ter pelo menos 3 itens **verificáveis e específicos** (ex: "tende a buscar feedback antes de finalizar uma decisão", não "gosta de ouvir opiniões")
- Cada texto deve mencionar **uma fragilidade real e específica** (ex: "Conector pode evitar feedback duro para preservar a relação")
- A/B test de discriminação: mostrar para um candidato Conector tanto o texto Conector quanto o texto Curador — ele deve conseguir identificar o seu corretamente em ≥ 70% das vezes

🚨 **Não usar como gate de seleção** — Label é narrativa, não predição. Recrutador **não pode** filtrar candidatos por Label. Pode usar como **dispositivo de conversa** ("vi que você é Conector — me conta um caso onde isso ajudou no time anterior").

🚨 **Não criar "Labels negativos"** — todos os Labels devem ser positivos em algum contexto. Se uma combinação de Big Five + DISC sugere "alto Maquiavelismo + baixa Amabilidade", isso **não vira um Label** ("Manipulador" seria pejorativo). Vai para a Camada 4 (Dark Triad, dossiê 04), com linguagem responsável e workflow específico.

🚨 **Distribuição de Labels deve ser monitorada por viés** — se todos os candidatos negros recebem "Operador" e todos os brancos recebem "Estrategista", o algoritmo está reproduzindo viés. Implementar painel de monitoramento de distribuição por gênero/raça/região, com alerta automático.

🚨 **Linguagem responsável** — evitar:
- "Você é um Conector" (essencialista) → preferir "Você tende a operar como Conector neste contexto" (estado, não traço)
- "Conectores são X" (estereotipante) → preferir "Pessoas com Label Conector frequentemente..."
- "Você não é estratégico" (negativo) → não dizer.

---

## 7. Aplicação no contexto Kavuka

### 7.1 Posição na arquitetura

🚨 **O Label GUÉP NÃO faz parte das 6 camadas de avaliação tradicionais.** Ele é uma **camada transversal** (cross-cutting layer) que consome saídas de Camadas 1, 2 e 3 e produz UX para o card do candidato.

```
[Camada 1: Big Five] ─┐
[Camada 2: DISC]    ─┼─→ [Label GUÉP] ─→ UX card
[Camada 3: Gallup]   ─┘
[Camada 4: HEXACO]   ─┘ (opcional)
```

### 7.2 Por que peso 0 no Score Humano

O Label é **derivado** dos instrumentos que já alimentam o Score Humano. Se o Label entrasse com peso, seria **dupla contagem**.

A relação correta:
- Big Five → Score Humano (peso alto, ~0.50)
- DISC → Score Humano (peso baixo, ~0.10)
- Gallup → Score Humano (peso médio, ~0.20)
- **Score Humano + Big Five + DISC + Gallup → Label** (Label é função do Score Humano e dos inputs, não input)

Em pseudocódigo:

```
score_humano = w1*big5 + w2*disc + w3*gallup + ...
label = derive_label(big5, disc, gallup, hexaco)
# label não entra em score_humano
```

### 7.3 Mapeamento Label → perfis comportamentais GUÉP

Os 8 Labels e os 4 perfis (Executor/Estrategista/Operador/Influenciador) são **camadas paralelas**. Não há mapeamento 1:1 — uma pessoa pode ser **Executor + Construtor**, **Executor + Catalisador**, ou **Influenciador + Conector**.

Tabela ilustrativa de combinações típicas (não exclusivas):

| Perfil GUÉP | Labels mais prováveis |
|---|---|
| **Executor** | Construtor · Catalisador |
| **Estrategista** | Curador · Especialista · Explorador |
| **Operador** | Guardião · Construtor · Especialista |
| **Influenciador** | Conector · Mentor · Catalisador |

🚨 Note que **Mentor pode aparecer em qualquer perfil** (uma pessoa Operador-Mentor é um líder técnico calmo que desenvolve juniores; uma pessoa Influenciador-Mentor é um coach extrovertido). Isso é desejado: Label adiciona granularidade.

### 7.4 Card do candidato — exemplo final

```
Maria Souza
─────────────
Perfil GUÉP: Executor
Label: Construtor (alt: Guardião)
DISC adaptado: DC
Big Five: C alto · A médio · O médio · E médio · N baixo
Score Humano: 87/100
```

### 7.5 Quando NÃO mostrar o Label

- Candidato não fez Big Five → Label vira "indisponível, requer Big Five"
- Confidence < 0,5 → Label vira "ambíguo — múltiplos perfis possíveis"
- Candidato pediu opt-out de profiling (LGPD art. 20) → Label oculto
- Recrutador em modo "blind" (mitigação de viés) → Label oculto

---

## 8. Referências

> 🚨 **O Label GUÉP é autoral.** Não há referências acadêmicas para "Label GUÉP" — ele é construído sobre instrumentos referenciados em outros dossiês. Esta seção lista **as fontes que justificam a abordagem de tradução narrativa** (não criação de instrumento novo).

1. Mark, M., & Pearson, C. S. (2001). *The Hero and the Outlaw: Building Extraordinary Brands Through the Power of Archetypes.* McGraw-Hill. — referência conceitual de uso de arquétipos como vocabulário de marca, **não copiamos os 12 arquétipos**.
2. Peterson, C., & Seligman, M. E. P. (2004). *Character Strengths and Virtues: A Handbook and Classification.* APA / Oxford University Press. [https://psycnet.apa.org/record/2004-13277-000](https://psycnet.apa.org/record/2004-13277-000) — VIA framework de 24 forças/6 virtudes; referência conceitual de positive psychology.
3. VIA Institute on Character — Character Strengths Survey. [https://www.viacharacter.org/](https://www.viacharacter.org/) · [https://www.viacharacter.org/character-strengths-and-virtues](https://www.viacharacter.org/character-strengths-and-virtues) — modelo de 24 forças, **gratuito mas com TOS restritivo para uso comercial — não usamos os nomes literais**.
4. Forer, B. R. (1949). The fallacy of personal validation: A classroom demonstration of gullibility. *Journal of Abnormal and Social Psychology*, 44(1), 118–123. [https://psycnet.apa.org/doi/10.1037/h0059240](https://psycnet.apa.org/doi/10.1037/h0059240) — fundamento do "Barnum effect" que precisa ser mitigado em narrativas tipológicas.
5. Hammond, K. R. (1996). *Human Judgment and Social Policy.* Oxford University Press. — fundamento de por que rótulos discretos sobre traços contínuos são úteis em UX mas precisam ser usados com cuidado em decisão.
6. Carl Jung — *Psychological Types* (1921). — fonte original do uso de arquétipos para descrever padrões comportamentais; teoria livre, base sem direitos autorais para escolha de vocabulário arquetípico.
7. Marston, W. M. (1928). *Emotions of Normal People.* — relacionado à legitimidade de criar tipologias derivadas em domínio público (ver dossiê 01).
8. Lei nº 13.709/2018 (LGPD) — art. 20 (decisão automatizada e direito a revisão humana). [https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
9. INPI Brasil — Sistema de busca de marcas. [https://www.gov.br/inpi/pt-br/servicos/marcas](https://www.gov.br/inpi/pt-br/servicos/marcas) — para verificação de colisão de marca antes de fechar o banco de Labels.
10. Resolução CFP nº 31/2022 — uso de testes psicológicos. [https://satepsi.cfp.org.br/](https://satepsi.cfp.org.br/) — relevante porque, sendo Label uma camada NÃO-psicométrica, **fica fora do escopo CFP/SATEPSI**, o que reforça a opção de design.
