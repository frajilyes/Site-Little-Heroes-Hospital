# 🧸 Hôpital des Petits Héros

Site complet d'un hôpital pédiatrique (fictif) : site public animé + espace d'administration, relié à une base **MySQL locale**.

**Stack** : Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · Tailwind CSS 4 · Motion · MySQL 8 (`mysql2`) · TypeScript.

## 🚀 Démarrage

1. **Configurer la base** : copiez `.env.example` en `.env.local` (déjà présent) et renseignez votre mot de passe MySQL :

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=hopital_enfants
   ```

2. **Créer la base, les tables et les données de démo** (la base est recréée à chaque exécution) :

   ```bash
   npm run db:setup
   ```

3. **Lancer le site** :

   ```bash
   npm run dev        # développement → http://localhost:3000
   npm run build && npm start   # production
   ```

**Administration** : http://localhost:3000/admin — `admin@petitsheros.fr` / `Admin123!`
(modifiable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` avant `db:setup`).

## ✨ Fonctionnalités

### Site public
| Page | Contenu |
|---|---|
| `/` | Hero animé (illustration SVG, ballons, nuages), compteurs animés, 8 services, activités du jour, parcours RDV, médecins, témoignages défilants, actualités, appel au don |
| `/services`, `/services/[slug]` | Services avec taux d'occupation des lits en temps réel et équipe médicale |
| `/medecins` | Recherche instantanée + filtres animés (service, disponibilité) |
| `/activites` | Planning hebdomadaire (jour, catégorie, âge), places restantes, **inscription** en modale |
| `/rendez-vous` | Assistant en 4 étapes, **créneaux libres en temps réel**, **validation par code reçu par e-mail**, confirmation avec référence + confettis + e-mail récapitulatif |
| `/rendez-vous/suivi` | Suivi d'un RDV par référence et **annulation** (confirmée par un code envoyé à l'e-mail de réservation) |
| `/actualites` | Articles |
| `/infos-pratiques` | Horaires de visite, valise, accès, FAQ en accordéon |
| `/espace-enfants` | Jeu de Memory (record sauvegardé), atelier dessin (export PNG), blagues |
| `/dons` | Projets avec jauges de progression, derniers dons, formulaire de promesse de don |
| `/contact` | Formulaire de contact |

### Administration (`/admin`, protégée)
- **Tableau de bord** : indicateurs clés, graphique des RDV par jour, occupation des lits par service, consultations du jour, messages non lus
- **Rendez-vous** : filtres par statut, recherche, changement de statut instantané
- **Patients** : admissions, statut (hospitalisé / observation / sortie), allergies mises en évidence
- **Activités** : création, publication / masquage, inscriptions à venir
- **Médecins** : disponibilité pour la prise de RDV
- **Messages** : lu / non lu, réponse par e-mail, suppression
- **Actualités** : publication et suppression

## 🔒 Robustesse & sécurité
- Requêtes **100 % paramétrées** (aucune injection SQL possible), validation serveur de chaque formulaire
- **Double réservation impossible** : index unique MySQL sur le créneau actif d'un médecin
- **Capacité des activités garantie** : transaction + verrou `SELECT … FOR UPDATE`
- **Codes de confirmation par e-mail** pour les familles : le RDV n'est créé qu'après saisie du code (aucun créneau bloqué par une fausse adresse), l'annulation exige un code envoyé à l'adresse de réservation (15 min, 5 essais, 5 codes/heure par adresse)
- **Validation en deux étapes** à la connexion admin : code à 6 chiffres envoyé par e-mail (10 min, 5 essais, renvoi après 60 s, option « ne plus demander sur cet appareil » 30 jours). SMTP à configurer dans `.env.local` (sans SMTP, en dev, le code s'affiche dans le terminal)
- Mots de passe hachés (**scrypt**), session dans un cookie `httpOnly` signé HMAC (8 h)
- Chaque page et Server Action d'admin revérifie la session (`requireAdmin`), `proxy.ts` redirige en amont

## ⚡ Performance
- Pool de connexions MySQL partagé, requêtes parallélisées, déduplication par requête (`React.cache`)
- Pages sans données pré-rendues en statique ; animations du hero en CSS pur (affichage immédiat)
- Motion chargé en `LazyMotion`, icônes importées à l'unité, polices auto-hébergées (aucun appel externe)
- Respect de « réduire les animations » du système, navigation clavier, contrastes et libellés ARIA

## 📁 Structure
```
app/(site)/        pages publiques          app/admin/        administration
app/actions/       Server Actions           app/api/creneaux  créneaux libres (JSON)
components/        site / admin / ui        lib/              db, requêtes, auth, validation
database/          schema.sql + seed.sql    scripts/setup-db.mjs
```
