export type GeometryPoint={recorded_at:number;latitude:number;longitude:number;accuracy_meters:number|null;source:string};
// Schematic projection only: no basemap, distance, GPS validation or interpolation.
export function routeGeometry(points:GeometryPoint[]){
 const raw:{source:string;points:{x:number;y:number}[]}[]=[];let current:typeof raw[number]|null=null,previous:GeometryPoint|null=null,longitude:number|null=null;let invalid=0,uncertain=0,gaps=0,interpolated=0;
 for(const point of points){
  if(!Number.isFinite(point.latitude)||point.latitude< -90||point.latitude>90||!Number.isFinite(point.longitude)||point.longitude< -180||point.longitude>180||!Number.isFinite(point.recorded_at)||!['gps','interpolated'].includes(point.source)||point.accuracy_meters!==null&&(!Number.isFinite(point.accuracy_meters)||point.accuracy_meters<0)){invalid++;current=null;previous=null;continue;}
  if(point.source==='interpolated')interpolated++;
  if(point.accuracy_meters===null)uncertain++;
  if(point.accuracy_meters!==null&&point.accuracy_meters>100){uncertain++;current=null;previous=null;continue;}
  if(previous&&(point.recorded_at-previous.recorded_at>120||point.recorded_at<previous.recorded_at)){gaps++;current=null;}
  let x=point.longitude;if(longitude!==null){while(x-longitude>180)x-=360;while(x-longitude< -180)x+=360;}longitude=x;
  if(!current||current.source!==point.source){current={source:point.source,points:[]};raw.push(current);}
  current.points.push({x,y:-point.latitude});previous=point;
 }
 const all=raw.flatMap(segment=>segment.points);if(!all.length)return {segments:[],invalid,uncertain,gaps,interpolated};
 const xs=all.map(p=>p.x),ys=all.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(560/Math.max(maxX-minX,0.00001),260/Math.max(maxY-minY,0.00001));
 return {segments:raw.map(segment=>({source:segment.source,points:segment.points.map(p=>({x:300+(p.x-(minX+maxX)/2)*scale,y:150+(p.y-(minY+maxY)/2)*scale}))})),invalid,uncertain,gaps,interpolated};
}
