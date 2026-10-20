-- Existing audit rows remain byte-for-byte unchanged. Application writes are
-- append-only; corrections must append a new event rather than rewrite history.
CREATE TRIGGER audit_logs_immutable_update BEFORE UPDATE ON audit_logs
BEGIN SELECT RAISE(ABORT, 'audit_log_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER audit_logs_immutable_delete BEFORE DELETE ON audit_logs
BEGIN SELECT RAISE(ABORT, 'audit_log_immutable'); END;
