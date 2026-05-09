/**
 * Templates de email — light minimal.
 * HTML inline (sem MJML) — leve, simples, compatível com Outlook/Gmail.
 */

const BRAND = "Kavuka Experts";
const ACCENT = "#ff6a00";

function shellHtml(opts: { title: string; preheader?: string; bodyHtml: string }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#f4f4f5;">${escapeHtml(opts.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f4f4f5;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="middle">
              <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,${ACCENT},#ffcc00);color:#000;font-weight:900;text-align:center;line-height:36px;font-size:16px;">K</div>
            </td>
            <td valign="middle" style="padding-left:12px;">
              <div style="font-size:14px;font-weight:700;color:#18181b;">${BRAND}</div>
              <div style="font-size:11px;color:#71717a;">portal do candidato</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:32px;">
        ${opts.bodyHtml}
      </td></tr>
      <tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;font-size:11px;color:#71717a;text-align:center;">
        Você recebeu este email porque tem cadastro no Portal Kavuka Experts.<br>
        Se não foi você, ignore esta mensagem.
      </td></tr>
    </table>
    <div style="font-size:11px;color:#a1a1aa;padding-top:16px;">
      © ${new Date().getFullYear()} ${BRAND} · GUÉP Soluções Corporativas
    </div>
  </td></tr>
</table>
</body>
</html>`;
}

function btn(url: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg,${ACCENT},#ffcc00);border-radius:8px;">
  <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;font-weight:700;font-size:14px;color:#000000;text-decoration:none;">
    ${escapeHtml(label)}
  </a>
</td></tr></table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// === RECOVERY ===
export function recoveryEmail(opts: { name: string; resetUrl: string; expiresInHours: number }) {
  const firstName = opts.name?.split(" ")[0] || "candidato";
  const subject = "Redefinir sua senha — Kavuka Experts";
  const html = shellHtml({
    title: subject,
    preheader: "Use o link abaixo para criar uma nova senha. Expira em " + opts.expiresInHours + "h.",
    bodyHtml: `
      <h1 style="font-size:20px;margin:0 0 16px;color:#18181b;">Olá, ${escapeHtml(firstName)}</h1>
      <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 12px;">
        Recebemos um pedido para redefinir a senha da sua conta no Portal Kavuka Experts.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 8px;">
        Clique no botão abaixo para criar uma nova senha:
      </p>
      ${btn(opts.resetUrl, "Redefinir senha")}
      <p style="font-size:13px;line-height:1.5;color:#71717a;margin:0 0 8px;">
        Este link expira em ${opts.expiresInHours} horas.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#a1a1aa;margin:24px 0 0;word-break:break-all;">
        Se o botão não funcionar, copie e cole no navegador:<br>
        <a href="${escapeHtml(opts.resetUrl)}" style="color:${ACCENT};">${escapeHtml(opts.resetUrl)}</a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:#71717a;margin:24px 0 0;">
        Se você não solicitou, pode ignorar este email — sua senha continua a mesma.
      </p>
    `,
  });
  const text = `Olá, ${firstName}

Recebemos um pedido para redefinir a senha da sua conta no Portal Kavuka Experts.

Use o link abaixo para criar uma nova senha (expira em ${opts.expiresInHours}h):

${opts.resetUrl}

Se você não solicitou, pode ignorar este email.

— Kavuka Experts`;
  return { subject, html, text };
}

// === BOAS-VINDAS / CADASTRO ===
export function welcomeEmail(opts: { name: string; portalUrl: string }) {
  const firstName = opts.name?.split(" ")[0] || "candidato";
  const subject = "Sua conta no Portal Kavuka Experts está pronta";
  const html = shellHtml({
    title: subject,
    preheader: "Acesse seu portal e mantenha seu currículo sempre atualizado.",
    bodyHtml: `
      <h1 style="font-size:20px;margin:0 0 16px;color:#18181b;">Bem-vindo(a), ${escapeHtml(firstName)}</h1>
      <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 12px;">
        Sua conta no Portal Kavuka Experts foi criada. Aqui você mantém seu currículo
        sempre atualizado e participa de processos seletivos com perfil completo.
      </p>
      ${btn(opts.portalUrl, "Acessar meu perfil")}
      <p style="font-size:13px;line-height:1.5;color:#71717a;margin:24px 0 0;">
        Você pode preencher seus dados pessoais, endereço, formação, experiência profissional,
        skills e idiomas. Quanto mais completo, mais relevante.
      </p>
    `,
  });
  const text = `Bem-vindo(a), ${firstName}

Sua conta no Portal Kavuka Experts foi criada.

Acesse: ${opts.portalUrl}

Lá você mantém seu currículo atualizado: dados pessoais, endereço, formação, experiência, skills e idiomas.

— Kavuka Experts`;
  return { subject, html, text };
}
