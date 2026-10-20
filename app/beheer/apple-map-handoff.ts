import type {GeometryPoint} from './route-geometry';
// Public Apple Maps link only, no API key or background provider request.
// Never substitute a calculated route for the stored observation stream.
export function appleMapHandoff(points:readonly GeometryPoint[]):string|null {
 if(!Array.isArray(points)||points.length<2||points.length>10000||points.some(p=>!p||!Number.isSafeInteger(p.recorded_at)||p.recorded_at<0||p.recorded_at>253402300799))return null;
 const sorted=[...points].sort((a,b)=>a.recorded_at-b.recorded_at),first=sorted[0],last=sorted[sorted.length-1];
 const endpoint=(p:GeometryPoint)=>p.source==='gps'&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&p.accuracy_meters!==null&&Number.isFinite(p.accuracy_meters)&&p.accuracy_meters>=0&&p.accuracy_meters<=100;
 if(!endpoint(first)||!endpoint(last)||last.recorded_at<=first.recorded_at||first.latitude===last.latitude&&first.longitude===last.longitude)return null;
 const url=new URL('https://maps.apple.com/directions');url.searchParams.set('source',first.latitude+','+first.longitude);url.searchParams.set('destination',last.latitude+','+last.longitude);url.searchParams.set('mode','driving');return url.href;
}
