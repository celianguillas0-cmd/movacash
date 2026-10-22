// Recharge le catalogue d'idées dans la base (sans toucher aux comptes ni aux e-books).
// Usage : npm run seed            -> ajoute les nouvelles idées du catalogue
//         npm run seed -- --reset -> vide puis recharge entièrement le catalogue
import { getDb, seedIdeas } from "../lib/db";

const reset = process.argv.includes("--reset");
const db = getDb();
seedIdeas(db, { reset });
const { n } = db.prepare("SELECT COUNT(*) AS n FROM ideas").get() as { n: number };
console.log(`${n} idées dans la base`);
