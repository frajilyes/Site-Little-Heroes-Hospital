// "Photographic design" migration for an existing database: replaces
// decorative emojis with real photographs, without touching the data.
// A fresh database does not need this (schema.sql is already up to date).
//
// Usage: npm run db:migrate   (reads .env, then .env.local if present)
import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "hopital_enfants",
} = process.env;

/** Department photo, by slug (see lib/images.ts). */
const PHOTOS_SERVICES = {
  urgences: "photo-1516549655169-df83a0774514",
  neonatologie: "photo-1522771930-78848d9293e8",
  cardiologie: "photo-1505751172876-fa1923c5c528",
  chirurgie: "photo-1550831107-1553da8c8464",
  "hemato-oncologie": "photo-1579684385127-1ef15d508118",
  neurologie: "photo-1559757148-5c350d0d3c56",
  pneumologie: "photo-1584820927498-cfe5211fd8bf",
  pedopsychiatrie: "photo-1559839734-2b71ea197ec2",
};

let conn;
try {
  conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
} catch (err) {
  console.error(`\n❌ Could not connect to MySQL (${DB_USER}@${DB_HOST}:${DB_PORT}): ${err.message}\n`);
  process.exit(1);
}

async function colonneExiste(table, colonne) {
  const [rows] = await conn.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_NAME, table, colonne],
  );
  return rows.length > 0;
}

async function ajouter(table, colonne, definition) {
  if (await colonneExiste(table, colonne)) return console.log(`   ${table}.${colonne}: already present`);
  await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
  console.log(`   ${table}.${colonne}: added`);
}

async function supprimer(table, colonne) {
  if (!(await colonneExiste(table, colonne))) return console.log(`   ${table}.${colonne}: already removed`);
  await conn.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${colonne}\``);
  console.log(`   ${table}.${colonne}: removed`);
}

try {
  console.log(`→ Database "${DB_NAME}" on ${DB_HOST}:${DB_PORT}`);

  console.log("→ Photo columns…");
  await ajouter("services", "photo", "photo VARCHAR(255) NULL AFTER icone");
  await ajouter("medecins", "photo", "photo VARCHAR(255) NULL AFTER langues");
  await ajouter("actualites", "image", "image VARCHAR(255) NULL AFTER categorie");

  console.log("→ Department photos…");
  let n = 0;
  for (const [slug, photo] of Object.entries(PHOTOS_SERVICES)) {
    const [res] = await conn.execute(
      "UPDATE services SET photo = ? WHERE slug = ? AND (photo IS NULL OR photo = '')",
      [photo, slug],
    );
    n += res.affectedRows;
  }
  console.log(`   ${n} department(s) illustrated`);

  // Emojis are no longer used: missing portraits and illustrations
  // are computed on the application side (lib/images.ts).
  console.log("→ Obsolete emoji columns…");
  await supprimer("medecins", "avatar");
  await supprimer("actualites", "emoji");
  await supprimer("temoignages", "avatar");

  console.log("✅ Migration complete.");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
