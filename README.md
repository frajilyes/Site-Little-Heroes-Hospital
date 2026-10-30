# 🧸 Little Heroes Hospital

Complete website for a (fictional) pediatric hospital: a photo-illustrated public institutional site + an administration area, connected to a **local MySQL database**.

**Stack**: Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · Tailwind CSS 4 · Motion · MySQL 8 (`mysql2`) · TypeScript.

## 🚀 Getting started

1. **Configure the database**: copy `.env.example` to `.env` and set your MySQL password (`.env.local` also works and takes precedence; both are git-ignored):

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hopital_enfants
   ```

2. **Set the administrator account** in `.env` (`ADMIN_EMAIL` and `ADMIN_PASSWORD` are required: use a real address, the verification code is sent there; the password must be 12 characters minimum and not a placeholder), then **create the database and tables** (the database is recreated on every run: all data is wiped):

   ```bash
   npm run db:setup
   ```

   On a database already created with an earlier version, prefer the non-destructive migration, which adds the photo columns without wiping the data:

   ```bash
   npm run db:migrate
   ```

   The database is created **empty**: no demo departments, doctors, activities, or news. Real content is entered from the administration area (or directly in the database for departments and doctors, since no creation screen exists for those yet).

3. **Run the site**:

   ```bash
   npm run dev        # development → http://localhost:3000
   npm run build && npm start   # production
   ```

**Administration**: http://localhost:3000/admin — credentials set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` before `db:setup`.

If the staff table is empty (`db:setup` never ran, or it ran without those two variables), the login page offers **Create the first one** instead, at `/admin/inscription`: name, address and password (12 characters minimum), then the usual verification code. That form closes for good as soon as an account exists — there is no open sign-up for the staff area, and further accounts are added in the database.

### Upgrading an existing database
`npm run db:setup` recreates everything and wipes the data, so on a database that is already in use apply the migrations instead:

```bash
mysql -u root -p hopital_enfants < database/migrations/001-admin-audit.sql
mysql -u root -p hopital_enfants < database/migrations/002-renvois-codes-email.sql
```

Until 001 runs, the app works normally but records no audit trail (the failure is caught and logged to the server, never shown to the user).
Until 002 runs, booking and cancellation work but "send a new code" fails, because the column that caps the resends is missing.

## ✨ Features

### Public site
| Page | Content |
|---|---|
| `/` | Photo header, quick-access bar (emergencies, appointments, departments, directions), animated key figures, departments, today's activities, appointment flow, doctors, testimonials, news, donation call-to-action |
| `/services`, `/services/[slug]` | Departments with real-time bed occupancy rate and medical team |
| `/medecins` | Instant search + animated filters (department, availability) |
| `/activites` | Weekly schedule (day, category, age), remaining spots, **registration** in a modal |
| `/rendez-vous` | 4-step wizard, **real-time open time slots**, **validation by a code received via email**, confirmation with reference + recap email |
| `/rendez-vous/suivi` | Track an appointment by reference and **cancel** it (confirmed by a code sent to the booking email) |
| `/actualites` | Articles |
| `/infos-pratiques` | Visiting hours, what to bring, access/directions, accordion FAQ |
| `/espace-enfants` | Memory game (saved record), drawing workshop (PNG export), jokes |
| `/dons` | Projects with progress gauges, latest donations, donation pledge form |
| `/contact` | Contact form |

### Administration (`/admin`, protected)
- **Dashboard**: key indicators, appointments-per-day chart, bed occupancy by department, today's consultations, unread messages
- **Appointments**: filters by status, search, instant status change
- **Patients**: admissions, status (hospitalized / under observation / discharged), highlighted allergies
- **Activities**: creation, publish / hide, upcoming registrations
- **Doctors**: availability for appointment booking
- **Messages**: read / unread, reply by email, deletion
- **News**: publishing and deletion

## 🔒 Robustness & security
- **100% parameterized** queries (no SQL injection possible), server-side validation for every form
- **Double booking impossible**: unique MySQL index on a doctor's active time slot
- **Guaranteed activity capacity**: transaction + `SELECT … FOR UPDATE` lock
- **Email confirmation codes** for families: the appointment is only created once the code is entered (no slot blocked by a fake address), cancellation requires a code sent to the booking address (15 min, 5 attempts, 5 codes/hour per address, 3 resends per request — a resend rewrites the timestamp the hourly cap counts from, so it needs a counter of its own)
- **First account only**: the public registration form (`/admin/inscription`) is open only while the `admins` table is empty, and the check and the insert share one transaction whose read holds the lock — two registrations sent at the same moment cannot both succeed. The new account gets no session: it goes through the same e-mail code as any login, so the address is proven before the first session
- **Two-step verification** at admin login: 6-digit code sent by email (10 min, 5 attempts, resend after 60s, "don't ask again on this device" option for 30 days). SMTP must be configured in `.env` (without SMTP, in dev, the code is printed in the terminal; in production a missing `SMTP_HOST` is a hard error). The "don't ask again" cookie is tied to the password it was granted under, so changing the password makes every remembered browser ask for a code again
- Hashed passwords (**scrypt**, N=2¹⁶, parameters recorded in the hash so the cost can be raised later without locking anyone out), session in an HMAC-signed `httpOnly` cookie (8h)
- Every admin page and Server Action re-checks the session (`requireAdmin`), `proxy.ts` redirects upstream. The check re-reads the account row, so removing a staff member ends their sessions on the next request instead of letting the signed cookie run out its 8 h
- **Strict Content-Security-Policy** on every page: per-request nonce + `strict-dynamic`, no `unsafe-inline` for scripts. Issued by `proxy.ts`, which is why no page is pre-rendered — prerendered HTML carries no nonce and the browser would block its own scripts. `<style>` elements must carry the nonce as well: `unsafe-inline` is confined to style *attributes*, the one place a nonce cannot reach, so injected markup cannot ship a stylesheet of its own
- Plus `Strict-Transport-Security` (production only — remove it if you serve over plain http), `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, COOP/CORP, and `no-store` on `/admin` and `/api`
- **Rate limiting** (`lib/rate-limit.ts`, in memory): login 10/10 min per address and 5/15 min per account, first-account registration 5/15 min per address — checked *before* the password hash, which is deliberately slow; contact 5/15 min, donations and appointments 10/15 min, slot lookups 120/min. Counters are per process: behind several instances the effective limit is multiplied by the instance count
- Login spends the same work whether or not the account exists, so response time does not reveal which staff addresses are registered
- Staff cookies are `SameSite=Strict` and carry the `__Host-` prefix in production, so no sibling domain can overwrite the session
- Every state-changing request must present a matching `Origin` — public forms, staff actions and route handlers alike; Next.js lets a request with no `Origin` header through with a warning, `proxy.ts` does not
- Server Action bodies are capped at 256 kB. Every field in the app is text and the longest legitimate one is a 20 000-character article, so the 1 MB default was three orders of magnitude of free parsing work for an unauthenticated caller
- **Audit trail** (`admin_audit`): every staff write and every login outcome is recorded with the actor, the target and the address. Append-only, and deliberately has no foreign key so the trail outlives a deleted account

### Database privileges
`scripts/setup-db.mjs` needs rights to create a database, but the running app only ever reads and writes rows. Give it its own account rather than reusing `root` — `database/app-user.sql` creates one:

```bash
# set the password inside the file first, then:
mysql -u root -p < database/app-user.sql
```

Then point `DB_USER` / `DB_PASSWORD` at that account. With `SELECT, INSERT, UPDATE, DELETE` on a single schema and nothing else, neither a leaked `.env` nor a SQL flaw introduced later can drop the schema, read another database, or reach the server itself.

### Before you deploy
- [ ] `SESSION_SECRET` is at least 32 characters and generated rather than typed — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. It signs the staff session, both families of confirmation code, and the trusted-device cookie: one key, so a weak one forges all of them
- [ ] `ADMIN_PASSWORD` is not the placeholder from the first setup. `db:setup` now refuses anything under 12 characters, but an account created before that keeps the password it was given
- [ ] The app connects as the least-privileged user above, not `root`
- [ ] Served over https, with `SITE_URL` set to the public https address — the `__Host-` cookie prefix and HSTS both require it
- [ ] The reverse proxy *overwrites* `X-Forwarded-For` instead of appending to it. The rate limiter reads that header, and a client-supplied value is a client-chosen identity
- [ ] `.env` sits on the server, outside any synced or shared folder, and stays uncommitted (it is git-ignored). Rotate `SESSION_SECRET`, the database password and the SMTP password if it has ever been somewhere else
- [ ] Deploys run `npm ci`, so the pinned `package-lock.json` is what gets installed
- [ ] Behind more than one instance: set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to the same value everywhere, and move the rate-limit counters to a shared store — in memory they count per process, so the effective limit multiplies by the instance count

## ⚡ Performance
- Shared MySQL connection pool, parallelized queries, per-request deduplication (`React.cache`)
- Every page is rendered per request: the strict CSP needs a per-request nonce, which rules out pre-rendering. The pages that used to be static (`/contact`, `/espace-enfants`, `/infos-pratiques`, 404) make no database call, so their render is pure CPU
- Header animations in pure CSS (instant display)
- Motion loaded via `LazyMotion`, icons imported individually, self-hosted fonts (Plus Jakarta Sans + Inter)
- Photos served by `next/image` (AVIF/WebP, responsive sizes) from Unsplash — see `lib/images.ts` and `images.remotePatterns` in `next.config.ts`
- Respects the system's "reduce motion" setting, keyboard navigation, contrast, and ARIA labels

## 📁 Structure
```
app/(site)/        public pages             app/admin/        administration
app/actions/       Server Actions           app/api/creneaux  open time slots (JSON)
components/        site / admin / ui        lib/              db, queries, auth, validation
database/          schema.sql               scripts/          setup-db.mjs, migrate-photos.mjs
```
