import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {filterTrips} from '../app/beheer/trip-filters.ts';
test('drivers list scopes active vehicle memberships, exposes only id/name and denies revoked access',async t=>{
 const {db,sqlite}=setup(t);const origin='https://test.invalid';const handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:'u',disabled:false,sessionExpiresAt:Date.now()+60000})});
 const get=path=>handle(new Request(origin+path));
 let response=await get('/api/vehicles/v/drivers');assert.equal(response.status,200);assert.deepEqual(await response.json(),{drivers:[{id:'u',name:'Test U'}]});assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal((await get('/api/vehicles/other-v/drivers')).status,403);
 sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v')");
 assert.equal((await(await get('/api/vehicles/v/drivers')).json()).drivers.length,2);
 sqlite.exec("UPDATE users SET disabled=1 WHERE id='other'");assert.equal((await(await get('/api/vehicles/v/drivers')).json()).drivers.length,1);
 for(const query of ['?limit=0','?limit=101','?offset=-1','?limit=1&limit=2','?email=1'])assert.equal((await get('/api/vehicles/v/drivers'+query)).status,400);
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/drivers',{method:'POST'}))).status,405);
 sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");assert.equal((await get('/api/vehicles/v/drivers')).status,403);
});
test('trip filters use Amsterdam day boundaries and preserve unknown-driver distinction',()=>{
 const base={id:'x',revision:1,started_at:Date.parse('2026-10-17T22:30:00Z')/1000,ended_at:null,start_address:'UTRECHT',end_address:null,purpose:null,distance_km:null,classification:'private',driver_id:null,odometer_start:null,odometer_end:null};
 const filters={from:'2026-10-18',until:'2026-10-18',classification:'private',driver:'unknown',query:'utrecht'};
 assert.equal(filterTrips([base],filters).length,1);assert.equal(filterTrips([base],{...filters,driver:'user:u'}).length,0);assert.equal(filterTrips([base],{...filters,until:'2026-10-17'}).length,0);
});
