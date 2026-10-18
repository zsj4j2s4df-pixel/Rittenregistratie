import type { Principal } from './access-policy.ts';
import type { SessionResolver } from './trip-service.ts';
export class TripServiceError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export const membership = `EXISTS (SELECT 1 FROM vehicle_memberships m JOIN users u ON u.id=m.user_id
  WHERE m.user_id=? AND m.vehicle_id=? AND m.active=1 AND m.role='admin_driver' AND u.role='admin_driver' AND u.disabled=0)`;

export function vehicleAuthorizer(db: Pick<D1Database, 'prepare'>, resolveSession: SessionResolver, clock: () => number) {
  async function authorize(vehicleId: string): Promise<Principal> {
    const principal = await resolveSession();
    const now = clock();
    if (!principal || typeof principal.userId !== 'string' || !principal.userId || principal.disabled || !Number.isFinite(now) || !Number.isFinite(principal.sessionExpiresAt) || principal.sessionExpiresAt <= now) throw new TripServiceError(401, 'Aanmelden vereist.');
    if (typeof vehicleId !== 'string' || !vehicleId || vehicleId.length > 128) throw new TripServiceError(400, 'Ongeldig voertuig.');
    const allowed = await db.prepare(`SELECT 1 AS allowed WHERE ${membership}`).bind(principal.userId, vehicleId).first();
    if (!allowed) throw new TripServiceError(403, 'Geen toegang tot dit voertuig.');
    return principal;
  }
  return authorize;
}
