/**
 * Seed da Inbox Omnichannel — cria 4 canais + 10 conversas mockadas com mensagens.
 * Mistura conversas linkadas a candidatos existentes + leads brutos (sem candidatura).
 * Idempotente via IDs determinísticos.
 */

import { db } from "../db";
import { companies, channels, conversations, messages } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

// IDs deterministicos dos canais demo. Idempotente: o seed so apaga estes 4
// — canais reais que o gestor tenha adicionado via /settings/integracoes ficam intactos.
const DEMO_CHANNEL_IDS = [
  "ch-whatsapp-guep",
  "ch-email-guep",
  "ch-instagram-guep",
  "ch-linkedin-guep",
];

async function main() {
  console.log("🌱 Seed Inbox Omnichannel");

  const guep = await db.query.companies.findFirst({
    where: eq(companies.cnpj, "30.063.122/0001-98"),
  });
  if (!guep) {
    console.error("❌ GUÉP não encontrada — rode `npm run seed` primeiro.");
    process.exit(1);
  }

  // Limpa SO os canais demo anteriores (mantem canais reais conectados pelo gestor).
  const existingDemo = await db
    .select()
    .from(channels)
    .where(inArray(channels.id, DEMO_CHANNEL_IDS));
  for (const ch of existingDemo) {
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.channelId, ch.id));
    for (const cv of convs) {
      await db.delete(messages).where(eq(messages.conversationId, cv.id));
    }
    await db.delete(conversations).where(eq(conversations.channelId, ch.id));
  }
  await db.delete(channels).where(inArray(channels.id, DEMO_CHANNEL_IDS));

  // 1. Canais — connected:false pra Baileys nao bootar QR real e IMAP nao tentar conectar.
  // Visualmente aparecem na sidebar do inbox como qualquer canal, com icone e contagem.
  const CHANNELS = [
    { id: "ch-whatsapp-guep", kind: "whatsapp", displayName: "WhatsApp Recrutamento", identifier: "+55 11 99999-1234" },
    { id: "ch-email-guep", kind: "email", displayName: "carreiras@guep.com.br", identifier: "carreiras@guep.com.br" },
    { id: "ch-instagram-guep", kind: "instagram", displayName: "@guepoficial", identifier: "@guepoficial" },
    { id: "ch-linkedin-guep", kind: "linkedin", displayName: "Guep Soluções Corporativas", identifier: "linkedin.com/company/guep" },
  ];

  for (const ch of CHANNELS) {
    await db.insert(channels).values({
      ...ch,
      companyId: guep.id,
      connected: false,
    });
  }
  console.log(`✓ ${CHANNELS.length} canais demo criados (connected:false — drivers nao bootam)`);

  // 2. Conversas + mensagens
  const now = Date.now();
  const min = (m: number) => new Date(now - m * 60_000);
  const hr = (h: number) => new Date(now - h * 3_600_000);
  const day = (d: number) => new Date(now - d * 86_400_000);

  interface ConvSpec {
    id: string;
    channelId: string;
    contactName: string;
    contactHandle: string;
    contactAvatarUrl?: string;
    candidateId?: string;
    jobId?: string;
    status?: string;
    tags?: string[];
    unreadCount?: number;
    messages: Array<{ direction: "inbound" | "outbound" | "system"; body: string; sentAt: Date }>;
  }

  const CONVERSATIONS: ConvSpec[] = [
    {
      id: "conv-bruno-whats",
      channelId: "ch-whatsapp-guep",
      contactName: "Bruno Oliveira",
      contactHandle: "+55 11 99876-5432",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Bruno+Oliveira&backgroundColor=0ea5e9",
      candidateId: "demo-cand-bruno",
      jobId: "demo-job-vendedor-techstore",
      tags: ["aplicou-vaga", "interessado"],
      unreadCount: 2,
      messages: [
        { direction: "inbound", body: "Boa tarde! Vi a vaga de vendedor de tech no LinkedIn, posso aplicar?", sentAt: hr(2) },
        { direction: "outbound", body: "Olá Bruno! Pode sim, me manda seu currículo aqui ou pelo nosso portal carreiras.guep.com.br/atendente-loja-senior", sentAt: hr(1.8) },
        { direction: "inbound", body: "Show, vou aplicar pelo portal! Já tinha visto a vaga lá.", sentAt: hr(1.5) },
        { direction: "inbound", body: "Aplicação enviada agora. Pode confirmar que recebeu?", sentAt: min(15) },
      ],
    },
    {
      id: "conv-fernanda-whats",
      channelId: "ch-whatsapp-guep",
      contactName: "Fernanda Lopes",
      contactHandle: "+55 11 98765-1010",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Fernanda+Lopes&backgroundColor=10b981",
      candidateId: "demo-cand-fernanda",
      jobId: "demo-job-vendedor-techstore",
      tags: ["aplicou-vaga"],
      unreadCount: 1,
      messages: [
        { direction: "inbound", body: "Oi! Sou Fernanda, fiz minha inscrição pra vaga de vendedora", sentAt: hr(5) },
        { direction: "outbound", body: "Olá Fernanda, recebemos sua inscrição! Pode esperar nosso retorno em até 3 dias úteis.", sentAt: hr(4.5) },
        { direction: "inbound", body: "Ótimo, obrigada! Tenho mais alguma documentação que devo enviar?", sentAt: min(45) },
      ],
    },
    {
      id: "conv-juliana-email",
      channelId: "ch-email-guep",
      contactName: "Juliana Castro",
      contactHandle: "juliana.castro@email.com",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Juliana+Castro&backgroundColor=ff6a00",
      candidateId: "demo-cand-juliana",
      jobId: "demo-job-cs-saude",
      tags: ["entrevista-marcada", "high-fit"],
      unreadCount: 0,
      messages: [
        { direction: "inbound", body: "Prezados,\n\nSegue meu currículo conforme solicitado pela vaga de CS — saúde. Estou disponível para entrevista a partir da próxima semana.\n\nAtenciosamente,\nJuliana Castro", sentAt: day(2) },
        { direction: "outbound", body: "Oi Juliana, perfeito! Podemos marcar uma entrevista virtual quinta-feira às 15h?", sentAt: day(2) },
        { direction: "inbound", body: "Combinado, pode mandar o link!", sentAt: day(1) },
        { direction: "outbound", body: "Link da reunião: meet.google.com/abc-defg-hij. Te envio um lembrete na quarta.", sentAt: day(1) },
      ],
    },
    {
      id: "conv-pedro-ig",
      channelId: "ch-instagram-guep",
      contactName: "Pedro Henrique",
      contactHandle: "@pedrohrocks",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Pedro+Henrique&backgroundColor=a855f7",
      tags: ["lead-bruto"],
      unreadCount: 3,
      messages: [
        { direction: "inbound", body: "Eaee, vcs tem vaga aberta de atendimento? 👀", sentAt: hr(3) },
        { direction: "inbound", body: "Tenho 3 anos de exp em loja, falo inglês intermediário", sentAt: hr(3) },
        { direction: "inbound", body: "Onde fica a sede?", sentAt: hr(2) },
      ],
    },
    {
      id: "conv-marcia-ig",
      channelId: "ch-instagram-guep",
      contactName: "Márcia Oliveira",
      contactHandle: "@marciaoli",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Marcia+Oliveira&backgroundColor=f59e0b",
      tags: ["lead-bruto", "indicacao"],
      unreadCount: 1,
      messages: [
        { direction: "inbound", body: "Oi! Vi o post de vocês sobre a vaga de coordenador. Tenho experiência forte em logística (7 anos). Como faço pra aplicar?", sentAt: hr(8) },
      ],
    },
    {
      id: "conv-marcelo-linkedin",
      channelId: "ch-linkedin-guep",
      contactName: "Marcelo Tavares",
      contactHandle: "linkedin.com/in/marcelo-tavares-log",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Marcelo+Tavares&backgroundColor=0ea5e9",
      candidateId: "demo-cand-marcelo",
      jobId: "demo-job-coord-logistica",
      tags: ["proposta-enviada", "high-fit"],
      unreadCount: 0,
      messages: [
        { direction: "inbound", body: "Olá! Vi a vaga de Coordenador de Logística. Tenho 9 anos na área (DHL, Mercado Livre). Posso enviar meu CV?", sentAt: day(4) },
        { direction: "outbound", body: "Olá Marcelo, com certeza! Já tenho seu perfil aqui no LinkedIn. Aplicou pelo portal?", sentAt: day(4) },
        { direction: "inbound", body: "Acabei de aplicar. Disponível pra conversar essa semana.", sentAt: day(3) },
        { direction: "outbound", body: "Perfeito. Acabei de enviar a proposta no email. Aguardo seu retorno.", sentAt: hr(20) },
      ],
    },
    {
      id: "conv-camila-linkedin",
      channelId: "ch-linkedin-guep",
      contactName: "Camila Ferreira",
      contactHandle: "linkedin.com/in/camila-ferreira",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Camila+Ferreira&backgroundColor=10b981",
      candidateId: "demo-cand-camila",
      jobId: "demo-job-atendente-senior",
      tags: ["entrevista-marcada"],
      unreadCount: 1,
      messages: [
        { direction: "inbound", body: "Oi! Tenho interesse na vaga de Atendente Sênior. Sou de Osasco e trabalho em rede comercial há 7 anos.", sentAt: day(3) },
        { direction: "outbound", body: "Camila, ótimo perfil! Seu Score Humano deu 81 — vamos marcar uma entrevista?", sentAt: day(2) },
        { direction: "inbound", body: "Claro! Disponível terça e quinta de manhã.", sentAt: hr(6) },
      ],
    },
    {
      id: "conv-thais-whats",
      channelId: "ch-whatsapp-guep",
      contactName: "Thais Andrade",
      contactHandle: "+55 11 91111-2233",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Thais+Andrade&backgroundColor=ff6a00",
      candidateId: "demo-cand-thais",
      jobId: "demo-job-recepcionista",
      tags: ["high-fit"],
      unreadCount: 0,
      messages: [
        { direction: "inbound", body: "Boa tarde! Vi a vaga de recepcionista bilíngue, tenho experiência no Hospital Albert Einstein", sentAt: day(1) },
        { direction: "outbound", body: "Olá Thais! Excelente experiência. Pode aplicar pelo nosso portal carreiras.guep.com.br?", sentAt: day(1) },
        { direction: "inbound", body: "Já apliquei! 🙌", sentAt: hr(18) },
        { direction: "outbound", body: "Perfeito. Te enviei a avaliação Kavuka — leva uns 30 minutos. Recebeu?", sentAt: hr(6) },
        { direction: "inbound", body: "Recebi sim, vou fazer ainda hoje à noite!", sentAt: hr(5) },
      ],
    },
    {
      id: "conv-spam-email",
      channelId: "ch-email-guep",
      contactName: "Marketing Cursos",
      contactHandle: "promocao@cursosonline.xyz",
      tags: ["spam"],
      status: "spam",
      unreadCount: 0,
      messages: [
        { direction: "inbound", body: "Aprenda recrutamento em 7 dias com 80% OFF! Promoção exclusiva...", sentAt: day(2) },
      ],
    },
    {
      id: "conv-amanda-linkedin",
      channelId: "ch-linkedin-guep",
      contactName: "Amanda Dias",
      contactHandle: "linkedin.com/in/amanda-dias",
      contactAvatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Amanda+Dias&backgroundColor=a855f7",
      candidateId: "demo-cand-amanda",
      jobId: "demo-job-analista-dados",
      tags: ["em-avaliacao"],
      unreadCount: 0,
      messages: [
        { direction: "inbound", body: "Boa tarde! Tenho interesse na vaga de Analista de Dados Júnior. Trabalho na B3 atualmente.", sentAt: day(2) },
        { direction: "outbound", body: "Olá Amanda! Recebi seu currículo. Acabei de te mandar a avaliação Kavuka pelo email.", sentAt: day(2) },
        { direction: "inbound", body: "Vi! Vou responder ainda hoje, obrigada.", sentAt: day(1) },
      ],
    },
  ];

  for (const conv of CONVERSATIONS) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    await db.insert(conversations).values({
      id: conv.id,
      companyId: guep.id,
      channelId: conv.channelId,
      contactName: conv.contactName,
      contactHandle: conv.contactHandle,
      contactAvatarUrl: conv.contactAvatarUrl,
      candidateId: conv.candidateId,
      jobId: conv.jobId,
      status: conv.status ?? "open",
      tags: JSON.stringify(conv.tags ?? []),
      lastMessageAt: lastMsg.sentAt,
      lastMessagePreview: lastMsg.body.slice(0, 120),
      unreadCount: conv.unreadCount ?? 0,
    });

    for (const m of conv.messages) {
      await db.insert(messages).values({
        id: nanoid(),
        conversationId: conv.id,
        direction: m.direction,
        bodyText: m.body,
        sentAt: m.sentAt,
        readAt: m.direction === "outbound" ? m.sentAt : null,
      });
    }
  }
  console.log(`✓ ${CONVERSATIONS.length} conversas + mensagens criadas`);

  const totalUnread = CONVERSATIONS.reduce((a, c) => a + (c.unreadCount ?? 0), 0);
  console.log(`✓ ${totalUnread} mensagens não lidas no total`);

  console.log("\n✅ Inbox seed concluído");
  console.log("👉 /inbox — abre a Inbox Omnichannel\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
