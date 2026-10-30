-- =====================================================================
--  Least-privilege MySQL account for the running app
--
--  The app connects as DB_USER on every request. As root (or any account with DDL and
--  server-wide rights) that connection is a much bigger prize than it needs to be: one
--  leaked .env, one SQL flaw introduced later, and the holder can read every schema on
--  the server, write files through the FILE privilege, or drop the database outright.
--
--  Nothing in the app issues DDL. It only reads and writes rows in its own schema —
--  `npm run db:setup` is the one thing that creates tables, and that is run by hand, as
--  an administrator, not by the server. So the running app gets four privileges, scoped
--  to one database, and nothing else.
--
--  Apply as an administrator, then point DB_USER / DB_PASSWORD at this account:
--      mysql -u root -p < database/app-user.sql
-- =====================================================================

-- Replace the password before running this. Generate one, don't invent one:
--     node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
CREATE USER IF NOT EXISTS 'hopital_app'@'127.0.0.1' IDENTIFIED BY 'REPLACE-WITH-A-GENERATED-PASSWORD';

-- 127.0.0.1, not '%': the account is usable from the machine that runs the app and
-- nowhere else, so the password alone is not enough from across the network.
GRANT SELECT, INSERT, UPDATE, DELETE ON `hopital_enfants`.* TO 'hopital_app'@'127.0.0.1';

-- No CREATE, DROP, ALTER, INDEX, REFERENCES, FILE, PROCESS, SUPER or GRANT OPTION, and
-- no access to mysql.* or any other schema. A compromised app cannot change the shape of
-- the database, read other tenants, or look at the server itself.

-- If the database is on another host, serve it over TLS and require it here instead:
--     ALTER USER 'hopital_app'@'%' REQUIRE SSL;

FLUSH PRIVILEGES;

-- Check what was granted:
--     SHOW GRANTS FOR 'hopital_app'@'127.0.0.1';
