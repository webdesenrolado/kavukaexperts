/**
 * Demo seed — popula o banco com dados realistas pra apresentação:
 * - GUÉP com endereço/lat/lng
 * - 1 vaga aberta "Atendente de Loja Sênior"
 * - 4 candidatos com cidades diferentes (mostra mapa povoado)
 * - Aplicações dos 4 candidatos na vaga
 * - Ana Carolina (a estrela) com TODOS os 12 instrumentos respondidos
 *   (1 real via IPIP + 11 stubs com payload fake plausível)
 *
 * Idempotente: se rodar de novo, limpa o demo anterior pelos IDs determinísticos.
 */

import { db } from "../db";
import { companies, candidates, jobs, applications, assessments, invitations } from "../db/schema";
import { eq } from "drizzle-orm";
import { applyIpipNeo120 } from "../services/ipip-neo-120/src";
import { IPIP_NEO_120_ITEMS } from "../services/ipip-neo-120/src/items";
import { nanoid } from "nanoid";

// IDs determinísticos pra limpar/reescrever o demo de forma idempotente
const DEMO_IDS = {
  jobId: "demo-job-atendente-senior",
  candidates: [
    { id: "demo-cand-ana", name: "Ana Carolina Silva" },
    { id: "demo-cand-bruno", name: "Bruno Oliveira" },
    { id: "demo-cand-camila", name: "Camila Ferreira" },
    { id: "demo-cand-diego", name: "Diego Pereira" },
  ],
};

// KYID token determinístico pra Ana — permite URL fixa /kyid/demo-kyid-ana-carolina-silva-2026
// no ambiente de demo. Em produção, o token é nanoid(32) gerado lazy no primeiro convite.
const ANA_KYID_TOKEN = "demo-ana-carolina-kyid-token-2026-kavuka";

// GUÉP HQ (fictícia) — Vila Olímpia SP
const GUEP_LOCATION = {
  address: "Av. Funchal, 538",
  city: "São Paulo",
  state: "SP",
  lat: "-23.5965",
  lng: "-46.6873",
};

const CANDIDATE_PROFILES = [
  {
    id: DEMO_IDS.candidates[0].id,
    name: "Ana Carolina Silva",
    email: "ana.carolina@email.com",
    phone: "+55 11 91234-5678",
    cpf: "123.456.789-00",
    city: "São Paulo",
    state: "SP",
    address: "Pinheiros",
    lat: "-23.5670",
    lng: "-46.6890",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Ana+Carolina&backgroundColor=ff6a00",
    kyidToken: ANA_KYID_TOKEN,
    linkedinUrl: "https://linkedin.com/in/ana-carolina-demo",
    currentRole: "Atendente Pleno",
    currentCompany: "Magazine Estrela",
    yearsExperience: 4,
    educationLevel: "superior_incompleto",
    expectedSalary: 3200,
    consentLgpdAt: new Date(),
    isStarCandidate: true,
  },
  {
    id: DEMO_IDS.candidates[1].id,
    name: "Bruno Oliveira",
    email: "bruno.oliveira@email.com",
    phone: "+55 11 99876-5432",
    city: "Guarulhos",
    state: "SP",
    address: "Centro",
    lat: "-23.4628",
    lng: "-46.5333",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Bruno+Oliveira&backgroundColor=0ea5e9",
    currentRole: "Vendedor",
    currentCompany: "Loja Universo",
    yearsExperience: 2,
    educationLevel: "medio",
    expectedSalary: 2500,
    consentLgpdAt: new Date(),
    isStarCandidate: false,
  },
  {
    id: DEMO_IDS.candidates[2].id,
    name: "Camila Ferreira",
    email: "camila.ferreira@email.com",
    phone: "+55 11 98765-4321",
    city: "Osasco",
    state: "SP",
    address: "Bonfim",
    lat: "-23.5326",
    lng: "-46.7919",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Camila+Ferreira&backgroundColor=10b981",
    currentRole: "Atendente Sênior",
    currentCompany: "Rede Comercial BR",
    yearsExperience: 7,
    educationLevel: "superior",
    expectedSalary: 4200,
    consentLgpdAt: new Date(),
    isStarCandidate: false,
  },
  {
    id: DEMO_IDS.candidates[3].id,
    name: "Diego Pereira",
    email: "diego.pereira@email.com",
    phone: "+55 11 97654-3210",
    city: "São Bernardo do Campo",
    state: "SP",
    address: "Centro",
    lat: "-23.6913",
    lng: "-46.5651",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Diego+Pereira&backgroundColor=a855f7",
    currentRole: "Operador de Caixa",
    currentCompany: "Hipermercado Sul",
    yearsExperience: 1,
    educationLevel: "tecnico",
    expectedSalary: 2200,
    consentLgpdAt: new Date(),
    isStarCandidate: false,
  },
];

/* ------------------------------------------------------------------ */
/* Geração de respostas IPIP realistas para Ana                        */
/* ------------------------------------------------------------------ */

function generateRealisticResponses() {
  // Ana = perfil "atendente sênior" — alta amabilidade, alta extroversão,
  // conscienciosidade média-alta, neuroticismo médio-baixo.
  // Mapeamos cada item ao domínio + reverse_keyed e escolhemos resposta plausível.
  return IPIP_NEO_120_ITEMS.map((item) => {
    const target = (() => {
      switch (item.domain) {
        case "A": return 4.2; // amabilidade alta
        case "E": return 4.0; // extroversão alta
        case "C": return 3.8; // conscienciosidade alta
        case "O": return 3.5; // abertura média
        case "N": return 2.5; // neuroticismo baixo
        default: return 3.0;
      }
    })();
    let raw = target + (Math.random() - 0.5) * 1.2;
    if (item.reverse_keyed) raw = 6 - raw;
    const value = Math.max(1, Math.min(5, Math.round(raw))) as 1 | 2 | 3 | 4 | 5;
    return {
      item_id: item.item_id,
      value: { kind: "likert5" as const, value },
      response_time_ms: 1500 + Math.round(Math.random() * 2000),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Geração de assessments fake para os outros 11 instrumentos           */
/* ------------------------------------------------------------------ */

function fakeAssessment(
  instrument: string,
  scores: any,
  interpretation: any,
  qualityFlags: string[] = [],
) {
  return {
    instrument,
    instrumentVersion: "1.0.0",
    scoresJson: JSON.stringify(scores),
    interpretationJson: JSON.stringify(interpretation),
    qualityFlagsJson: JSON.stringify(qualityFlags),
  };
}

const FAKE_ASSESSMENTS = [
  fakeAssessment("bigfive-short", {
    domains: {
      O: { raw: 35, level: "average" },
      C: { raw: 38, level: "high" },
      E: { raw: 40, level: "high" },
      A: { raw: 42, level: "high" },
      N: { raw: 25, level: "low" },
    },
  }, {
    strengths: ["Estabilidade emocional consistente", "Preferência por trabalho em equipe"],
    watchouts: ["Tendência a aceitar tudo — pode evitar conflitos necessários"],
    narrative: "Versão curta IPIP-50 confirma os domínios principais com alta consistência.",
    confidence: "high",
  }),
  fakeAssessment("mbti-like", {
    type: "ENFJ",
    dimensions: {
      EI: { letter: "E", magnitude: "moderate" },
      SN: { letter: "N", magnitude: "moderate" },
      TF: { letter: "F", magnitude: "clear" },
      JP: { letter: "J", magnitude: "moderate" },
    },
  }, {
    strengths: ["Comunicação calorosa e mobilizadora", "Naturalmente orientada a pessoas"],
    watchouts: ["Pode levar críticas para o lado pessoal"],
    narrative: "Perfil ENFJ tipo 'Mentor' — sensibilidade interpessoal forte, preferência por estrutura.",
    confidence: "medium",
  }),
  fakeAssessment("disc-adapt", {
    profile: "I/S",
    scores: { D: 22, I: 78, S: 71, C: 45 },
    primary: "I",
    secondary: "S",
  }, {
    strengths: ["Trato natural com clientes", "Cooperação em equipe"],
    watchouts: ["Em decisões críticas pode hesitar para evitar conflito"],
    narrative: "Perfil Influenciador-Estável: ideal pra atendimento e relacionamento contínuo.",
    confidence: "high",
  }),
  fakeAssessment("label-guep", {
    label: "Conectora",
    secondary_label: "Cuidadora",
    score: 0.82,
  }, {
    strengths: ["Cria pontes entre pessoas", "Constrói confiança rápido"],
    watchouts: ["Pode se sobrecarregar emocionalmente"],
    narrative: "Label GUÉP: Conectora — perfil de quem tece relacionamentos como base de resultado.",
    confidence: "medium",
  }),
  fakeAssessment("gallup-adapt", {
    top5: ["Empatia", "Comunicação", "Harmonia", "Responsabilidade", "Positividade"],
    domain_distribution: {
      relationship_building: 3,
      executing: 1,
      influencing: 1,
      strategic_thinking: 0,
    },
  }, {
    strengths: ["3 dos 5 talentos no domínio Relacionamento — diferencial em vendas consultivas"],
    watchouts: ["Pouco peso em pensamento estratégico — pode precisar de par complementar"],
    narrative: "Perfil de talentos centrado em pessoas, com execução sólida.",
    confidence: "medium",
  }),
  fakeAssessment("dark-triad", {
    machiavellianism: { raw: 1.8, level: "very_low" },
    narcissism: { raw: 2.1, level: "low" },
    boldness: { raw: 2.3, level: "low" },
    overall_risk: "very_low",
  }, {
    strengths: ["Estilo cooperativo e direto, sem traços manipulativos"],
    watchouts: ["Pode evitar autopromoção — recrutador deve buscar realizações ativamente"],
    narrative: "Tendências de risco interpessoal muito baixas. Estilo de trabalho honesto e colaborativo.",
    confidence: "high",
  }),
  fakeAssessment("hogan-adapt", {
    derailers: {
      excitable: 18,
      skeptical: 25,
      cautious: 35,
      reserved: 22,
      leisurely: 30,
      bold: 28,
      mischievous: 15,
      colorful: 55,
      imaginative: 32,
      diligent: 68,
      dutiful: 75,
    },
    high_risk_count: 0,
  }, {
    strengths: ["Sob pressão tende a se manter responsável e leal à equipe"],
    watchouts: ["Em estresse pode se tornar excessivamente perfeccionista (diligente alto)"],
    narrative: "Padrões adaptados Hogan: nenhum derailer em zona de alto risco. Perfil estável sob pressão.",
    confidence: "medium",
  }),
  fakeAssessment("arquetipos", {
    primary: "Cuidador",
    secondary: "Companheiro",
    distribution: {
      Inocente: 12, Sábio: 18, Explorador: 22, Rebelde: 8, Mago: 14,
      Heroi: 28, Amante: 35, Bobo: 18, Companheiro: 52, Cuidador: 62, Criador: 25, Governante: 15,
    },
  }, {
    strengths: ["Coloca o bem-estar do outro como motor de ação"],
    watchouts: ["Pode negligenciar próprios limites em ambientes exigentes"],
    narrative: "Arquétipo dominante Cuidador — busca significado em servir e proteger.",
    confidence: "medium",
  }),
  fakeAssessment("eneagrama", {
    type: 2,
    type_name: "O Prestativo",
    wing: "2w3",
    distribution: { 1: 12, 2: 75, 3: 42, 4: 25, 5: 15, 6: 22, 7: 18, 8: 10, 9: 35 },
  }, {
    strengths: ["Sintonia genuína com necessidades dos outros", "Generosidade prática"],
    watchouts: ["Pode confundir reconhecimento com afeto"],
    narrative: "Tipo 2 com asa 3 — gosta de ser útil e visível pelo impacto que gera nas pessoas.",
    confidence: "medium",
  }),
  fakeAssessment("score-humano", {
    score: 78,
    components: {
      ipip_big_five: { weight: 0.30, contribution: 24 },
      disc: { weight: 0.20, contribution: 16 },
      gallup: { weight: 0.15, contribution: 12 },
      dark_triad: { weight: 0.15, contribution: 14 },
      hogan: { weight: 0.10, contribution: 7 },
      arquetipos_eneagrama: { weight: 0.10, contribution: 5 },
    },
    fit_categoria: "Atendimento e Relacionamento",
    band: "alto",
  }, {
    strengths: ["Score Humano 78/100 — banda alto, recomendado pra avançar no funil"],
    watchouts: ["Combinação ideal pra atendimento; mediar com gerência se cargo exigir liderança forte"],
    narrative: "Score Humano alto, com forte alinhamento ao perfil de atendimento. Recomenda-se entrevista comportamental focada em situações de conflito (área de menor pontuação derivada).",
    confidence: "high",
  }),
  fakeAssessment("avaliacao-continua", {
    cycles: [
      { period: "30d", note: "Aguardando contratação" },
    ],
  }, {
    strengths: ["Pendente — aplicado apenas em colaboradores ativos"],
    watchouts: [],
    narrative: "Instrumento de feedback contínuo será habilitado após contratação efetiva.",
    confidence: "low",
  }),
];

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🌱 Demo seed Kavuka Experts");

  // 1. Garantir GUÉP com lat/lng
  const guep = await db.query.companies.findFirst({
    where: eq(companies.cnpj, "30.063.122/0001-98"),
  });
  if (!guep) {
    console.error("❌ Empresa GUÉP não encontrada — rode `npm run seed` primeiro.");
    process.exit(1);
  }
  await db
    .update(companies)
    .set(GUEP_LOCATION)
    .where(eq(companies.id, guep.id));
  console.log(`✓ GUÉP atualizada com endereço (${GUEP_LOCATION.lat}, ${GUEP_LOCATION.lng})`);

  // 2. Limpar demo anterior (idempotência) — ordem respeita FKs
  for (const c of DEMO_IDS.candidates) {
    await db.delete(invitations).where(eq(invitations.candidateId, c.id));
    await db.delete(assessments).where(eq(assessments.candidateId, c.id));
    await db.delete(applications).where(eq(applications.candidateId, c.id));
  }
  await db.delete(applications).where(eq(applications.jobId, DEMO_IDS.jobId));
  for (const c of DEMO_IDS.candidates) {
    await db.delete(candidates).where(eq(candidates.id, c.id));
  }
  await db.delete(jobs).where(eq(jobs.id, DEMO_IDS.jobId));
  console.log("✓ Demo anterior limpo");

  // 3. Criar vaga
  await db.insert(jobs).values({
    id: DEMO_IDS.jobId,
    companyId: guep.id,
    title: "Atendente de Loja Sênior",
    description:
      "Buscamos profissional de atendimento com perfil consultivo para atuar em loja própria. Responsável por encantar o cliente, fechar vendas e cuidar do relacionamento pós-venda.\n\nResponsabilidades:\n- Atendimento consultivo presencial\n- Fechamento de vendas com foco em valor\n- Cadastro CRM e follow-up\n- Apoio na operação de loja\n\nRequisitos:\n- Experiência mínima 3 anos em atendimento ou vendas\n- Ensino médio completo (superior é diferencial)\n- Disponibilidade para escala 6x1",
    status: "open",
    location: "São Paulo/SP",
    remote: "on_site",
    employmentType: "clt",
    seniority: "senior",
    salaryMin: 3000,
    salaryMax: 4500,
    assessmentsJson: JSON.stringify([
      "ipip-neo-120",
      "disc-adapt",
      "label-guep",
      "gallup-adapt",
      "dark-triad",
    ]),
    publishedAt: new Date(),
  });
  console.log(`✓ Vaga criada: ${DEMO_IDS.jobId}`);

  // 4. Criar candidatos
  for (const profile of CANDIDATE_PROFILES) {
    const { isStarCandidate, ...rest } = profile;
    await db.insert(candidates).values({
      ...rest,
      source: "web",
    });
    console.log(`✓ Candidato: ${profile.name} (${profile.city})`);
  }

  // 5. Aplicações
  for (const profile of CANDIDATE_PROFILES) {
    const stage = profile.isStarCandidate ? "interview" : "assessment";
    await db.insert(applications).values({
      id: nanoid(),
      jobId: DEMO_IDS.jobId,
      candidateId: profile.id,
      stage,
      source: "web",
      scoreFit: profile.isStarCandidate ? 92 : 60 + Math.round(Math.random() * 20),
      scoreHumano: profile.isStarCandidate ? 78 : 55 + Math.round(Math.random() * 25),
    });
  }
  console.log(`✓ ${CANDIDATE_PROFILES.length} aplicações criadas`);

  // 6. Ana — IPIP-NEO-120 REAL via applyIpipNeo120
  const ipipResponses = generateRealisticResponses();
  const ipipEnvelope = applyIpipNeo120({
    subject_id: DEMO_IDS.candidates[0].id,
    application_id: nanoid(),
    responses: ipipResponses,
    meta: { channel: "web", completion_time_seconds: 920, language: "pt-BR" },
    consent_id: nanoid(),
    data_retention_until: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString(),
  });
  await db.insert(assessments).values({
    id: ipipEnvelope.application_id,
    candidateId: DEMO_IDS.candidates[0].id,
    instrument: "ipip-neo-120",
    instrumentVersion: ipipEnvelope.version,
    status: "completed",
    channel: "web",
    language: "pt-BR",
    responsesJson: JSON.stringify(ipipEnvelope.responses),
    scoresJson: JSON.stringify(ipipEnvelope.scores),
    interpretationJson: JSON.stringify(ipipEnvelope.interpretation),
    qualityFlagsJson: JSON.stringify(ipipEnvelope.quality_flags),
    consentId: ipipEnvelope.consent_id,
    startedAt: new Date(Date.now() - 920 * 1000),
    completedAt: new Date(),
  });
  console.log(`✓ Ana — IPIP-NEO-120 real aplicado`);

  // 7. Ana — 11 outros instrumentos fake
  const baseTime = Date.now();
  for (let i = 0; i < FAKE_ASSESSMENTS.length; i++) {
    const fake = FAKE_ASSESSMENTS[i];
    const ts = new Date(baseTime - (FAKE_ASSESSMENTS.length - i) * 24 * 3600 * 1000);
    await db.insert(assessments).values({
      id: nanoid(),
      candidateId: DEMO_IDS.candidates[0].id,
      instrument: fake.instrument,
      instrumentVersion: fake.instrumentVersion,
      status: "completed",
      channel: "web",
      language: "pt-BR",
      responsesJson: null,
      scoresJson: fake.scoresJson,
      interpretationJson: fake.interpretationJson,
      qualityFlagsJson: fake.qualityFlagsJson,
      consentId: nanoid(),
      startedAt: ts,
      completedAt: ts,
      createdAt: ts,
    });
  }
  console.log(`✓ Ana — ${FAKE_ASSESSMENTS.length} instrumentos adicionais (fake) aplicados`);

  console.log("\n✅ Demo seed concluído");
  console.log("\n👉 Abra http://localhost:3355 e navegue até:");
  console.log("   /vagas/" + DEMO_IDS.jobId + " — vaga com mapa e candidatos");
  console.log("   /candidatos/" + DEMO_IDS.candidates[0].id + " — Ana (recrutador 360°)");
  console.log("   /kyid/" + ANA_KYID_TOKEN + " — KYID pública da Ana (candidato-facing) ⭐");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
