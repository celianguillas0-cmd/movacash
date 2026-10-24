// Recharge le catalogue d'idées dans la base (sans toucher aux comptes ni aux e-books).
// Usage : npm run seed            -> ajoute les nouvelles idées du catalogue
//         npm run seed -- --reset -> vide puis recharge entièrement le catalogue
// Avec DATABASE_URL défini, agit sur la base Neon.
import { one, seedIdeas } from "../lib/db";

(async () => {
  await seedIdeas(undefined, { reset: process.argv.includes("--reset") });
  const r = await one<{ n: number }>("SELECT COUNT(*) AS n FROM ideas");
  console.log(`${r?.n} idées dans la base`);
})();
