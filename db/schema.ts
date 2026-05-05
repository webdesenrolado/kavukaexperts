import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Empresas-cliente do ATS (multi-tenant)
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj"),
  industry: text("industry"),
  size: text("size"), // micro | small | medium | large
  address: text("address"),
  city: text("city"),
  state: text("state"),
  lat: text("lat"), // string pra evitar precisão flutuante; converter ao usar
  lng: text("lng"),
  logoUrl: text("logo_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Usuários (recrutadores, gestores RH, master). Candidatos têm tabela própria.
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("recruiter"), // master | hr_manager | recruiter
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Vagas
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft | open | paused | closed
  location: text("location"),
  remote: text("remote").default("on_site"), // on_site | hybrid | remote
  employmentType: text("employment_type").default("clt"), // clt | pj | freelance | internship
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  seniority: text("seniority"), // junior | pleno | senior | especialista | lideranca
  // Perfil ideal definido pelo recrutador (consumido pelos microsserviços de avaliação)
  idealProfileJson: text("ideal_profile_json"), // JSON: { traits: { big_five: {...}, disc: {...} }, hardSkills: [], softSkills: [] }
  // Quais microsserviços aplicar nesta vaga
  assessmentsJson: text("assessments_json"), // JSON: ["ipip-neo-120", "big-five", ...]
  // Slug público (ex: atendente-loja-senior). Permite URL bonita /carreiras/[slug]
  slug: text("slug").unique(),
  // Permite candidatura pública (página /carreiras/[slug])
  publiclyOpen: integer("publicly_open", { mode: "boolean" }).default(false),
  ownerId: text("owner_id").references(() => users.id),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  closedAt: integer("closed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Candidatos — base da ICH (Identidade de Conhecimento e Habilidades)
export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  cpf: text("cpf"),
  birthDate: text("birth_date"), // ISO yyyy-mm-dd
  city: text("city"),
  state: text("state"),
  address: text("address"),
  lat: text("lat"),
  lng: text("lng"),
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  currentCompany: text("current_company"),
  currentRole: text("current_role"),
  yearsExperience: integer("years_experience"),
  educationLevel: text("education_level"), // medio | tecnico | superior_incompleto | superior | pos | mestrado | doutorado
  expectedSalary: integer("expected_salary"),
  // KYID — Conheça Sua Identidade. Token permanente que dá ao candidato
  // acesso à sua própria identidade comportamental em /kyid/[token].
  // Gerado lazy quando o primeiro convite é criado.
  kyidToken: text("kyid_token").unique(),
  // ICH em JSON — substitui currículo tradicional
  ichJson: text("ich_json"), // { knowledge: [], skills: [], experiences: [], certifications: [] }
  resumeUrl: text("resume_url"), // PDF original quando enviado
  source: text("source"), // whatsapp | web | indicacao | linkedin | importado
  consentLgpdAt: integer("consent_lgpd_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Aplicações (candidato em uma vaga)
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  // Etapas do funil — espelham as 17 etapas do fluxo Kavuka, simplificadas
  stage: text("stage").notNull().default("applied"), // applied | screening | assessment | interview | practical | offer | hired | rejected | talent_pool
  source: text("source"), // de qual canal a candidatura veio
  scoreFit: integer("score_fit"), // 0-100, fit vaga-pessoa
  scoreHumano: integer("score_humano"), // 0-100, índice GUÉP proprietário
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Canais conectados por empresa (WhatsApp, Email, Instagram, LinkedIn, Web).
// Multi-tenant via companyId. Cada canal pode ter múltiplas conversas.
export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  kind: text("kind").notNull(), // whatsapp | email | instagram | linkedin | web
  displayName: text("display_name").notNull(), // "WhatsApp Recrutamento", "carreiras@guep.com.br"
  identifier: text("identifier"), // número do whats, email, handle ig, etc
  connected: integer("connected", { mode: "boolean" }).default(true),
  config: text("config"), // JSON livre — token, webhook url, etc
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Conversas — agregam mensagens de um contato em um canal.
// Pode estar linkada a um candidato (já cadastrado) ou não (lead bruto).
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  channelId: text("channel_id").notNull().references(() => channels.id),
  contactName: text("contact_name"),
  contactHandle: text("contact_handle"), // phone, email, @user, linkedin url
  contactAvatarUrl: text("contact_avatar_url"),
  candidateId: text("candidate_id").references(() => candidates.id), // null se ainda não converteu
  jobId: text("job_id").references(() => jobs.id), // null se conversa avulsa
  status: text("status").notNull().default("open"), // open | archived | spam
  assignedTo: text("assigned_to").references(() => users.id),
  tags: text("tags"), // JSON array de strings
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  lastMessagePreview: text("last_message_preview"),
  unreadCount: integer("unread_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Mensagens dentro de uma conversa
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  direction: text("direction").notNull(), // inbound | outbound | system
  bodyText: text("body_text"),
  attachmentsJson: text("attachments_json"), // JSON: [{type, url, name}]
  sentByUserId: text("sent_by_user_id").references(() => users.id), // só pra outbound
  sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
  readAt: integer("read_at", { mode: "timestamp" }),
});

// Convites para candidato fazer avaliação sem login (token público)
export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  applicationId: text("application_id").references(() => applications.id),
  instrument: text("instrument").notNull(), // slug, ex: ipip-neo-120
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | expired | revoked
  assessmentId: text("assessment_id"), // preenchido quando concluído (FK para assessments.id)
  createdBy: text("created_by").references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // validade do link
  timeLimitMinutes: integer("time_limit_minutes").default(30), // tempo após iniciar pra concluir
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Aplicações de questionários — uma linha por instrumento aplicado
export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").references(() => applications.id),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  instrument: text("instrument").notNull(), // slug: ipip-neo-120, big-five, mbti-adapt, disc-adapt, ...
  instrumentVersion: text("instrument_version").notNull().default("1.0.0"),
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | invalidated
  channel: text("channel").default("web"), // web | whatsapp | paper
  language: text("language").default("pt-BR"),
  // Payload completo seguindo o contrato JSON canônico de services/_contract/schema.ts
  responsesJson: text("responses_json"), // [{item_id, value, response_time_ms}]
  scoresJson: text("scores_json"), // { ... } depende do instrumento
  interpretationJson: text("interpretation_json"), // { strengths, watchouts, narrative, confidence }
  qualityFlagsJson: text("quality_flags_json"), // ["too_fast", "inconsistent", ...]
  consentId: text("consent_id"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
