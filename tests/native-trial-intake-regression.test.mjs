import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createDeviceService} from '../lib/device-service.ts';
import {createDetectionService} from '../lib/detection-service.ts';
import {createJourneyService} from '../lib/journey-service.ts';

// The previous Swift mock accepted manual + GPS coordinates, unlike real intake.
// Exercise the real SQLite-backed services with a stopped native trial's events.
test('native start/end GPS evidence: rejected old payload can retry with same IDs, receipts stay immutable', async t => {
 const f=setup(t), p={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
 const args=[f.db,async()=>p,()=>1_000_000], device='native-trial-device-001';
 await createDeviceService(...args).register('v',{id:device,requestId:'register-trial-001',name:'Synthetic trial',platform:'ios'});
 const intake=createDetectionService(...args), journeys=createJourneyService(...args);
 const location={latitude:52,longitude:4,accuracyMeters:5};
 const start={requestId:'native-start-request-001',eventId:'native-start-event-001',observedAt:900,source:'manual',kind:'start_candidate',detail:'explicit_native_trial_start',location};
 await assert.rejects(()=>intake.ingest('v',device,start),e=>e.status===400);
 assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM detection_ingest_requests').get().n,0);
 const corrected={...start,source:'gps'}, a=await intake.ingest('v',device,corrected);
 assert.deepEqual(await intake.ingest('v',device,corrected),a);
 const j=await journeys.create('v',{requestId:'native-create-request-001',deviceId:device,observationId:a.id});
 const stop={...start,requestId:'native-stop-request-001',eventId:'native-stop-event-001',observedAt:930,kind:'end_candidate',detail:'explicit_native_trial_stop'};
 await assert.rejects(()=>intake.ingest('v',device,stop),e=>e.status===400);
 const b=await intake.ingest('v',device,{...stop,source:'gps'});
 const input={requestId:'native-close-request-001',deviceId:device,observationId:b.id,expectedRevision:j.revision,reason:'Explicit synthetic trial'};
 const receipt=await journeys.close('v',j.journeyId,input);
 assert.deepEqual(await journeys.close('v',j.journeyId,input),receipt);
 await assert.rejects(()=>intake.ingest('v',device,{...corrected,observedAt:901}),e=>e.status===409);
 assert.equal((await journeys.get('v',j.journeyId)).journey.status,'review_closed');
 assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM detection_observations').get().n,2);
});
