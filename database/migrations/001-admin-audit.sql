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
