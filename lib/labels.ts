/**
 * Centraliza todas as traduções de status/categorias para evitar
 * vazamento de siglas em inglês na UI.
 */

export const JOB_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#6b7280" },
  open: { label: "Aberta", color: "#10b981" },
  paused: { label: "Pausada", color: "#f59e0b" },
  closed: { label: "Encerrada", color: "#ef4444" },
};

export const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  applied: { label: "Inscrito", color: "#0ea5e9" },
  screening: { label: "Triagem", color: "#a855f7" },
  assessment: { label: "Em avaliação", color: "#ff6a00" },
  interview: { label: "Entrevista", color: "#f59e0b" },
  practical: { label: "Teste prático", color: "#f59e0b" },
  offer: { label: "Proposta", color: "#10b981" },
  hired: { label: "Contratado", color: "#10b981" },
  rejected: { label: "Encerrado", color: "#6b7280" },
  talent_pool: { label: "Banco de talentos", color: "#a855f7" },
};

export const STAGES_KANBAN: string[] = [
  "applied",
  "screening",
  "assessment",
  "interview",
  "practical",
  "offer",
  "hired",
];

export const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  freelance: "Freelance",
  internship: "Estágio",
};

export const REMOTE_LABEL: Record<string, string> = {
  on_site: "Presencial",
  hybrid: "Híbrido",
  remote: "100% remoto",
};

export const SENIORITY_LABEL: Record<string, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
  lideranca: "Liderança",
};

export const EDUCATION_LABEL: Record<string, string> = {
  medio: "Ensino médio",
  tecnico: "Técnico",
  superior_incompleto: "Superior incompleto",
  superior: "Superior completo",
  pos: "Pós-graduação",
  mestrado: "Mestrado",
  doutorado: "Doutorado",
};
