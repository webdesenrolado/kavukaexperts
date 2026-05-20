/**
 * Migracao: renomeia "Bobo da Corte" -> "O Curinga" nos assessments arquetipos
 * ja concluídos.
 *
 * O label esta congelado em assessments.interpretationJson nos campos:
 *  - dominant_label
 *  - secondary_label
 *  - top3[].label
 *  - narrative (2 ocorrencias possiveis: dominante + combinacao)
 *
 * Como sao todas a string exata "Bobo da Corte", um REPLACE do texto do JSON
 * resolve sem precisar parsear/rewrite.
 *
 * Uso:
 *   npx tsx scripts/rename-bobo-to-curinga.ts
 */

import { sql } from "drizzle-orm";
import { db } from "../db";

async function main() {
  console.log("Procurando assessments arquetipos com 'Bobo da Corte'...");

  const before = await db.execute(sql<{ count: number }>`
    SELECT COUNT(*)::int AS count
    FROM assessments
    WHERE instrument = 'arquetipos'
      AND interpretation_json LIKE '%Bobo da Corte%'
  `);
  const total = (before as unknown as Array<{ count: number }>)[0]?.count ?? 0;
  console.log(`Encontrados: ${total} registro(s)`);

  if (total === 0) {
    console.log("Nada pra migrar.");
    return;
  }

  await db.execute(sql`
    UPDATE assessments
    SET interpretation_json = REPLACE(interpretation_json, 'Bobo da Corte', 'O Curinga')
    WHERE instrument = 'arquetipos'
      AND interpretation_json LIKE '%Bobo da Corte%'
  `);

  console.log(`OK: ${total} assessment(s) migrado(s) para 'O Curinga'.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Falhou:", err);
    process.exit(1);
  });
