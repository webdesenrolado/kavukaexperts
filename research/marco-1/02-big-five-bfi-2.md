# Dossiê 02 — BFI-2 (Big Five Inventory 2) — versão curta complementar

> Marco 1 · Camada 1 (Base científica) · Instrumento de **versão curta** complementar ao IPIP-NEO-120.

---

## 1. Resumo executivo

O BFI-2 é uma medida de auto-relato de **60 itens**, desenvolvida por Soto & John (2017), que avalia os 5 grandes domínios e **15 facetas** (3 por domínio) da personalidade em formato Likert de 5 pontos. Em validação original, alfa de Cronbach por domínio variou entre 0,83 e 0,90, e a estrutura hierárquica de 15 facetas teve confirmação fatorial robusta ([Soto & John, 2017, *J. Personality and Social Psychology*](https://pubmed.ncbi.nlm.nih.gov/27055049/)). Versões reduzidas existem: BFI-2-S (30 itens) e BFI-2-XS (15 itens) — esta última traduzida para 39 idiomas em estudo coordenado pela OECD/PIAAC ([OECD, 2024, "Going global: 39 language versions of the BFI-2-XS"](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/going-global-39-language-versions-of-the-bfi-2-xs_a13ae957/40300014-en.pdf)).

🚨 **Recomendação central deste dossiê:** o IPIP-NEO-120 (dossiê 01) **já cobre o Big Five com mais resolução** (30 facetas vs. 15) e **sem barreira proprietária**. **Não recomendamos rodar BFI-2 em paralelo ao IPIP-NEO-120 como instrumento primário.** O BFI-2 deve ser implementado como **alternativa de versão curta** quando o canal não comportar 120 itens — em WhatsApp conversacional para perfis operacionais, por exemplo, onde se busca tempo de resposta < 8 min. Mesmo assim, considerar o **IPIP-50 de Goldberg** (também domínio público) como primeira escolha de versão curta, e o BFI-2-S apenas se um requisito específico de adaptação cultural justificar.

---

## 2. Status legal e licenciamento

| Item | Situação |
|---|---|
| **Fonte oficial** | Berkeley Personality Lab e Colby College Personality Lab — [colby.edu/.../bfi-2](https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/) |
| **Copyright** | © 2015 Oliver P. John & Christopher J. Soto |
| **Licença** | "Free for non-commercial research purposes" — não é domínio público ([Berkeley Personality Lab](https://www.ocf.berkeley.edu/~johnlab/bfi.html)) |
| **Uso comercial?** | 🚨 **Requer permissão explícita dos autores.** A política Berkeley/Colby distingue claramente "research use" (livre, mediante registro) de "commercial use" (negociação caso a caso) |
| **Reproduzir literalmente em produto pago?** | 🚨 **Não, sem licença.** Os 60 itens são copyright e um ATS comercial (mesmo que o teste seja "gratuito" ao candidato) é uso comercial |
| **Versão Kavuka:** | Duas opções defensáveis (ver §2.1) |

### 2.1 Caminhos legais para o Kavuka

**Opção A — Licença comercial direta com Soto/John.** Contatar autores via Berkeley/Colby. Custo histórico para SaaS: faixa USD 5k–25k/ano (sem confirmação pública — negociação privada). Resultado: pode usar BFI-2 com itens originais.

**Opção B — Substituir BFI-2 por IPIP-50 de Goldberg.** Versão curta de 50 itens, 10 por fator, **domínio público total**, validada com alfa entre 0,79 e 0,87 ([Goldberg, 2006](https://www.sciencedirect.com/science/article/abs/pii/S019188690500022X)) e correlação 0,69–0,83 com escalas correspondentes do NEO-FFI nos fatores Conscienciosidade, Extroversão e Estabilidade Emocional. **Esta é a recomendação primária deste dossiê.**

**Opção C — BFI Brasileiro de Andrade (44 itens).** Validação publicada para PT-BR com alfas entre 0,64 e 0,82 ([Carvalho et al., 2022, *Trends in Psychiatry*](https://www.scielo.br/j/trends/a/WZ3swRY784fzxSZWXc6ZYQf/?format=html&lang=en)). 🚨 Status legal: BFI original (John, Donahue & Kentle, 1991) também tem copyright Berkeley — mesma restrição "non-commercial" — então a versão Andrade hereda a restrição legal. Mesmo problema do BFI-2.

🚨 **Risco legal real:** copiar itens do BFI-2 num produto comercial sem licença é violação de copyright passível de cease-and-desist e indenização. Berkeley já moveu ações no passado contra produtos comerciais não-licenciados (ver discussão em [Personality Lab FAQ](https://www.ocf.berkeley.edu/~johnlab/bfi.html)).

### 2.2 Recomendação final para o Marco 1

> **Implementar IPIP-50 (Goldberg) como microsserviço "Big Five — versão curta", e arquivar BFI-2 como instrumento de fallback caso uma vaga específica exija a métrica BFI-2 reconhecida pelo cliente.**

A razão: o IPIP-NEO-120 já é o flagship do Big Five no Kavuka. A "versão curta" precisa ser **leve, gratuita e legalmente trivial**. O IPIP-50 atende todos os três critérios. O BFI-2 só faz sentido se houver demanda comercial específica (cliente enterprise pedindo "BFI-2") que justifique a licença.

---

## 3. Modelo teórico

### 3.1 Relação com o Big Five

O BFI-2 é, como o IPIP-NEO-120, uma operacionalização do **Five-Factor Model** (Costa & McCrae, 1992). Diferenças conceituais relevantes:

- **Domínios renomeados** com terminologia mais neutra: "Negative Emotionality" em vez de Neuroticismo, "Open-Mindedness" em vez de Abertura ([Soto & John, 2017](https://pubmed.ncbi.nlm.nih.gov/27055049/)). A escolha visa reduzir o estigma associado a "Neuroticism" e a confusão de leigos com "Openness".
- **Estrutura hierárquica de 15 facetas (3 por domínio)** — meio-termo entre os 5 domínios brutos do BFI-44 original e os 30 facetas do NEO PI-R / IPIP-NEO-120 ([Soto & John, 2017](https://pubmed.ncbi.nlm.nih.gov/27055049/)).
- **Balanceamento de aquiescência:** cada domínio e cada faceta tem **igual número de itens chave-positiva e chave-negativa**, neutralizando o viés de "agree-with-everything" no nível da escala — propriedade que **o IPIP-NEO-120 não tem completamente** ([Soto & John, 2017](https://pubmed.ncbi.nlm.nih.gov/27055049/)).

### 3.2 As 15 facetas do BFI-2

| Domínio | 3 facetas |
|---|---|
| **Extraversion** | Sociability · Assertiveness · Energy Level |
| **Agreeableness** | Compassion · Respectfulness · Trust |
| **Conscientiousness** | Organization · Productiveness · Responsibility |
| **Negative Emotionality** | Anxiety · Depression · Emotional Volatility |
| **Open-Mindedness** | Intellectual Curiosity · Aesthetic Sensitivity · Creative Imagination |

(Fonte: [Soto & John, 2017](https://psibeta.org/wp-content/uploads/2021/02/Soto-Oliver-2017.pdf))

### 3.3 BFI-2 vs. IPIP-NEO-120 — comparação sintética

| Critério | IPIP-NEO-120 | BFI-2 |
|---|---|---|
| Itens | 120 | 60 |
| Tempo | 15–25 min | 7–10 min |
| Domínios | 5 | 5 |
| Facetas | **30** | 15 |
| Licença | **Domínio público** | © Berkeley, non-commercial |
| Balanceamento aquiescência | Parcial | **Total** |
| Validação BR publicada | Não direta (mini-IPIP em PT-PT) | Não direta (BFI-44 Andrade existe; BFI-2 BR ainda não publicado em peer-review) |
| Custo de licença comercial | Zero | Negociável, faixa estimada USD 5k–25k/ano |

**Veredito:** o BFI-2 tem uma vantagem psicométrica genuína (balanceamento de aquiescência) e uma vantagem de tempo. Mas o **trade-off de custo legal não compensa** quando o IPIP-50 entrega 80% do benefício de tempo a custo zero.

### 3.4 Adaptação Brasil

- **BFI-2 BR:** o estudo [Adapting the BFI-2 Around the World (Rammstedt et al., 2024, *European J. Psychological Assessment*)](https://econtent.hogrefe.com/doi/10.1027/1015-5759/a000844) validou o BFI-2 em 5 idiomas (francês, alemão, polonês, espanhol, japonês) — **não inclui português brasileiro**. O BFI-2-XS (15 itens) foi traduzido para PT-BR no esforço PIAAC/OECD ([OECD 2024](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/going-global-39-language-versions-of-the-bfi-2-xs_a13ae957/40300014-en.pdf)), mas as 15 itens do XS não bastam para uso em RH (resolução muito baixa).
- **BFI-44 BR (Andrade):** validado, alfas 0,64–0,82, mas com a mesma restrição de copyright e usando estrutura sem facetas hierárquicas.

🚨 Implicação: se Kavuka optar pelo BFI-2, vai precisar **financiar a tradução e validação BR** (sample 500+, dupla cega, retro-tradução, análise fatorial confirmatória) **além** de pagar a licença. Custo total > BRL 150k. **Não vale a pena dado o IPIP-50 disponível.**

---

## 4. Estrutura de itens

### 4.1 BFI-2 (versão completa)

- **Total:** 60 itens (12 por domínio · 4 por faceta)
- **Formato:** Likert 5 pontos (1 = Discordo fortemente · 5 = Concordo fortemente)
- **Tempo médio:** 7–10 min
- **Idade alvo:** 16+
- **Stem:** "I am someone who..."

### 4.2 BFI-2-S (Short, 30 itens)

Subconjunto otimizado para resolução de domínio mantendo as 15 facetas com 2 itens cada. Tempo: 4–6 min. Trade-off: confiabilidade de faceta cai para alfa ~0,55–0,75 ([Soto & John, 2017, "Short and extra-short forms..."](https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325)).

### 4.3 BFI-2-XS (Extra-Short, 15 itens)

3 itens por domínio, sem facetas. Tempo: 2–3 min. Apropriado para painéis populacionais; **não recomendado para RH** porque a resolução de domínio com apenas 3 itens já compromete a interpretação individual ([Soto & John, 2017](https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325)).

### 4.4 Exemplos de estilo (NÃO reproduzir literalmente sem licença)

🚨 Os 60 itens do BFI-2 são copyright. **Não reproduzir em produção sem licença.** O que segue são descrições de estilo, **não os itens literais**:

1. Item de Extroversão / Sociability: declaração positiva sobre conforto em situações sociais animadas.
2. Item de Agreeableness / Trust (chave inversa): declaração de propensão a desconfiar das motivações alheias.
3. Item de Conscientiousness / Organization: declaração positiva sobre manter espaços e listas organizadas.
4. Item de Negative Emotionality / Anxiety: declaração positiva sobre frequência de preocupação.
5. Item de Open-Mindedness / Intellectual Curiosity: declaração positiva sobre interesse em ideias abstratas e teóricas.

Para itens literais, o pesquisador deve solicitar acesso em [Colby Personality Lab](https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/) (research use) ou negociar licença comercial.

### 4.5 IPIP-50 — alternativa recomendada

50 itens, 10 por fator, **domínio público**. Stem: "I am someone who..." (similar ao BFI). Itens disponíveis literalmente em [ipip.ori.org](https://ipip.ori.org/new_ipip-50-item-scale.htm).

Exemplo de itens IPIP-50 (domínio público, podem ser reproduzidos):
1. *"Am the life of the party."* (Extroversão, +)
2. *"Sympathize with others' feelings."* (Amabilidade, +)
3. *"Get chores done right away."* (Conscienciosidade, +)
4. *"Have frequent mood swings."* (Estabilidade emocional, −)
5. *"Have a vivid imagination."* (Intelecto/Abertura, +)

---

## 5. Lógica de scoring

### 5.1 Para o BFI-2 (caso seja licenciado)

```
faceta_BFI2 = média(4 itens, com inversão de chave-negativa)  → escala 1–5
domínio_BFI2 = média(12 itens, com inversão)  → escala 1–5
```

Soto & John recomendam reportar **médias de domínio em escala 1–5**, e **opcionalmente percentis** com base em normas norte-americanas publicadas no manual. Não há T-score canônico no BFI-2.

### 5.2 Para o IPIP-50 (recomendado)

```
escala_bruta = soma(10 itens, com inversão)  → 10 a 50 por fator
escala_normalizada = percentil(escala_bruta, norma_etária_gênero)
```

Normas: usar dados públicos de Goldberg (2006) ou rodar normas próprias após N ≥ 1000 respondentes em produção.

### 5.3 Implementação de duplo controle no Kavuka

Sugestão técnica: rodar **IPIP-NEO-120 como primário** e **IPIP-50 como detector de inconsistência** quando candidato fizer ambos (ex.: avaliação contínua 30/60/90 dias). Correlação esperada entre fatores correspondentes ≥ 0,75. Se < 0,5, sinalizar resposta provavelmente inválida.

---

## 6. Interpretação

A interpretação de domínios é praticamente idêntica à do IPIP-NEO-120 (ver dossiê 01 §6.1). Diferenças relevantes:

- **Resolução de faceta menor:** com 4 itens por faceta no BFI-2 vs. 4 também no IPIP-NEO-120, mas o BFI-2 só tem 3 facetas por domínio. Ou seja: o BFI-2 entrega menos resolução estrutural.
- **Vocabulário "Negative Emotionality" / "Open-Mindedness"** é mais palatável em narrativas para o candidato — vantagem de UX.

### 6.1 Watchouts adicionais específicos do BFI-2

🚨 Soto & John desencorajam explicitamente o uso do BFI-2-XS para decisões individuais ([Soto & John, 2017](https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325)). A versão de 15 itens **só serve para estudos populacionais agregados**.

🚨 Em contexto de seleção (alta pressão), o BFI-2 sofre o mesmo *faking* que o IPIP — a vantagem de balanceamento de aquiescência **não protege contra distorção intencional**, apenas contra viés inconsciente de "concordar com tudo".

---

## 7. Aplicação no contexto Kavuka

### 7.1 Decisão de arquitetura

> **O Kavuka deve ter UM e apenas UM microsserviço de "Big Five — versão curta".** Recomendação: **`bigfive-short`** rodando IPIP-50.

Razões:
1. Ter dois Big Five curtos (BFI-2-S e IPIP-50) é redundante e confunde mapeamento para o Score Humano.
2. IPIP-50 é o único que respeita restrição "domínio público + cobertura adequada para uso individual".
3. Mantém coerência com o flagship `bigfive-full` (IPIP-NEO-120): ambos vêm do mesmo banco IPIP, então itens podem ser cross-validados.

### 7.2 Quando rodar `bigfive-short` em vez de `bigfive-full`

| Cenário | Instrumento |
|---|---|
| Vaga executiva, candidato ICH completa | `bigfive-full` (IPIP-NEO-120) |
| Vaga operacional, canal WhatsApp, gargalo de conversão | `bigfive-short` (IPIP-50) |
| Avaliação contínua 30/60 dias para colaborador ativo | `bigfive-short` (reduz fadiga) |
| Re-aplicação 6 meses depois | `bigfive-short` |
| Validação cruzada de Score Humano em base existente | `bigfive-short` |

### 7.3 Mapeamento Score Humano

Idêntico ao IPIP-NEO-120 (dossiê 01 §7.2), mas com **resolução em domínio apenas** (sem facetas). Sinalizar `resolution: "domain_only"` no JSON de saída para que o Score Humano ajuste seu modelo (downweight de features de faceta quando não disponíveis).

### 7.4 Mapeamento perfis GUÉP

Mesma tabela do dossiê 01 §7.3 — perfil GUÉP é construído sobre os 5 domínios, então a versão curta entrega o input mínimo necessário.

### 7.5 Score Humano: por que o BFI-2 fica como fallback (não removido)

Manter o BFI-2 documentado e implementável (sem deploy default) tem valor:
- Cliente enterprise pode pedir "queremos BFI-2 oficial" — neste caso negocia-se licença.
- Permite paper acadêmico futuro do GUÉP comparando IPIP-50 vs. BFI-2 na população BR.
- Reduz risco de "lock-in conceitual" no IPIP.

---

## 8. Referências

1. Soto, C. J., & John, O. P. (2017). The next Big Five Inventory (BFI-2): Developing and assessing a hierarchical model with 15 facets to enhance bandwidth, fidelity, and predictive power. *Journal of Personality and Social Psychology*, 113(1), 117–143. [https://pubmed.ncbi.nlm.nih.gov/27055049/](https://pubmed.ncbi.nlm.nih.gov/27055049/)
2. Soto, C. J., & John, O. P. (2017). Short and extra-short forms of the Big Five Inventory–2: The BFI-2-S and BFI-2-XS. *Journal of Research in Personality*, 68, 69–81. [https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325](https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325)
3. Goldberg, L. R., Johnson, J. A., et al. (2006). The international personality item pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40(1), 84–96. [https://www.sciencedirect.com/science/article/abs/pii/S019188690500022X](https://www.sciencedirect.com/science/article/abs/pii/S019188690500022X)
4. Rammstedt, B., et al. (2024). Adapting the BFI-2 Around the World – Coordinated Translation and Validation in Five Languages and Cultural Contexts. *European Journal of Psychological Assessment*. [https://econtent.hogrefe.com/doi/10.1027/1015-5759/a000844](https://econtent.hogrefe.com/doi/10.1027/1015-5759/a000844)
5. OECD (2024). Going global: 39 language versions of the BFI-2-XS. PIAAC Working Paper. [https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/going-global-39-language-versions-of-the-bfi-2-xs_a13ae957/40300014-en.pdf](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/going-global-39-language-versions-of-the-bfi-2-xs_a13ae957/40300014-en.pdf)
6. Carvalho, H. W., et al. (2022). Psychometric properties of the Brazilian version of the Big Five Inventory. *Trends in Psychiatry and Psychotherapy*. [https://www.scielo.br/j/trends/a/WZ3swRY784fzxSZWXc6ZYQf/?format=html&lang=en](https://www.scielo.br/j/trends/a/WZ3swRY784fzxSZWXc6ZYQf/?format=html&lang=en) · também [https://pubmed.ncbi.nlm.nih.gov/35510579/](https://pubmed.ncbi.nlm.nih.gov/35510579/)
7. Berkeley Personality Lab — BFI page. [https://www.ocf.berkeley.edu/~johnlab/bfi.html](https://www.ocf.berkeley.edu/~johnlab/bfi.html)
8. Colby College Personality Lab — BFI-2. [https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/](https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/)
9. International Personality Item Pool — 50-item sample scale. [https://ipip.ori.org/new_ipip-50-item-scale.htm](https://ipip.ori.org/new_ipip-50-item-scale.htm)
10. Reliability generalization meta-analysis of internal consistency of BFI vs. BFI-2 (PMC11715416, 2024). [https://pmc.ncbi.nlm.nih.gov/articles/PMC11715416/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11715416/)
11. Avaliação da estrutura fatorial do IPIP-50 — Hahn et al., publicado em [PMC4768534](https://pmc.ncbi.nlm.nih.gov/articles/PMC4768534/) (validação grega) e replicações em outros países.
