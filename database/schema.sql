-- =====================================================================
--  Little Heroes Hospital — MySQL 8 schema
--  Run by `npm run db:setup` (creates the database if needed)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS inscriptions_activites;
DROP TABLE IF EXISTS rendez_vous;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS activites;
DROP TABLE IF EXISTS medecins;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS actualites;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS dons;
DROP TABLE IF EXISTS temoignages;
DROP TABLE IF EXISTS codes_email;
DROP TABLE IF EXISTS admin_codes;
DROP TABLE IF EXISTS admin_audit;
DROP TABLE IF EXISTS admins;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE services (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(60)  NOT NULL UNIQUE,
  nom           VARCHAR(120) NOT NULL,
  accroche      VARCHAR(255) NOT NULL,
  description   TEXT         NOT NULL,
  icone         VARCHAR(40)  NOT NULL,
  photo         VARCHAR(255) NULL COMMENT 'Unsplash id, full URL, or local file',
  couleur       VARCHAR(20)  NOT NULL,
  etage         VARCHAR(40)  NOT NULL,
  telephone     VARCHAR(30)  NOT NULL,
  lits_total    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  urgence_24h   TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE medecins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prenom         VARCHAR(60)  NOT NULL,
  nom            VARCHAR(60)  NOT NULL,
  titre          VARCHAR(20)  NOT NULL DEFAULT 'Dr',
  specialite     VARCHAR(120) NOT NULL,
  service_id     INT UNSIGNED NOT NULL,
  bio            TEXT         NOT NULL,
  experience_ans TINYINT UNSIGNED NOT NULL,
  langues        VARCHAR(120) NOT NULL,
  photo          VARCHAR(255) NULL COMMENT 'portrait: Unsplash id, URL, or local file',
  disponible     TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT fk_medecin_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_medecin_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activites (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre       VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  categorie   ENUM('art','musique','jeux','sport','lecture','animaux','clown','science','bien-etre') NOT NULL,
  age_min     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  age_max     TINYINT UNSIGNED NOT NULL DEFAULT 18,
  lieu        VARCHAR(120) NOT NULL,
  jour        TINYINT UNSIGNED NOT NULL COMMENT '1 = Monday … 7 = Sunday',
  heure_debut TIME         NOT NULL,
  heure_fin   TIME         NOT NULL,
  places      SMALLINT UNSIGNED NOT NULL,
  animateur   VARCHAR(120) NOT NULL,
  emoji       VARCHAR(10)  NOT NULL,
  actif       TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_activite_jour (jour, heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inscriptions_activites (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activite_id INT UNSIGNED NOT NULL,
  date_seance DATE         NOT NULL,
  enfant_nom  VARCHAR(120) NOT NULL,
  age         TINYINT UNSIGNED NOT NULL,
  chambre     VARCHAR(20)  NULL,
  parent_nom  VARCHAR(120) NOT NULL,
  telephone   VARCHAR(30)  NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inscr_activite FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE CASCADE,
  INDEX idx_inscr_seance (activite_id, date_seance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prenom             VARCHAR(60)  NOT NULL,
  nom                VARCHAR(60)  NOT NULL,
  date_naissance     DATE         NOT NULL,
  sexe               ENUM('F','M') NOT NULL,
  groupe_sanguin     VARCHAR(4)   NULL,
  allergies          VARCHAR(255) NULL,
  service_id         INT UNSIGNED NOT NULL,
  medecin_id         INT UNSIGNED NULL,
  chambre            VARCHAR(20)  NOT NULL,
  date_admission     DATE         NOT NULL,
  date_sortie_prevue DATE         NULL,
  statut             ENUM('hospitalise','observation','sorti') NOT NULL DEFAULT 'hospitalise',
  parent_nom         VARCHAR(120) NOT NULL,
  parent_tel         VARCHAR(30)  NOT NULL,
  CONSTRAINT fk_patient_service FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT fk_patient_medecin FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE SET NULL,
  INDEX idx_patient_statut (statut, service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rendez_vous (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference   CHAR(8)      NOT NULL UNIQUE,
  enfant_nom  VARCHAR(120) NOT NULL,
  enfant_age  TINYINT UNSIGNED NOT NULL,
  parent_nom  VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  telephone   VARCHAR(30)  NOT NULL,
  service_id  INT UNSIGNED NOT NULL,
  medecin_id  INT UNSIGNED NOT NULL,
  date_rdv    DATE         NOT NULL,
  heure       TIME         NOT NULL,
  motif       VARCHAR(500) NOT NULL,
  statut      ENUM('en_attente','confirme','annule','termine') NOT NULL DEFAULT 'en_attente',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rdv_service FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT fk_rdv_medecin FOREIGN KEY (medecin_id) REFERENCES medecins(id),
  -- a doctor cannot have two active appointments in the same time slot
  slot_actif  VARCHAR(40) AS (IF(statut IN ('en_attente','confirme'), CONCAT(medecin_id,'|',date_rdv,'|',heure), NULL)) STORED,
  UNIQUE KEY uq_rdv_creneau (slot_actif),
  INDEX idx_rdv_date (date_rdv, statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE actualites (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  titre      VARCHAR(200) NOT NULL,
  resume     VARCHAR(400) NOT NULL,
  contenu    TEXT         NOT NULL,
  categorie  VARCHAR(40)  NOT NULL,
  image      VARCHAR(255) NULL COMMENT 'illustration: Unsplash id, URL, or local file',
  couleur    VARCHAR(20)  NOT NULL,
  date_pub   DATE         NOT NULL,
  INDEX idx_actu_date (date_pub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(120) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  sujet      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  lu         TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_msg_lu (lu, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dons (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(120) NULL,
  email      VARCHAR(160) NULL,
  montant    DECIMAL(10,2) NOT NULL,
  projet     VARCHAR(60)  NOT NULL,
  message    VARCHAR(500) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE temoignages (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auteur VARCHAR(120) NOT NULL,
  role   VARCHAR(120) NOT NULL,
  texte  TEXT         NOT NULL,
  note   TINYINT UNSIGNED NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(160) NOT NULL UNIQUE,
  nom           VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification codes sent by email at login (only one active code per admin)
CREATE TABLE admin_codes (
  admin_id    INT UNSIGNED PRIMARY KEY,
  code_hash   CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  tentatives  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL,
  CONSTRAINT fk_code_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Confirmation codes sent to families: the request (appointment, cancellation) waits here for the code to be entered
CREATE TABLE codes_email (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  objet       ENUM('rdv','annulation') NOT NULL,
  email       VARCHAR(160) NOT NULL,
  donnees     JSON         NOT NULL,
  code_hash   CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  tentatives  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  renvois     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'codes re-sent for this request',
  created_at  DATETIME     NOT NULL,
  INDEX idx_code_email (email, created_at),
  INDEX idx_code_expire (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Who changed what in the staff area. Append-only: never updated, never deleted by the app.
-- No foreign key to admins on purpose — the trail has to outlive the account it refers to,
-- which a cascading delete would quietly erase.
CREATE TABLE admin_audit (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT UNSIGNED NULL,
  admin_email VARCHAR(160) NOT NULL,
  action      VARCHAR(60)  NOT NULL,
  cible       VARCHAR(190) NULL,
  adresse     VARCHAR(45)  NULL,
  resultat    ENUM('ok','echec') NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_date (created_at),
  INDEX idx_audit_admin (admin_id, created_at),
  INDEX idx_audit_action (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
