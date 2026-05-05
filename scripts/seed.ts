import { nanoid } from "nanoid";
import { db } from "../db";
import { companies, users } from "../db/schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seed Kavuka Experts");

  let company = await db.query.companies.findFirst({
    where: eq(companies.cnpj, "30.063.122/0001-98"),
  });
  if (!company) {
    const id = nanoid();
    await db.insert(companies).values({
      id,
      name: "GUÉP Soluções Corporativas",
      cnpj: "30.063.122/0001-98",
      industry: "tecnologia",
      size: "small",
    });
    company = { id, name: "GUÉP Soluções Corporativas" } as any;
    console.log(`  + empresa: GUÉP (${id})`);
  } else {
    console.log(`  ✓ empresa já existe: ${company.id}`);
  }

  const masterEmail = "rodrigo.sasso@guep.com.br";
  const existing = await db.query.users.findFirst({ where: eq(users.email, masterEmail) });
  if (!existing) {
    const id = nanoid();
    const passwordHash = await hashPassword("kavuka2026");
    await db.insert(users).values({
      id,
      companyId: company!.id,
      email: masterEmail,
      passwordHash,
      name: "Rodrigo Sasso",
      role: "master",
    });
    console.log(`  + usuário master: ${masterEmail} (senha: kavuka2026)`);
  } else {
    console.log(`  ✓ usuário master já existe: ${masterEmail}`);
  }

  console.log("✅ Seed concluído");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
