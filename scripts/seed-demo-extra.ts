/**
 * Seed extra — adiciona MAIS vagas e MAIS candidatos pra deixar o kanban vivo
 * antes da apresentação. Idempotente via IDs determinísticos.
 */

import { db } from "../db";
import { companies, jobs, candidates, applications } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const EXTRA_JOBS = [
  {
    id: "demo-job-vendedor-techstore",
    slug: "vendedor-loja-tech-sao-paulo",
    title: "Vendedor de Loja Tech",
    description:
      "Atuação em loja física de eletrônicos. Atendimento consultivo, fechamento de vendas, cross-sell.\n\n• CLT + comissão\n• Escala 6x1\n• Vale-transporte + refeição\n• Plano de saúde após 90 dias",
    seniority: "junior",
    salaryMin: 2200,
    salaryMax: 3000,
    location: "São Paulo/SP",
    remote: "on_site",
  },
  {
    id: "demo-job-coord-logistica",
    slug: "coordenador-logistica-guarulhos",
    title: "Coordenador(a) de Logística",
    description:
      "Liderança de equipe de 12 pessoas em CD em Guarulhos. Gestão de KPIs, processos, melhoria contínua.\n\n• CLT pleno + benefícios completos\n• Vale-transporte fretado\n• PLR semestral",
    seniority: "lideranca",
    salaryMin: 7500,
    salaryMax: 10500,
    location: "Guarulhos/SP",
    remote: "on_site",
  },
  {
    id: "demo-job-cs-saude",
    slug: "customer-success-saude",
    title: "Customer Success — saúde",
    description:
      "Atendimento e onboarding de clientes empresariais (operadoras de saúde). Foco em retenção e expansão de conta.\n\n• PJ ou CLT\n• Híbrido (2x semana presencial em SP)\n• Bônus por NPS",
    seniority: "pleno",
    salaryMin: 5500,
    salaryMax: 7500,
    location: "São Paulo/SP",
    remote: "hybrid",
  },
  {
    id: "demo-job-recepcionista",
    slug: "recepcionista-osasco",
    title: "Recepcionista bilíngue",
    description:
      "Recepção de matriz corporativa. Atendimento presencial, telefone, agendamentos. Inglês intermediário.\n\n• CLT\n• Presencial Osasco\n• Plano odonto + saúde",
    seniority: "junior",
    salaryMin: 2400,
    salaryMax: 3000,
    location: "Osasco/SP",
    remote: "on_site",
  },
  {
    id: "demo-job-analista-dados",
    slug: "analista-dados-junior-remoto",
    title: "Analista de Dados Júnior",
    description:
      "Construção de dashboards, ETL básico, análise exploratória. SQL + Python + Power BI.\n\n• CLT remoto\n• Disponibilidade pra 3 dias presencial em SP por mês\n• Vale-cultura + ginástica",
    seniority: "junior",
    salaryMin: 4200,
    salaryMax: 5500,
    location: "Remoto / SP base",
    remote: "remote",
  },
];

const EXTRA_CANDIDATES = [
  // Cluster vagas tech-store / vendedor
  { id: "demo-cand-elaine", name: "Elaine Souza", email: "elaine.souza@email.com", city: "São Paulo", state: "SP", lat: "-23.5340", lng: "-46.6420", role: "Vendedora", company: "FastShop", years: 3, edu: "medio", salary: 2700, target: "demo-job-vendedor-techstore", stage: "screening", scoreFit: 78, scoreHumano: 72 },
  { id: "demo-cand-rafael", name: "Rafael Mendes", email: "rafael.mendes@email.com", city: "Guarulhos", state: "SP", lat: "-23.4670", lng: "-46.5400", role: "Atendente sr", company: "Magazine Luiza", years: 5, edu: "superior_incompleto", salary: 3000, target: "demo-job-vendedor-techstore", stage: "interview", scoreFit: 84, scoreHumano: 80 },
  { id: "demo-cand-fernanda", name: "Fernanda Lopes", email: "fernanda.lopes@email.com", city: "São Paulo", state: "SP", lat: "-23.5550", lng: "-46.6360", role: "Estagiária", company: "Casas Bahia", years: 1, edu: "superior_incompleto", salary: 2400, target: "demo-job-vendedor-techstore", stage: "applied", scoreFit: 65, scoreHumano: null },

  // Cluster coordenador logistica
  { id: "demo-cand-marcelo", name: "Marcelo Tavares", email: "marcelo.tavares@email.com", city: "Guarulhos", state: "SP", lat: "-23.4628", lng: "-46.5333", role: "Supervisor de CD", company: "DHL", years: 9, edu: "superior", salary: 9500, target: "demo-job-coord-logistica", stage: "offer", scoreFit: 91, scoreHumano: 84 },
  { id: "demo-cand-carla", name: "Carla Nogueira", email: "carla.nogueira@email.com", city: "Itaquaquecetuba", state: "SP", lat: "-23.4858", lng: "-46.3486", role: "Coordenadora jr", company: "Mercado Livre", years: 6, edu: "superior", salary: 8000, target: "demo-job-coord-logistica", stage: "interview", scoreFit: 80, scoreHumano: 76 },
  { id: "demo-cand-lucas", name: "Lucas Berg", email: "lucas.berg@email.com", city: "São Paulo", state: "SP", lat: "-23.5750", lng: "-46.6440", role: "Analista log sr", company: "Ambev", years: 7, edu: "pos", salary: 9800, target: "demo-job-coord-logistica", stage: "screening", scoreFit: 75, scoreHumano: 70 },
  { id: "demo-cand-priscila", name: "Priscila Reis", email: "priscila.reis@email.com", city: "Mauá", state: "SP", lat: "-23.6677", lng: "-46.4613", role: "Coord. operações", company: "Magalu Log", years: 8, edu: "superior", salary: 9200, target: "demo-job-coord-logistica", stage: "applied", scoreFit: null, scoreHumano: null },

  // Cluster CS saúde
  { id: "demo-cand-juliana", name: "Juliana Castro", email: "juliana.castro@email.com", city: "São Paulo", state: "SP", lat: "-23.5680", lng: "-46.6800", role: "CS pleno", company: "Conexa Saúde", years: 4, edu: "superior", salary: 6500, target: "demo-job-cs-saude", stage: "interview", scoreFit: 88, scoreHumano: 79 },
  { id: "demo-cand-paulo", name: "Paulo Henrique", email: "paulo.h@email.com", city: "São Paulo", state: "SP", lat: "-23.5980", lng: "-46.6850", role: "Account manager", company: "Hapvida", years: 5, edu: "superior", salary: 7200, target: "demo-job-cs-saude", stage: "assessment", scoreFit: 76, scoreHumano: null },
  { id: "demo-cand-renata", name: "Renata Oliveira", email: "renata.oliveira@email.com", city: "São Caetano do Sul", state: "SP", lat: "-23.6232", lng: "-46.5746", role: "CS jr", company: "iClinic", years: 2, edu: "superior", salary: 5500, target: "demo-job-cs-saude", stage: "applied", scoreFit: null, scoreHumano: null },

  // Cluster recepcionista
  { id: "demo-cand-thais", name: "Thais Andrade", email: "thais.andrade@email.com", city: "Osasco", state: "SP", lat: "-23.5326", lng: "-46.7919", role: "Recepcionista", company: "Hospital Albert Einstein", years: 3, edu: "superior_incompleto", salary: 2700, target: "demo-job-recepcionista", stage: "interview", scoreFit: 86, scoreHumano: 78 },
  { id: "demo-cand-gabriela", name: "Gabriela Lima", email: "gabriela.lima@email.com", city: "Osasco", state: "SP", lat: "-23.5410", lng: "-46.7700", role: "Atendimento", company: "WTorre", years: 2, edu: "medio", salary: 2500, target: "demo-job-recepcionista", stage: "screening", scoreFit: 73, scoreHumano: null },
  { id: "demo-cand-douglas", name: "Douglas Tanaka", email: "douglas.tanaka@email.com", city: "Carapicuíba", state: "SP", lat: "-23.5230", lng: "-46.8362", role: "Recepcionista", company: "Plaza Sul", years: 4, edu: "tecnico", salary: 2800, target: "demo-job-recepcionista", stage: "applied", scoreFit: null, scoreHumano: null },

  // Cluster analista de dados
  { id: "demo-cand-amanda", name: "Amanda Dias", email: "amanda.dias@email.com", city: "São Paulo", state: "SP", lat: "-23.5630", lng: "-46.6520", role: "Analista BI jr", company: "B3", years: 2, edu: "superior", salary: 4800, target: "demo-job-analista-dados", stage: "assessment", scoreFit: 82, scoreHumano: 75 },
  { id: "demo-cand-igor", name: "Igor Pacheco", email: "igor.pacheco@email.com", city: "Curitiba", state: "PR", lat: "-25.4296", lng: "-49.2710", role: "Estagiário dados", company: "Tribanco", years: 1, edu: "superior_incompleto", salary: 4200, target: "demo-job-analista-dados", stage: "applied", scoreFit: null, scoreHumano: null },
  { id: "demo-cand-natalia", name: "Natália Vieira", email: "natalia.vieira@email.com", city: "Belo Horizonte", state: "MG", lat: "-19.9167", lng: "-43.9345", role: "Analytics jr", company: "Localiza", years: 3, edu: "superior", salary: 5300, target: "demo-job-analista-dados", stage: "screening", scoreFit: 79, scoreHumano: null },
];

async function main() {
  console.log("🌱 Seed extra — vagas e candidatos");

  // Pega GUÉP
  const guep = await db.query.companies.findFirst({
    where: eq(companies.cnpj, "30.063.122/0001-98"),
  });
  if (!guep) {
    console.error("❌ Empresa GUÉP não encontrada — rode `npm run seed-demo` primeiro.");
    process.exit(1);
  }

  // Limpa extras anteriores
  for (const j of EXTRA_JOBS) {
    await db.delete(applications).where(eq(applications.jobId, j.id));
    await db.delete(jobs).where(eq(jobs.id, j.id));
  }
  for (const c of EXTRA_CANDIDATES) {
    await db.delete(applications).where(eq(applications.candidateId, c.id));
    await db.delete(candidates).where(eq(candidates.id, c.id));
  }

  // Atualiza o demo principal pra ser publiclyOpen
  await db
    .update(jobs)
    .set({ slug: "atendente-loja-senior-sao-paulo", publiclyOpen: true })
    .where(eq(jobs.id, "demo-job-atendente-senior"));
  console.log("✓ vaga principal marcada como pública");

  // Cria as vagas extras
  for (const j of EXTRA_JOBS) {
    await db.insert(jobs).values({
      id: j.id,
      companyId: guep.id,
      title: j.title,
      slug: j.slug,
      description: j.description,
      status: "open",
      location: j.location,
      remote: j.remote as any,
      employmentType: "clt",
      seniority: j.seniority as any,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      assessmentsJson: JSON.stringify(["ipip-neo-120", "disc-adapt"]),
      publishedAt: new Date(),
      publiclyOpen: true,
    });
    console.log(`✓ vaga: ${j.title}`);
  }

  // Cria candidatos + aplicações
  for (const c of EXTRA_CANDIDATES) {
    const seed = c.name.split(" ").join("+");
    const colors = ["ff6a00", "0ea5e9", "10b981", "a855f7", "f59e0b", "ef4444"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    await db.insert(candidates).values({
      id: c.id,
      name: c.name,
      email: c.email,
      city: c.city,
      state: c.state,
      lat: c.lat,
      lng: c.lng,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=${color}`,
      currentRole: c.role,
      currentCompany: c.company,
      yearsExperience: c.years,
      educationLevel: c.edu,
      expectedSalary: c.salary,
      source: "web",
      consentLgpdAt: new Date(),
    });

    await db.insert(applications).values({
      id: nanoid(),
      jobId: c.target,
      candidateId: c.id,
      stage: c.stage,
      source: "web",
      scoreFit: c.scoreFit,
      scoreHumano: c.scoreHumano,
    });
  }
  console.log(`✓ ${EXTRA_CANDIDATES.length} candidatos + aplicações`);

  console.log("\n✅ Seed extra concluído");
  console.log(`Total de vagas públicas: ${EXTRA_JOBS.length + 1}`);
  console.log(`👉 /carreiras (public portal)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
