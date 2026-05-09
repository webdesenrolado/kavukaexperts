import { pgTable, text, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";

// Empresas-cliente do ATS (multi-tenant)
export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj"),
  industry: text("industry"),
  size: text("size"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  lat: text("lat"),
  lng: text("lng"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("recruiter"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  location: text("location"),
  remote: text("remote").default("on_site"),
  employmentType: text("employment_type").default("clt"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  seniority: text("seniority"),
  idealProfileJson: text("ideal_profile_json"),
  assessmentsJson: text("assessments_json"),
  slug: text("slug").unique(),
  publiclyOpen: boolean("publicly_open").default(false),
  ownerId: text("owner_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const candidates = pgTable("candidates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  phoneAlt: text("phone_alt"),
  cpf: text("cpf"),
  rg: text("rg"),
  birthDate: text("birth_date"),
  age: integer("age"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  nationality: text("nationality"),
  // Endereço
  cep: text("cep"),
  address: text("address"),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  lat: text("lat"),
  lng: text("lng"),
  // Profissional
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  summary: text("summary"),
  currentCompany: text("current_company"),
  currentRole: text("current_role"),
  yearsExperience: integer("years_experience"),
  educationLevel: text("education_level"),
  expectedSalary: integer("expected_salary"),
  // Sistema
  kyidToken: text("kyid_token").unique(),
  ichJson: text("ich_json"),
  resumeUrl: text("resume_url"),
  resumeFilename: text("resume_filename"),
  rawResumeText: text("raw_resume_text"),
  source: text("source"),
  consentLgpdAt: timestamp("consent_lgpd_at"),
  // Auth self-service (preparado pro portal — ainda não em uso)
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const candidateExperiences = pgTable("candidate_experiences", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  employmentType: text("employment_type"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: boolean("current").default(false),
  description: text("description"),
  achievements: text("achievements"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const candidateEducations = pgTable("candidate_educations", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  course: text("course"),
  level: text("level"),
  status: text("status"),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const candidateSkills = pgTable("candidate_skills", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
  level: text("level"),
  category: text("category"),
  yearsOfUse: integer("years_of_use"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const candidateLanguages = pgTable("candidate_languages", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  level: text("level"),
  certification: text("certification"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => jobs.id),
    candidateId: text("candidate_id").notNull().references(() => candidates.id),
    stage: text("stage").notNull().default("applied"),
    source: text("source"),
    scoreFit: integer("score_fit"),
    scoreHumano: integer("score_humano"),
    notes: text("notes"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
  },
  (t) => ({
    candidateJobUq: unique("applications_candidate_job_uq").on(t.candidateId, t.jobId),
  })
);

export const channels = pgTable("channels", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  kind: text("kind").notNull(),
  displayName: text("display_name").notNull(),
  identifier: text("identifier"),
  connected: boolean("connected").default(true),
  config: text("config"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  channelId: text("channel_id").notNull().references(() => channels.id),
  contactName: text("contact_name"),
  contactHandle: text("contact_handle"),
  contactAvatarUrl: text("contact_avatar_url"),
  candidateId: text("candidate_id").references(() => candidates.id),
  jobId: text("job_id").references(() => jobs.id),
  status: text("status").notNull().default("open"),
  assignedTo: text("assigned_to").references(() => users.id),
  tags: text("tags"),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  unreadCount: integer("unread_count").default(0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  direction: text("direction").notNull(),
  bodyText: text("body_text"),
  attachmentsJson: text("attachments_json"),
  sentByUserId: text("sent_by_user_id").references(() => users.id),
  sentAt: timestamp("sent_at").notNull(),
  readAt: timestamp("read_at"),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  applicationId: text("application_id").references(() => applications.id),
  instrument: text("instrument").notNull(),
  status: text("status").notNull().default("pending"),
  assessmentId: text("assessment_id"),
  createdBy: text("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  timeLimitMinutes: integer("time_limit_minutes").default(30),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").references(() => applications.id),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  instrument: text("instrument").notNull(),
  instrumentVersion: text("instrument_version").notNull().default("1.0.0"),
  status: text("status").notNull().default("pending"),
  channel: text("channel").default("web"),
  language: text("language").default("pt-BR"),
  responsesJson: text("responses_json"),
  scoresJson: text("scores_json"),
  interpretationJson: text("interpretation_json"),
  qualityFlagsJson: text("quality_flags_json"),
  consentId: text("consent_id"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

// ===========================================================
// NR-1 — Avaliação de riscos psicossociais (NR-1 + COPSOQ-III)
// ===========================================================

/** Colaborador de empresa cliente B2B (DIFERENTE de candidates) */
export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  cpf: text("cpf"),
  role: text("role"),
  department: text("department"),
  managerId: text("manager_id"),
  hiredAt: timestamp("hired_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

/** Campanha de avaliação NR-1 (uma rodada de envio + coleta) */
export const nr1Campaigns = pgTable("nr1_campaigns", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  questionnaireVersion: text("questionnaire_version").notNull().default("1.0.0"),
  status: text("status").notNull().default("draft"), // draft | active | closed
  isAnonymous: boolean("is_anonymous").default(true),
  targetCount: integer("target_count").default(0),
  responseCount: integer("response_count").default(0),
  startedAt: timestamp("started_at"),
  endsAt: timestamp("ends_at"),
  closedAt: timestamp("closed_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

/** Convite individual com token público (1 por colaborador alvo). */
export const nr1Invitations = pgTable("nr1_invitations", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => nr1Campaigns.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "set null" }),
  token: text("token").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  channel: text("channel"), // email | whatsapp | both
  emailSentAt: timestamp("email_sent_at"),
  whatsappLinkOpenedAt: timestamp("whatsapp_link_opened_at"),
  openedAt: timestamp("opened_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

/** Resposta de um colaborador a uma campanha (anônima por padrão) */
export const nr1Responses = pgTable("nr1_responses", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => nr1Campaigns.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  invitationId: text("invitation_id").references(() => nr1Invitations.id, { onDelete: "set null" }),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "set null" }),
  // Demografia opcional pra segmentação (sem identificar)
  department: text("department"),
  role: text("role"),
  ageBand: text("age_band"), // 18-24, 25-34, 35-44, 45-54, 55+
  tenureBand: text("tenure_band"), // <1y, 1-3y, 3-5y, 5-10y, 10+y
  // 13 respostas (Likert 1-5 cada)
  q1: integer("q1"),
  q2: integer("q2"),
  q3: integer("q3"),
  q4: integer("q4"),
  q5: integer("q5"),
  q6: integer("q6"),
  q7: integer("q7"),
  q8: integer("q8"),
  q9: integer("q9"),
  q10: integer("q10"),
  q11: integer("q11"),
  q12: integer("q12"),
  q13: integer("q13"),
  comment: text("comment"),
  // Scores calculados na hora do submit (cache pra dashboard rápido)
  scoreDemandas: integer("score_demandas"), // 0-100
  scoreAutonomia: integer("score_autonomia"),
  scoreLideranca: integer("score_lideranca"),
  scoreRisco: integer("score_risco"),
  scoreBemestar: integer("score_bemestar"),
  scoreOverall: integer("score_overall"),
  riskBand: text("risk_band"), // low | medium | high
  flags: text("flags"), // CSV de qIds que dispararam alerta
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  submittedAt: timestamp("submitted_at").$defaultFn(() => new Date()),
});
