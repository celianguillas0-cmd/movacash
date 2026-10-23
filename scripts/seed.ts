// Recharge le catalogue d'idées dans la base (sans toucher aux comptes ni aux e-books).
// Usage : npm run seed            -> ajoute les nouvelles idées du catalogue
//         npm run seed -- --reset -> vide puis recharge entièrement le catalogue
// Avec TURSO_DATABASE_URL et TURSO_AUTH_TOKEN définis, agit sur la base Turso.
import { getClient, one, seedIdeas } from "../lib/db";

(async () => {
  await seedIdeas(await getClient(), { reset: process.argv.includes("--reset") });
  const r = await one<{ n: number }>("SELECT COUNT(*) AS n FROM ideas");
  console.log(`${r?.n} idées dans la base`);
})();
