import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { companies, jobs } from "../db/schema";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SeedJob = {
  title: string;
  description: string;
  location?: string;
  remote?: "on_site" | "hybrid" | "remote";
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
};

const VAGAS: SeedJob[] = [
  // === 5 vagas do site Guep (descrição rica) ===
  {
    title: "Analista Desenvolvedor Pleno Python/NodeJS",
    description: `**Atribuições**
- Organização e tratamento de grandes volumes de dados (ETL) com Python e/ou NodeJS
- Desenvolvimento de automações via scripts ou plataformas no-code/low-code
- Trabalho com inteligência artificial e engenharia de prompts

**Formação**
Graduação completa na área de tecnologia (ou equivalente)

**Requisitos**
- Python e/ou NodeJS
- Docker e Docker-compose
- MySQL, PostgreSQL, Redis
- Dados semi-estruturados e NoSQL
- Workflow no-code/low-code

**Diferenciais**
- Experiência com ETL
- Langchain
- Integrações com LLMs
- RabbitMQ e/ou Kafka

**Faixa salarial:** R$ 8.000,00 – R$ 10.000,00
**Contato:** ricardo.ogawa@guep.com.br`,
    seniority: "pleno",
    salaryMin: 8000,
    salaryMax: 10000,
  },
  {
    title: "Operador de Cadastro e Consulta",
    description: `**Atribuições**
Operação do sistema de análise de perfil securitário para o setor de transportes (Background Check).

**Formação**
Escolaridade completa

**Requisitos**
- Residir no ABC
- Capacidade analítica e comunicativa
- Foco na realização de atividades
- Comprometimento com resultados
- Habilidade básica em pacote Office e ferramentas digitais

**Diferenciais**
- Conhecimento em seguros e gerenciamento de risco para transportes
- Noção básica de termos e certidões jurídicas

**Salário:** Média de R$ 2.200,00 + Benefícios
**Horário:** Períodos diurno e noturno disponíveis
**Contato:** trabalheconosco@guep.com.br`,
    location: "ABC (São Paulo)",
    remote: "on_site",
    seniority: "junior",
    salaryMin: 2200,
  },
  {
    title: "Desenvolvedor Frontend – Níveis Junior e Pleno",
    description: `**Atribuições**
Desenvolvimento front-end utilizando Angular e tecnologias web modernas.

**Formação**
Tecnólogo ou Bacharelado em Análise e Desenvolvimento de Sistemas, Ciências da Computação ou Sistemas da Informação (cursando ou completo).

**Requisitos**
- Mínimo 2 anos de experiência em desenvolvimento
- Angular 7+
- Lazy Loading
- SPA

**Diferenciais**
- Typescript
- Docker / Docker Compose
- SSR

**Horário:** Segunda à sexta, 09:00 às 18:00
**Contato:** ricardo.ogawa@guep.com.br`,
    seniority: "pleno",
  },
  {
    title: "Desenvolvedor Backend – Níveis Junior e Pleno",
    description: `**Atribuições**
Desenvolvimento back-end utilizando Node.js e arquitetura MVC.

**Formação**
Tecnólogo ou Bacharelado em Análise e Desenvolvimento de Sistemas, Ciências da Computação ou Sistemas da Informação (cursando ou completo).

**Requisitos**
- Mínimo 2 anos de experiência em desenvolvimento
- Node.js
- MVC
- MySQL

**Diferenciais**
- Typescript
- Docker / Docker Compose
- Sequelize
- Redis
- Linux

**Horário:** Segunda à sexta, 09:00 às 18:00
**Contato:** ricardo.ogawa@guep.com.br`,
    seniority: "pleno",
  },
  {
    title: "Assistente de Pré-Vendas – Pleno",
    description: `**Atribuições**
Atuação na área comercial realizando primeiro contato com leads, prospecção de clientes via e-mail, telefone, LinkedIn e eventos, qualificação de leads e direcionamento aos vendedores.

**Formação**
Ensino superior completo ou cursando em Administração de Empresas, Administração com ênfases em Comércio Exterior, Gestão de Negócios ou Gestão Comercial.

**Requisitos**
- Fácil acesso ao ABC
- Mínimo 1 ano de experiência em vendas
- Foco em resultado
- Negociação e trabalho em equipe
- Boa comunicação e relação interpessoal

**Diferenciais**
- Experiência em seguros para setor de transporte
- Conhecimento em pacote Office (Word, Excel, Outlook)

**Benefícios**
Vale transporte · Vale refeição · Auxílio creche · Seguro de vida · Seguro saúde · Seguro odontológico

**Contato:** trabalheconosco@guep.com.br`,
    location: "ABC (São Paulo)",
    remote: "on_site",
    seniority: "pleno",
  },

  // === 14 vagas legacy (do CSV, sem descrição) ===
  { title: "Assistente Administrativo de Vendas", description: "" },
  { title: "Analista de Customer Success Jr I", description: "", seniority: "junior" },
  { title: "Assistente Operacional Jr. – Área Operacional", description: "", seniority: "junior" },
  { title: "Assistente Operacional Júnior", description: "", seniority: "junior" },
  { title: "Assist. Operacional Jr.", description: "", seniority: "junior" },
  { title: "Analista de Planejamento Estratégico", description: "" },
  { title: "Outros", description: "Banco de talentos — candidatos com interesse genérico" },
  { title: "Desenvolvedor Full Stack - Sênior", description: "", seniority: "senior" },
  { title: "Desenvolvedor Fullstack - Júnior", description: "", seniority: "junior" },
  { title: "Desenvolvedor Fullstack - T.I", description: "" },
  { title: "Assistente de Produtos JR", description: "", seniority: "junior" },
  { title: "Analista de criação de produtos pleno", description: "", seniority: "pleno" },
  { title: "Desenvolvedor Front-end – Pleno", description: "", seniority: "pleno" },
  { title: "Analista de Produtos e Projetos – Pl", description: "", seniority: "pleno" },
  { title: "Desenvolvedor Backend – Sênior", description: "", seniority: "senior" },
];

async function main() {
  console.log("🌱 Seed vagas Guep (20 vagas)");

  const company = await db.query.companies.findFirst({
    where: eq(companies.cnpj, "30.063.122/0001-98"),
  });
  if (!company) {
    throw new Error("Company GUÉP não encontrada. Rode 'npm run seed' primeiro.");
  }

  let created = 0, skipped = 0;
  for (const v of VAGAS) {
    const slug = slugify(v.title);
    const existing = await db.query.jobs.findFirst({ where: eq(jobs.slug, slug) });
    if (existing) {
      console.log(`  ✓ já existe: ${v.title}`);
      skipped++;
      continue;
    }
    await db.insert(jobs).values({
      id: nanoid(),
      companyId: company.id,
      title: v.title,
      description: v.description,
      slug,
      status: "open",
      location: v.location ?? null,
      remote: v.remote ?? "on_site",
      employmentType: "clt",
      salaryMin: v.salaryMin ?? null,
      salaryMax: v.salaryMax ?? null,
      seniority: v.seniority ?? null,
      publiclyOpen: true,
      publishedAt: new Date(),
    });
    console.log(`  + ${v.title}`);
    created++;
  }

  console.log(`\n✅ Vagas: ${created} criadas, ${skipped} já existiam`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
