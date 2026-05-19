/**
 * Helper para apresentar links sociais/profissionais de forma legível.
 * Converte URLs longas e cheias de tracking em textos amigáveis tipo "Ver perfil no LinkedIn".
 */

export type SocialKind =
  | "linkedin"
  | "github"
  | "gitlab"
  | "bitbucket"
  | "instagram"
  | "twitter"
  | "x"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "behance"
  | "dribbble"
  | "medium"
  | "substack"
  | "stackoverflow"
  | "kaggle"
  | "huggingface"
  | "spotify"
  | "soundcloud"
  | "vimeo"
  | "portfolio"
  | "site"
  | "link";

interface SocialMeta {
  kind: SocialKind;
  label: string;
  /** Color hexa do brand (pra usar em UI quando útil) */
  color: string;
  /** Host limpo (sem www) — fallback de exibição */
  host: string;
}

const PATTERNS: { test: RegExp; kind: SocialKind; label: string; color: string }[] = [
  { test: /linkedin\.com/i, kind: "linkedin", label: "Ver perfil no LinkedIn", color: "#0a66c2" },
  { test: /github\.com/i, kind: "github", label: "Ver perfil no GitHub", color: "#181717" },
  { test: /gitlab\.com/i, kind: "gitlab", label: "Ver perfil no GitLab", color: "#fc6d26" },
  { test: /bitbucket\.(org|com)/i, kind: "bitbucket", label: "Ver perfil no Bitbucket", color: "#2684ff" },
  { test: /instagram\.com/i, kind: "instagram", label: "Ver perfil no Instagram", color: "#e4405f" },
  { test: /(?:^|\.)x\.com/i, kind: "x", label: "Ver perfil no X (Twitter)", color: "#000000" },
  { test: /twitter\.com/i, kind: "twitter", label: "Ver perfil no Twitter", color: "#1da1f2" },
  { test: /facebook\.com/i, kind: "facebook", label: "Ver perfil no Facebook", color: "#1877f2" },
  { test: /tiktok\.com/i, kind: "tiktok", label: "Ver perfil no TikTok", color: "#000000" },
  { test: /youtube\.com|youtu\.be/i, kind: "youtube", label: "Ver canal no YouTube", color: "#ff0000" },
  { test: /behance\.net/i, kind: "behance", label: "Ver portfólio no Behance", color: "#1769ff" },
  { test: /dribbble\.com/i, kind: "dribbble", label: "Ver portfólio no Dribbble", color: "#ea4c89" },
  { test: /medium\.com/i, kind: "medium", label: "Ver perfil no Medium", color: "#000000" },
  { test: /substack\.com/i, kind: "substack", label: "Ver newsletter no Substack", color: "#ff6719" },
  { test: /stackoverflow\.com/i, kind: "stackoverflow", label: "Ver perfil no Stack Overflow", color: "#f48024" },
  { test: /kaggle\.com/i, kind: "kaggle", label: "Ver perfil no Kaggle", color: "#20beff" },
  { test: /huggingface\.co/i, kind: "huggingface", label: "Ver perfil no Hugging Face", color: "#ffd21e" },
  { test: /spotify\.com/i, kind: "spotify", label: "Ouvir no Spotify", color: "#1db954" },
  { test: /soundcloud\.com/i, kind: "soundcloud", label: "Ouvir no SoundCloud", color: "#ff5500" },
  { test: /vimeo\.com/i, kind: "vimeo", label: "Assistir no Vimeo", color: "#1ab7ea" },
];

export function socialMeta(url: string | null | undefined): SocialMeta | null {
  if (!url) return null;
  const cleaned = url.trim();
  if (!cleaned) return null;

  let host = "";
  try {
    const u = new URL(cleaned.startsWith("http") ? cleaned : `https://${cleaned}`);
    host = u.host.replace(/^www\./, "");
  } catch {
    host = cleaned.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
  }

  for (const p of PATTERNS) {
    if (p.test.test(cleaned)) {
      return { kind: p.kind, label: p.label, color: p.color, host };
    }
  }

  // Fallback: site genérico
  return { kind: "site", label: "Visitar site", color: "#6b7280", host };
}

/**
 * Normaliza URL pra ter https:// no início.
 */
export function ensureHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
