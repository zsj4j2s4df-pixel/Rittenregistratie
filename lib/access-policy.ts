/**
 * Policy kernel for the future server. Not an authentication mechanism.
 * Principal must come from a verified server session, memberships from the database.
 * Never construct either from browser-submitted identity headers or request bodies.
 */
export type Principal = {userId:string; sessionExpiresAt:number; disabled:boolean};
export type Membership = {userId:string; vehicleId:string; role:'admin_driver'; active:boolean};
export type VehicleAction = 'read_trips'|'edit_trips'|'export_trips'|'manage_settings';
export function canAccessVehicle(principal:Principal|null,memberships:Membership[],vehicleId:string,action:VehicleAction,now:number):boolean {
  if (!principal || principal.disabled || !principal.userId || !vehicleId || !Number.isFinite(now) || !Number.isFinite(principal.sessionExpiresAt) || principal.sessionExpiresAt<=now) return false;
  if (!['read_trips','edit_trips','export_trips','manage_settings'].includes(action)) return false;
  return memberships.some(m=>m.active && m.userId===principal.userId && m.vehicleId===vehicleId && m.role==='admin_driver');
}

export type DetectionCandidate = {id:string; vehicleId:string; driverId:string; startMs:number; endMs:number; confirmedDriver:boolean};
export type CandidateDecision = {kind:'separate'|'needs_review'; candidateIds:string[]; driverId:string|null; reason:string};

// An overlap is only a review signal: no deletion, automatic business classification,
// or priority-based driver assertion. Real deduplication also needs route/device evidence.
export function assessCandidateOverlap(a:DetectionCandidate,b:DetectionCandidate):CandidateDecision {
  const ids=[a.id,b.id];
  const valid=(c:DetectionCandidate)=>Number.isFinite(c.startMs)&&Number.isFinite(c.endMs)&&c.endMs>c.startMs&&Boolean(c.vehicleId)&&Boolean(c.id);
  if (!valid(a)||!valid(b)) return {kind:'needs_review',candidateIds:ids,driverId:null,reason:'Ongeldige detectiegegevens'};
  if(a.vehicleId!==b.vehicleId || a.startMs>=b.endMs || b.startMs>=a.endMs) return {kind:'separate',candidateIds:ids,driverId:null,reason:'Verschillende voertuigen of geen tijdoverlap'};
  const sameConfirmedDriver=a.confirmedDriver&&b.confirmedDriver&&a.driverId===b.driverId&&Boolean(a.driverId);
  return {kind:'needs_review',candidateIds:ids,driverId:sameConfirmedDriver?a.driverId:null,reason:'Overlappende detecties: route- en apparaatbewijs nodig vóór samenvoegen'};
}
