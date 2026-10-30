-- Counts the codes re-sent for one pending request (booking, cancellation).
--
-- A resend rewrites codes_email.created_at, which is what the hourly ceiling per address
-- counts from, and adds no row for it to count. Without a counter of its own, a single
-- accepted request was a standing permission to mail that address once a minute for as
-- long as its token lived. lib/codes.ts caps it at MAX_RENVOIS.
ALTER TABLE codes_email
  ADD COLUMN renvois TINYINT UNSIGNED NOT NULL DEFAULT 0
  COMMENT 'codes re-sent for this request' AFTER tentatives;
