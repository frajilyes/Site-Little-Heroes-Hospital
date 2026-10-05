// Crée la base MySQL, applique le schéma, insère les données de démo et le compte admin.
// Usage : npm run db:setup   (lit .env.local)
import { readFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "hopital_enfants",
  ADMIN_EMAIL = "admin@petitsheros.fr",
  ADMIN_PASSWORD = "Admin123!",
} = process.env;

if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  console.error("DB_NAME invalide (lettres, chiffres et _ uniquement)");
  process.exit(1);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
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
  console.error(`\n❌ Connexion MySQL impossible (${DB_USER}@${DB_HOST}:${DB_PORT}) : ${err.message}`);
  console.error("   Vérifiez DB_USER / DB_PASSWORD dans .env.local\n");
  process.exit(1);
}

try {
  console.log(`→ Base « ${DB_NAME} » sur ${DB_HOST}:${DB_PORT}`);
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${DB_NAME}\``);

  console.log("→ Schéma…");
  await conn.query(await readFile(new URL("schema.sql", root), "utf8"));

  console.log("→ Données de démonstration…");
  await conn.query(await readFile(new URL("seed.sql", root), "utf8"));

  await conn.execute("INSERT INTO admins (email, nom, password_hash) VALUES (?, ?, ?)", [
    ADMIN_EMAIL,
    "Administrateur",
    hashPassword(ADMIN_PASSWORD),
  ]);

  const [[counts]] = await conn.query(
    `SELECT (SELECT COUNT(*) FROM services) services, (SELECT COUNT(*) FROM medecins) medecins,
            (SELECT COUNT(*) FROM activites) activites, (SELECT COUNT(*) FROM patients) patients,
            (SELECT COUNT(*) FROM rendez_vous) rendez_vous`,
  );
  console.log("✅ Base prête :", counts);
  console.log(`   Admin : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD === "Admin123!" ? "Admin123!" : "(ADMIN_PASSWORD)"}`);
} catch (err) {
  console.error("❌ Erreur :", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
