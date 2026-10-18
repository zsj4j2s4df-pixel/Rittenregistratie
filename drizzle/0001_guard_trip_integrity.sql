-- Additive guards: do not rebuild tables, delete rows or cascade route points.
-- Existing rows must be inspected before applying this migration to a live DB.
CREATE TRIGGER trips_integrity_insert
BEFORE INSERT ON trips
WHEN NEW.classification NOT IN ('private', 'business', 'review')
  OR NEW.status NOT IN ('detection', 'provisional', 'final')
  OR NEW.route_type NOT IN ('recorded', 'calculated', 'estimated')
  OR (NEW.distance_source IS NOT NULL AND NEW.distance_source NOT IN ('gps', 'odometer', 'manual', 'estimated'))
  OR typeof(NEW.started_at) != 'integer'
  OR (NEW.ended_at IS NOT NULL AND (typeof(NEW.ended_at) != 'integer' OR NEW.ended_at <= NEW.started_at))
  OR (NEW.distance_km IS NOT NULL AND (typeof(NEW.distance_km) NOT IN ('integer', 'real') OR NOT (NEW.distance_km BETWEEN 0 AND 1.7976931348623157e308)))
BEGIN
  SELECT RAISE(ABORT, 'trip_integrity_violation');
END;
--> statement-breakpoint
CREATE TRIGGER trips_integrity_update
BEFORE UPDATE ON trips
WHEN NEW.classification NOT IN ('private', 'business', 'review')
  OR NEW.status NOT IN ('detection', 'provisional', 'final')
  OR NEW.route_type NOT IN ('recorded', 'calculated', 'estimated')
  OR (NEW.distance_source IS NOT NULL AND NEW.distance_source NOT IN ('gps', 'odometer', 'manual', 'estimated'))
  OR typeof(NEW.started_at) != 'integer'
  OR (NEW.ended_at IS NOT NULL AND (typeof(NEW.ended_at) != 'integer' OR NEW.ended_at <= NEW.started_at))
  OR (NEW.distance_km IS NOT NULL AND (typeof(NEW.distance_km) NOT IN ('integer', 'real') OR NOT (NEW.distance_km BETWEEN 0 AND 1.7976931348623157e308)))
BEGIN
  SELECT RAISE(ABORT, 'trip_integrity_violation');
END;
