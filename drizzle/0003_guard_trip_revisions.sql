CREATE TRIGGER trips_revision_odometer_insert
BEFORE INSERT ON trips
WHEN typeof(NEW.revision) != 'integer' OR NEW.revision NOT BETWEEN 0 AND 9007199254740991
  OR (NEW.odometer_start IS NOT NULL AND (typeof(NEW.odometer_start) NOT IN ('integer','real') OR NEW.odometer_start NOT BETWEEN 0 AND 1.7976931348623157e308))
  OR (NEW.odometer_end IS NOT NULL AND (typeof(NEW.odometer_end) NOT IN ('integer','real') OR NEW.odometer_end NOT BETWEEN 0 AND 1.7976931348623157e308))
  OR (NEW.odometer_start IS NOT NULL AND NEW.odometer_end IS NOT NULL AND NEW.odometer_end < NEW.odometer_start)
BEGIN SELECT RAISE(ABORT, 'trip_revision_odometer_violation'); END;
--> statement-breakpoint
CREATE TRIGGER trips_revision_odometer_update
BEFORE UPDATE ON trips
WHEN typeof(NEW.revision) != 'integer' OR NEW.revision NOT BETWEEN 0 AND 9007199254740991
  OR (NEW.odometer_start IS NOT NULL AND (typeof(NEW.odometer_start) NOT IN ('integer','real') OR NEW.odometer_start NOT BETWEEN 0 AND 1.7976931348623157e308))
  OR (NEW.odometer_end IS NOT NULL AND (typeof(NEW.odometer_end) NOT IN ('integer','real') OR NEW.odometer_end NOT BETWEEN 0 AND 1.7976931348623157e308))
  OR (NEW.odometer_start IS NOT NULL AND NEW.odometer_end IS NOT NULL AND NEW.odometer_end < NEW.odometer_start)
BEGIN SELECT RAISE(ABORT, 'trip_revision_odometer_violation'); END;
