# Onboarding via QR + Arquétipos no Currículo ICH

> Documentação das duas features entregues em **2026-05-15**.
> Commits: `9ed1601` (Arquétipos no Currículo ICH) e `99d5f2b` (Tour pós-cadastro).
> Deploy: VPS `2.24.85.36`.

---

## Sumário

1. [Feature A — Arquétipos integrados ao Currículo ICH](#feature-a--arquétipos-integrados-ao-currículo-ich)
2. [Feature B — Cadastro via QR + Tour de onboarding](#feature-b--cadastro-via-qr--tour-de-onboarding)
3. [URLs operacionais](#urls-operacionais)
4. [Como testar](#como-testar)
5. [Pendências e próximos passos](#pendências-e-próximos-passos)

---

## Feature A — Arquétipos integrados ao Currículo ICH

### O que muda pro usuário

Antes, o Currículo ICH (recrutador e candidato) mostrava perfil DISC + Big Five, mas o resultado da avaliação **Arquétipos** ficava só na tela da própria avaliação. Agora:

- **Seção 8 — Índice Comportamental**: ao lado do perfil DISC, aparece o **Arquétipo dominante** (laranja Kavuka) com "Sustentado por: {secundário}".
- **Seção 9 — Avaliações detalhadas**: card próprio dos Arquétipos com **top 3 rankeados** (1º com borda laranja destacada), cada um com score 0-100 e descrição autoral.
- **Seção 10 — ICH narrativa**: parágrafo comportamental ganha frase final "Arquétipo dominante: X, com sustentação do Y" + hashtag.

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `lib/ich/behavioral-index.ts` | `BehavioralIndexResult` ganha `archetype: ArchetypeSummary \| null` extraído do `interpretationJson` da avaliação `arquetipos`. Instrumento entra no peso de completude com 25 pts. |
| `lib/ich/narrative.ts` | Parágrafo comportamental adiciona frase do arquétipo dominante + secundário e hashtag `#{slug}`. |
| `components/apostila-ich.tsx` | Seção 8 vira grid 2 colunas (DISC + Arquétipo). Novo componente `ArchetypeTop3` renderiza os 3 cards na seção 9. `labelMap` ganha entrada `"arquetipos": "Arquétipos (12 tipos jungianos)"`. |

### Fluxo de dados

```
[Candidato faz avaliação Arquétipos]
        ↓
services/arquetipos/src/apply.ts → ApplicationResult { interpretation: { dominant, dominant_label, secondary, top3 } }
        ↓
POST /api/instruments/{slug}/apply
ou POST /api/portal/me/instruments/{slug}/apply
        ↓
db.assessments.interpretationJson = JSON.stringify(envelope.interpretation)
        ↓
[Recrutador/candidato abre /candidatos/{id}/apostila ou /portal/me/apostila]
        ↓
lib/ich/loader.ts → computeBehavioralIndex(assessmentList)
        ↓
behavioral-index.ts extrai `archetype` do interpretationJson da avaliação "arquetipos"
        ↓
narrative.ts inclui o arquétipo na descrição
        ↓
components/apostila-ich.tsx renderiza seções 8 (dominante) e 9 (top 3)
```

### Contrato — `ArchetypeSummary`

```ts
interface ArchetypeSummary {
  dominant: string;          // slug: "heroi", "sabio", "mago", ...
  dominant_label: string;    // "Herói", "Sábio", ...
  secondary: string;
  secondary_label: string;
  top3: Array<{
    archetype: string;
    label: string;
    score: number;            // 0-100
    description: string;      // autoral, vem do services/arquetipos/src/interpretation.ts
  }>;
}
```

### Linguagem responsável

Mantida a regra do projeto (AGENTS.md): descrições dos arquétipos são autorais, sem termos clínicos. Conceito de 12 arquétipos jungianos é domínio público desde 2011 — descrições próprias evitam violação de copyright dos textos comerciais (Brand Archetypes, Hero Within etc).

---

## Feature B — Cadastro via QR + Tour de onboarding

### O que muda pro usuário

Cenário: Kavuka coloca um QR code físico (banner, evento, balcão) que aponta direto pro cadastro. Antes, o candidato caía no formulário "frio". Agora:

1. QR → `/portal/cadastro?qr=1` exibe banner laranja "Boas-vindas à Kavuka" com promessa do tour.
2. Após criar conta, login automático e redirect pra `/portal/me?welcome=1`.
3. **Modal de boas-vindas** com dois botões:
   - **Fazer tour guiado** (2 min) → roda 5 passos com spotlight + balão explicativo.
   - **Vou explorar sozinho(a)** → fecha e marca como concluído.
4. Durante o tour: cada passo destaca um elemento da tela com aro laranja, escurece o resto e mostra balão com título + texto + botões **Anterior**, **Próximo**, **pular tour** + barra de progresso.
5. Ao terminar, toast verde "✓ Tour concluído · bom preenchimento!".
6. Concluído (ou pulado) uma vez, **não volta a aparecer** para aquele candidato (localStorage).

### Arquivos alterados / criados

| Arquivo | Mudança |
|---|---|
| `app/portal/cadastro/page.tsx` | Lê `searchParams.qr` / `from`. Se vier de QR, mostra banner motivacional acima do form. |
| `app/portal/cadastro/cadastro-client.tsx` | No sucesso do cadastro: `localStorage.setItem("kavuka_show_tour", "1")` + redirect para `/portal/me?welcome=1`. |
| `app/portal/me/me-client.tsx` | Importa `PortalTour`. Detecta `welcome=1` via `window.location` no `useEffect`. Adiciona âncoras `data-tour="..."` nos 5 elementos. Monta `<PortalTour candidateId={...} forceOpen={welcomeFromUrl} onRequestTab={setTab} />` no fim do JSX. |
| `app/portal/me/portal-tour.tsx` | **Novo.** Componente do tour (descrito abaixo). |

### Componente `PortalTour` — visão geral

Arquivo: `app/portal/me/portal-tour.tsx` (~360 linhas, client component).

**Props:**
```ts
interface Props {
  candidateId: string;
  /** Se true, abre direto o modal (vindo de ?welcome=1) */
  forceOpen?: boolean;
  /** Callback pra ativar uma tab no parent quando step pede */
  onRequestTab?: (tabKey: string) => void;
}
```

**Máquina de estados (`Phase`):**
```
closed ─(forceOpen || localStorage.kavuka_show_tour)─→ welcome
welcome ─(Fazer tour)─→ running
welcome ─(Vou explorar)─→ closed (marca tour como concluído)
running ─(Próximo no último step)─→ done (toast verde 2.4s) → closed
running ─(pular tour)─→ closed (marca como concluído)
```

**LocalStorage keys:**
- `kavuka_show_tour = "1"` → marcador de "vim do cadastro, abra o modal". Apagado quando o modal abre.
- `kavuka_tour_completed:{candidateId}` → ISO timestamp da conclusão. Bloqueia re-execução automática.

### Os 5 passos do tour

Definidos em `STEPS: TourStep[]` dentro de `portal-tour.tsx`:

| # | `anchor` (data-tour) | Título | Foco |
|---|---|---|---|
| 1 | `avatar` | Comece pela foto | Avatar uploader — humanizar candidatura |
| 2 | `completude` | Acompanhe seu progresso | Barra de % do currículo |
| 3 | `curriculo-ich` | Seu Currículo ICH | Botão que leva pra apostila |
| 4 | `tabs` | Preencha cada seção | Linha de abas (Perfil, Experiência, Formação, Skills, Idiomas, Avaliações) |
| 5 | `avaliacoes-tab` | Faça as avaliações | Ativa a tab "Avaliações" automaticamente via `onRequestTab` |

### Como ancorar novos elementos

Pra adicionar um novo passo ao tour:

1. Coloca `data-tour="meu-novo-anchor"` no elemento JSX em `me-client.tsx`.
2. Adiciona um item ao array `STEPS` em `portal-tour.tsx`:
   ```ts
   {
     anchor: "meu-novo-anchor",
     title: "Título curto",
     body: "Texto explicativo curto.",
     placement: "bottom",         // ou "top" | "auto"
     activateTab: "skills",       // opcional, se precisar trocar de tab antes
   }
   ```

### Posicionamento dinâmico do balão

- Lê `getBoundingClientRect()` do elemento ancorado.
- `scrollIntoView({ block: "center" })` antes de medir, com delay de 320ms.
- Re-calcula em `resize` e `scroll`.
- **Desktop (≥640px):** balão de 360px posicionado abaixo (ou acima, se não couber). Centralizado horizontalmente, clamped a 16px das bordas.
- **Mobile (<640px):** balão fixo no rodapé (`left-3 right-3 bottom-3`), sem spotlight — UX mais limpa em telas pequenas.

### Spotlight (recorte)

Implementado com `clip-path: polygon(...)` em um overlay `rgba(0,0,0,0.65)`. Recorta um retângulo +8px ao redor do elemento ancorado, escurecendo o resto da tela. Um segundo `div` acima desenha o aro laranja (`border: 2px solid #ff6a00` + `box-shadow` halo).

### Z-index stack

| Camada | z-index | Conteúdo |
|---|---|---|
| Overlay escuro (spotlight) | 180 | `pointer-events: none` |
| Aro laranja | 181 | `pointer-events: none` |
| Balão | 182 | Recebe cliques |
| Modal welcome / toast done | 200 | Mais alto |

---

## URLs operacionais

### Pra gerar o QR code

Use uma destas duas URLs ao gerar o QR (preferir a primeira, dispara o banner motivacional):

```
http://2.24.85.36/portal/cadastro?qr=1
http://2.24.85.36/portal/cadastro?from=qr
```

Quando o DNS de `rh.kavuka.ai` propagar e o SSL for emitido, basta trocar o host: `https://rh.kavuka.ai/portal/cadastro?qr=1`.

### URL canônica do cadastro (sem banner)

```
http://2.24.85.36/portal/cadastro
```

### URL do tour (pós-cadastro)

`/portal/me?welcome=1` — abre o modal de boas-vindas se o candidato ainda não tiver concluído o tour. Setada automaticamente pelo `cadastro-client.tsx`.

---

## Como testar

### Tour pós-cadastro (caminho real)

1. Apaga a conta de teste (se existir) no DB ou usa email novo.
2. Abre `http://2.24.85.36/portal/cadastro?qr=1` → confere banner laranja.
3. Preenche o form → submit → cai em `/portal/me` com modal aberto.
4. Testa "Fazer tour guiado" e "Vou explorar sozinho(a)".

### Forçar re-tour numa conta existente

Logado em `/portal/me`, abre DevTools → **Application** → **Local Storage** → apaga a chave `kavuka_tour_completed:{candidateId}` e visita `/portal/me?welcome=1`.

Para conta de teste padrão (`candidato@kavuka.ai` / `candidato`):
```js
// Cole no Console do navegador na página /portal/me
localStorage.removeItem("kavuka_tour_completed:flAPB4k3PiBLovPEfPhq5");
location.search = "?welcome=1";
```

### Currículo ICH com Arquétipos

1. Logar como recrutador (`rodrigo.sasso@guep.com.br` / `kavuka2026`).
2. Achar um candidato que tenha completado a avaliação `arquetipos` (filtrar em `/candidatos` por avaliações).
3. Abrir `/candidatos/{id}/apostila` → seção 8 (DISC + Arquétipo lado a lado) e seção 9 (top 3 cards).
4. Mesma view pelo lado do candidato: `/portal/me/apostila` quando logado pelo portal.

### Smoke tests rápidos (curl)

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://2.24.85.36/portal/cadastro
curl -s -o /dev/null -w "%{http_code}\n" "http://2.24.85.36/portal/cadastro?qr=1"
# esperado: 200 nos dois
```

---

## Pendências e próximos passos

### Conectados ao Currículo ICH

- [ ] Quando o candidato ainda **não fez** Arquétipos, seção 9 não mostra placeholder/CTA pra fazer. Hoje só "some" — poderia ter um card "Faça Arquétipos pra aparecer aqui".
- [ ] Linguagem do arquétipo na seção 8 está em laranja sólido — testar contraste em modo claro.
- [ ] PDF (impressão) — confirmar que os cards do top 3 renderizam bem em uma página (talvez force `page-break-inside: avoid`).

### Conectados ao Tour

- [ ] Botão "Refazer tour" no canto do `/portal/me` (hoje precisa mexer em localStorage pra forçar). Pode entrar como link no menu da tab Perfil ou ícone pequeno no header.
- [ ] Persistir conclusão no DB (`candidates.onboarding_seen_at`) em vez de só localStorage — assim funciona cross-device. Hoje, se o candidato troca de dispositivo, o tour reabre.
- [ ] Eventos de analytics (passou pelo tour completo, pulou no passo X, escolheu "explorar sozinho"). Útil pra calibrar qual passo perde gente.
- [ ] Versão em outras línguas — hoje só pt-BR hardcoded.
- [ ] Tour específico para retomada (candidato volta dias depois e ainda não preencheu nada — tour diferente, "vamos terminar onde você parou").

### Roadmap mais amplo (não tocado nesta iteração, da memória do projeto)

- Domínio `rh.kavuka.ai` + SSL via certbot (depende do gestor de DNS).
- SMTP real + remover `EMAIL_DISABLED=true`.
- Google OAuth (precisa de HTTPS + domínio).
- Trocar senha root da VPS + rotacionar `AUTH_SECRET`.
- Decidir destino dos 1106 candidatos "cobaias" importados.

---

## Comandos úteis

### Deploy

```bash
ssh root@2.24.85.36 "cd /opt/kavukaexperts && git pull && npm ci && npm run build && pm2 restart kavuka-experts"
```

### Logs

```bash
ssh root@2.24.85.36 "pm2 logs kavuka-experts --lines 100"
```

### Backup DB

```bash
ssh root@2.24.85.36 "pg_dump -U kavuka kavuka_experts > backup-$(date +%F).sql"
```

### Conferir tour no Postgres

```sql
-- (quando migrar persistência pro DB)
SELECT id, email, created_at, onboarding_seen_at
FROM candidates
ORDER BY created_at DESC
LIMIT 10;
```

---

*Última atualização: 2026-05-15 · Autor: Rodrigo Sasso + Claude*
