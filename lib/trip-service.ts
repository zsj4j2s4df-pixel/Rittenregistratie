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
export class TripServiceError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const membership = `EXISTS (SELECT 1 FROM vehicle_memberships m JOIN users u ON u.id=m.user_id
  WHERE m.user_id=? AND m.vehicle_id=? AND m.active=1 AND m.role='admin_driver' AND u.role='admin_driver' AND u.disabled=0)`;

export function createTripService(db: Pick<D1Database, 'prepare' | 'batch'>, resolveSession: SessionResolver = async () => null, clock = () => Date.now()) {
  async function authorize(vehicleId: string): Promise<Principal> {
    const principal = await resolveSession();
    const now = clock();
    if (!principal || typeof principal.userId !== 'string' || !principal.userId || principal.disabled || !Number.isFinite(now) || !Number.isFinite(principal.sessionExpiresAt) || principal.sessionExpiresAt <= now) throw new TripServiceError(401, 'Aanmelden vereist.');
    if (typeof vehicleId !== 'string' || !vehicleId || vehicleId.length > 128) throw new TripServiceError(400, 'Ongeldig voertuig.');
    const allowed = await db.prepare(`SELECT 1 AS allowed WHERE ${membership}`).bind(principal.userId, vehicleId).first();
    if (!allowed) throw new TripServiceError(403, 'Geen toegang tot dit voertuig.');
    return principal;
  }
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
