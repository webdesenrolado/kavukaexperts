import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { employees, companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

/**
 * Import CSV de colaboradores.
 * Espera um body JSON: { csv: "header\nrow1\nrow2..." }
 * Headers aceitos (case-insensitive, qualquer ordem): nome, email, telefone, cargo, departamento, cpf
 * Header alternativos: name (=nome), phone (=telefone), role (=cargo), department (=departamento)
 */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === "," || c === ";") {
        current.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
      } else field += c;
    }
  }
  if (field || current.length) {
    current.push(field);
    rows.push(current);
  }
  return rows.filter((r) => r.some((v) => v && v.trim()));
}

function normalizeHeader(h: string): string {
  const v = h.trim().toLowerCase();
  if (["nome", "name"].includes(v)) return "name";
  if (["email", "e-mail", "email_corp", "email_corporativo"].includes(v)) return "email";
  if (["telefone", "phone", "celular", "whatsapp"].includes(v)) return "phone";
  if (["cargo", "role", "função", "funcao", "position"].includes(v)) return "role";
  if (["departamento", "department", "área", "area", "setor"].includes(v)) return "department";
  if (["cpf"].includes(v)) return "cpf";
  return "_skip";
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const { csv } = await request.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "CSV inválido" }, { status: 400 });
  }

  const rows = parseCsv(csv.replace(/^﻿/, ""));
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV sem dados" }, { status: 400 });
  }

  const headers = rows[0].map(normalizeHeader);
  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1) {
    return NextResponse.json({ error: "Coluna 'nome' obrigatória" }, { status: 400 });
  }

  // Carrega emails existentes da empresa pra dedup
  const existing = await db
    .select({ email: employees.email })
    .from(employees)
    .where(eq(employees.companyId, id));
  const existingEmails = new Set(
    existing.map((e) => e.email?.toLowerCase()).filter(Boolean) as string[]
  );

  const toInsert: any[] = [];
  let skipped = 0;
  let errors = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (col: string) => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? (row[idx] || "").trim() : "";
    };
    const name = get("name");
    if (!name) {
      errors++;
      continue;
    }
    const email = get("email").toLowerCase();
    if (email && existingEmails.has(email)) {
      skipped++;
      continue;
    }
    if (email) existingEmails.add(email);
    toInsert.push({
      id: nanoid(),
      companyId: id,
      name,
      email: email || null,
      phone: get("phone") || null,
      cpf: get("cpf") || null,
      role: get("role") || null,
      department: get("department") || null,
      active: true,
    });
  }

  if (toInsert.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db.insert(employees).values(toInsert.slice(i, i + BATCH));
    }
  }

  return NextResponse.json({
    inserted: toInsert.length,
    skipped,
    errors,
    total: rows.length - 1,
  });
}
