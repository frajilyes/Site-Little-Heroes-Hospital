import "server-only";
import mysql, { type Pool, type PoolConnection, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import { connection } from "next/server";

// Un seul pool partagé, conservé entre les rechargements à chaud en dev.
const globalForDb = globalThis as unknown as { __mysqlPool?: Pool };

function getPool(): Pool {
  if (!globalForDb.__mysqlPool) {
    globalForDb.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "hopital_enfants",
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60_000,
      enableKeepAlive: true,
      charset: "utf8mb4",
      dateStrings: true, // dates renvoyées en "YYYY-MM-DD" : sérialisables et sans décalage de fuseau
      decimalNumbers: true,
    });
  }
  return globalForDb.__mysqlPool;
}

type Param = string | number | boolean | null;

/** SELECT — marque la route comme dynamique (données toujours fraîches). */
export async function query<T>(sql: string, params: Param[] = []): Promise<T[]> {
  await connection();
  const [rows] = await getPool().execute<RowDataPacket[]>(sql, params);
  return rows as T[];
}

export async function queryOne<T>(sql: string, params: Param[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT / UPDATE / DELETE — utilisé depuis les Server Actions. */
export async function execute(sql: string, params: Param[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

export function isDuplicateError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "ER_DUP_ENTRY";
}

/** Exécute `fn` dans une transaction (verrouillage, cohérence des places restantes…). */
export async function transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
