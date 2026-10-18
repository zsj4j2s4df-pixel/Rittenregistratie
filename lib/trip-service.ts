import { TripServiceError, membership, vehicleAuthorizer } from './server-access.ts';
import type { Principal } from './access-policy.ts';

// Server-only core, deliberately not wired to an unauthenticated public route.
// A resolver MUST verify the session with the chosen provider. Never derive its
// result from user-supplied identity headers/body. No resolver means deny access.
export type SessionResolver = () => Promise<Principal | null>;
export type StoredTrip = Record<string, unknown> & { id: string; vehicle_id: string; revision: number; route_type: string; distance_source: string | null };
export type TripEdit = {
  expectedRevision: number; startedAt: number; endedAt: number; distanceKm: number;
  startAddress: string; endAddress: string; classification: 'private' | 'business' | 'review'; driverId: string | null;
  odometerStart: number | null; odometerEnd: number | null; purpose: string | null; reason: string;
};
export type TripCreate = Omit<TripEdit, 'expectedRevision'> & { requestId: string };
export { TripServiceError } from './server-access.ts';

export function createTripService(db: Pick<D1Database, 'prepare' | 'batch'>, resolveSession: SessionResolver = async () => null, clock = () => Date.now()) {
  const authorize = vehicleAuthorizer(db, resolveSession, clock);
  async function getAuthorized(principal: Principal, vehicleId: string, tripId: string) {
    if (typeof tripId !== 'string' || !tripId || tripId.length > 128) throw new TripServiceError(400, 'Ongeldige rit.');
    const trip = await db.prepare(`SELECT * FROM trips WHERE id=? AND vehicle_id=? AND ${membership}`).bind(tripId, vehicleId, principal.userId, vehicleId).first<StoredTrip>();
    if (!trip) throw new TripServiceError(404, 'Rit niet gevonden.');
    return trip;
  }
  function validate(edit: TripEdit) {
    if (!edit || typeof edit !== 'object') throw new TripServiceError(400, 'Ongeldige ritcorrectie.');
    const nonempty = (v: unknown, max: number) => typeof v === 'string' && Boolean(v.trim()) && v.length <= max;
    if (!Number.isSafeInteger(edit.expectedRevision) || edit.expectedRevision < 0 || !Number.isSafeInteger(edit.startedAt) || !Number.isSafeInteger(edit.endedAt) || !Number.isFinite(new Date(edit.startedAt*1000).getTime()) || !Number.isFinite(new Date(edit.endedAt*1000).getTime()) || edit.endedAt <= edit.startedAt ||
      !Number.isFinite(edit.distanceKm) || edit.distanceKm <= 0 || !nonempty(edit.startAddress, 450) || !nonempty(edit.endAddress, 450) || !nonempty(edit.reason, 500) ||
      !['private', 'business', 'review'].includes(edit.classification) || (edit.driverId !== null && !nonempty(edit.driverId, 128)) ||
      (edit.purpose !== null && (typeof edit.purpose !== 'string' || edit.purpose.length > 1000))) throw new TripServiceError(400, 'Ongeldige ritcorrectie.');
    for (const v of [edit.odometerStart, edit.odometerEnd]) if (v !== null && (!Number.isFinite(v) || v < 0)) throw new TripServiceError(400, 'Ongeldige tellerstand.');
    if (edit.odometerStart !== null && edit.odometerEnd !== null && edit.odometerEnd < edit.odometerStart) throw new TripServiceError(400, 'Tellerstanden staan in ongeldige volgorde.');
  }
  return {
    async create(vehicleId: string, input: TripCreate) {
      const principal = await authorize(vehicleId);
      validate(input && { ...input, expectedRevision: 0 });
      if (typeof input.requestId !== 'string' || !/^[a-zA-Z0-9_-]{16,128}$/.test(input.requestId)) throw new TripServiceError(400, 'Ongeldige herhaalcode.');
      const requestJson = JSON.stringify({ startedAt: input.startedAt, endedAt: input.endedAt, distanceKm: input.distanceKm,
        startAddress: input.startAddress.trim(), endAddress: input.endAddress.trim(), classification: input.classification,
        driverId: input.driverId, odometerStart: input.odometerStart, odometerEnd: input.odometerEnd,
        purpose: input.purpose?.trim() ?? null, reason: input.reason.trim() });
      async function receipt() {
        const row = await db.prepare(`SELECT request_json,response_json FROM trip_create_requests WHERE vehicle_id=? AND user_id=? AND request_id=? AND ${membership}`)
          .bind(vehicleId, principal.userId, input.requestId, principal.userId, vehicleId).first<{request_json:string;response_json:string}>();
        if (!row) return null;
        if (row.request_json !== requestJson) throw new TripServiceError(409, 'Herhaalcode is al gebruikt voor andere ritgegevens.');
        return JSON.parse(row.response_json) as StoredTrip;
      }
      const previous = await receipt();
      if (previous) return previous;
      if (input.driverId !== null && !await db.prepare(`SELECT 1 WHERE ${membership}`).bind(input.driverId, vehicleId).first()) throw new TripServiceError(400, 'Bestuurder heeft geen actieve toegang tot dit voertuig.');
      const now = clock();
      if (!Number.isFinite(now) || principal.sessionExpiresAt <= now) throw new TripServiceError(401, 'Aanmelden vereist.');
      const occurredAt = Math.floor(now / 1000);
      if (!Number.isSafeInteger(occurredAt)) throw new TripServiceError(500, 'Ongeldige servertijd.');
      const tripId = crypto.randomUUID();
      const mutationId = crypto.randomUUID();
      const after = { id: tripId, vehicle_id: vehicleId, driver_id: input.driverId, status: 'provisional', classification: input.classification,
        started_at: input.startedAt, ended_at: input.endedAt, start_address: input.startAddress.trim(), end_address: input.endAddress.trim(),
        distance_km: input.distanceKm, distance_source: 'manual', distance_origin_json: null, route_type: 'estimated',
        purpose: input.purpose?.trim() ?? null, customer: null, notes: null, confidence: null, needs_review: 1,
        created_by: principal.userId, updated_at: occurredAt, revision: 0, last_mutation_id: mutationId,
        odometer_start: input.odometerStart, odometer_end: input.odometerEnd };
      // All three statements share one D1 transaction. Concurrent retries see the
      // first receipt and cannot insert another trip. Failed audit rolls all back.
      const columns = Object.keys(after);
      await db.batch([
        db.prepare(`INSERT INTO trips(${columns.join(',')}) SELECT ${columns.map(()=>'?').join(',')}
          WHERE ${membership} AND (? IS NULL OR ${membership}) AND NOT EXISTS
          (SELECT 1 FROM trip_create_requests WHERE vehicle_id=? AND user_id=? AND request_id=?)`)
          .bind(...Object.values(after), principal.userId, vehicleId, input.driverId, input.driverId, vehicleId, vehicleId, principal.userId, input.requestId),
        db.prepare(`INSERT INTO trip_create_requests(vehicle_id,user_id,request_id,trip_id,request_json,response_json)
          SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM trips WHERE id=? AND last_mutation_id=?)`)
          .bind(vehicleId, principal.userId, input.requestId, tripId, requestJson, JSON.stringify(after), tripId, mutationId),
        db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at)
          SELECT ?,'trip',?,'create',NULL,?,? WHERE EXISTS (SELECT 1 FROM trips WHERE id=? AND last_mutation_id=?)`)
          .bind(principal.userId, tripId, JSON.stringify({ ...after, correction_reason: input.reason.trim() }), occurredAt, tripId, mutationId),
      ]);
      const saved = await receipt();
      if (!saved) throw new TripServiceError(409, 'Toegangsrechten zijn gewijzigd; laad opnieuw.');
      return saved;
    },
    async list(vehicleId: string, limit = 50, offset = 0) {
      const principal = await authorize(vehicleId);
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) throw new TripServiceError(400, 'Ongeldige paginering.');
      const result = await db.prepare(`SELECT * FROM trips WHERE vehicle_id=? AND ${membership} ORDER BY started_at,id LIMIT ? OFFSET ?`).bind(vehicleId, principal.userId, vehicleId, limit, offset).all<StoredTrip>();
      return result.results;
    },
    async get(vehicleId: string, tripId: string) { return getAuthorized(await authorize(vehicleId), vehicleId, tripId); },
    async history(vehicleId: string, tripId: string, limit = 50) {
      const principal = await authorize(vehicleId);
      await getAuthorized(principal, vehicleId, tripId);
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new TripServiceError(400, 'Ongeldige paginering.');
      return (await db.prepare(`SELECT * FROM audit_logs WHERE entity_type='trip' AND entity_id=? AND ${membership} ORDER BY id DESC LIMIT ?`).bind(tripId, principal.userId, vehicleId, limit).all()).results;
    },
    async edit(vehicleId: string, tripId: string, edit: TripEdit) {
      const principal = await authorize(vehicleId);
      validate(edit);
      const before = await getAuthorized(principal, vehicleId, tripId);
      if (before.revision !== edit.expectedRevision || before.revision >= Number.MAX_SAFE_INTEGER) throw new TripServiceError(409, 'Rit is gewijzigd; laad de laatste versie.');
      if (edit.driverId !== null && !await db.prepare(`SELECT 1 WHERE ${membership}`).bind(edit.driverId, vehicleId).first()) throw new TripServiceError(400, 'Bestuurder heeft geen actieve toegang tot dit voertuig.');
      const mutationId = crypto.randomUUID();
      const now = clock();
      if (principal.sessionExpiresAt <= now) throw new TripServiceError(401, 'Aanmelden vereist.');
      const occurredAt = Math.floor(now / 1000); // schema uses Unix seconds, session expiry uses milliseconds
      if (!Number.isSafeInteger(occurredAt)) throw new TripServiceError(500, 'Ongeldige servertijd.');
      const distanceChanged = before.distance_km !== edit.distanceKm;
      const distanceOrigin = before.distance_origin_json ?? (distanceChanged ? JSON.stringify({ distanceKm: before.distance_km ?? null, source: before.distance_source ?? null }) : null);
      const after = { ...before, distance_source: distanceChanged ? 'manual' : before.distance_source, distance_origin_json: distanceOrigin, started_at: edit.startedAt, ended_at: edit.endedAt, distance_km: edit.distanceKm,
        start_address: edit.startAddress.trim(), end_address: edit.endAddress.trim(), classification: edit.classification, driver_id: edit.driverId,
        odometer_start: edit.odometerStart, odometer_end: edit.odometerEnd, purpose: edit.purpose?.trim() ?? null,
        revision: before.revision + 1, last_mutation_id: mutationId, updated_at: occurredAt };
      // D1 batch is transactional. A unique mutation marker makes audit insertion
      // conditional on THIS successful update, even with concurrent same-second edits.
      const results = await db.batch([
        db.prepare(`UPDATE trips SET started_at=?,ended_at=?,distance_km=?,distance_source=?,distance_origin_json=?,start_address=?,end_address=?,classification=?,driver_id=?,odometer_start=?,odometer_end=?,purpose=?,revision=revision+1,last_mutation_id=?,updated_at=?
          WHERE id=? AND vehicle_id=? AND revision=? AND ${membership} AND (? IS NULL OR ${membership})`)
          .bind(after.started_at, after.ended_at, after.distance_km, after.distance_source, after.distance_origin_json, after.start_address, after.end_address, after.classification, after.driver_id,
            after.odometer_start, after.odometer_end, after.purpose, mutationId, occurredAt, tripId, vehicleId, edit.expectedRevision,
            principal.userId, vehicleId, edit.driverId, edit.driverId, vehicleId),
        db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at)
          SELECT ?,'trip',?,'update',?,?,? WHERE EXISTS (SELECT 1 FROM trips WHERE id=? AND vehicle_id=? AND last_mutation_id=?)`)
          .bind(principal.userId, tripId, JSON.stringify(before), JSON.stringify({ ...after, correction_reason: edit.reason.trim() }), occurredAt, tripId, vehicleId, mutationId),
      ]);
      if (results[0].meta.changes !== 1 || results[1].meta.changes !== 1) throw new TripServiceError(409, 'Rit of toegangsrechten zijn gewijzigd; laad opnieuw.');
      return after;
    },
  };
}
