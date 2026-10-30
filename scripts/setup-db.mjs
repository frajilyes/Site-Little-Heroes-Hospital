// Creates the MySQL database, applies the schema, and creates the admin account.
// Usage: npm run db:setup   (reads .env, then .env.local if present)
import { readFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "hopital_enfants",
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  console.error("Invalid DB_NAME (letters, digits, and _ only)");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("\n❌ ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  console.error("   Set the real administrator account in .env before running db:setup.\n");
  process.exit(1);
}

// This one account opens every medical record in the staff area, and the value typed here
// is the one nobody revisits. A placeholder left in the env file is the likeliest way in.
if (ADMIN_PASSWORD.length < 12 || /^(?:admin|password|changeme|secret|test)/i.test(ADMIN_PASSWORD)) {
  console.error("\n❌ ADMIN_PASSWORD is too weak: 12 characters minimum, and not a placeholder.");
  console.error("   Generate one: node -e \"console.log(require('crypto').randomBytes(18).toString('base64url'))\"\n");
  process.exit(1);
}

// Must stay in step with COUT / KEY_LEN in lib/auth.ts. The parameters are written into
// the hash, so raising them later only affects new passwords — old ones keep verifying.
const COUT = { N: 2 ** 16, r: 8, p: 1 };
const MAXMEM = 192 * 1024 * 1024;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { ...COUT, maxmem: MAXMEM }).toString("hex");
  return `scrypt$${COUT.N}$${COUT.r}$${COUT.p}$${salt}$${hash}`;
}

const root = new URL("../database/", import.meta.url);

let conn;
try {
  conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });
} catch (err) {
  console.error(`\n❌ Could not connect to MySQL (${DB_USER}@${DB_HOST}:${DB_PORT}): ${err.message}`);
  console.error("   Check DB_USER / DB_PASSWORD in .env\n");
  process.exit(1);
}

try {
  console.log(`→ Database "${DB_NAME}" on ${DB_HOST}:${DB_PORT}`);
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${DB_NAME}\``);

  console.log("→ Schema…");
  await conn.query(await readFile(new URL("schema.sql", root), "utf8"));

  await conn.execute("INSERT INTO admins (email, nom, password_hash) VALUES (?, ?, ?)", [
    ADMIN_EMAIL,
    "Administrator",
    hashPassword(ADMIN_PASSWORD),
  ]);

  const [[counts]] = await conn.query(
    `SELECT (SELECT COUNT(*) FROM services) services, (SELECT COUNT(*) FROM medecins) medecins,
            (SELECT COUNT(*) FROM activites) activites, (SELECT COUNT(*) FROM patients) patients,
            (SELECT COUNT(*) FROM rendez_vous) rendez_vous`,
  );
  console.log("✅ Database ready:", counts);
  console.log(`   Admin: ${ADMIN_EMAIL}`);
  console.log("   The database contains no data: enter the real departments, doctors, and content.");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
