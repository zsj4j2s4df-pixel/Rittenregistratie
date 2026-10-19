import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  externalAuthId: text('external_auth_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role', { enum: ['admin_driver'] }).notNull().default('admin_driver'),
  driverPriority: integer('driver_priority').notNull(),
  theme: text('theme', { enum: ['dark', 'sand', 'system'] }).notNull().default('dark'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
}, table => [uniqueIndex('idx_users_external_auth_id').on(table.externalAuthId)]);

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  registrationPlate: text('registration_plate'),
  settingsRevision: integer('settings_revision').notNull().default(0),
  settingsMutationId: text('settings_mutation_id'),
  modelYear: integer('model_year'),
  marketVersion: text('market_version'),
  verificationStatus: text('verification_status', { enum: ['unverified', 'verified'] }).notNull().default('unverified'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, table => [uniqueIndex('idx_vehicles_registration_plate').on(table.registrationPlate)]);

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  driverId: text('driver_id').references(() => users.id),
  status: text('status', { enum: ['detection', 'provisional', 'final'] }).notNull().default('provisional'),
  classification: text('classification', { enum: ['private', 'business', 'review'] }).notNull().default('review'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  startAddress: text('start_address'),
  endAddress: text('end_address'),
  distanceKm: real('distance_km'),
  distanceOriginJson: text('distance_origin_json'),
  distanceSource: text('distance_source', { enum: ['gps', 'odometer', 'manual', 'estimated'] }),
  routeType: text('route_type', { enum: ['recorded', 'calculated', 'estimated'] }).notNull().default('recorded'),
  purpose: text('purpose'),
  customer: text('customer'),
  notes: text('notes'),
  confidence: real('confidence'),
  needsReview: integer('needs_review', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull().references(() => users.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  revision: integer('revision').notNull().default(0),
  lastMutationId: text('last_mutation_id'),
  odometerStart: real('odometer_start'),
  odometerEnd: real('odometer_end'),
}, table => [
  index('idx_trips_vehicle_started').on(table.vehicleId, table.startedAt),
  index('idx_trips_driver_started').on(table.driverId, table.startedAt),
  index('idx_trips_classification_started').on(table.classification, table.startedAt),
]);

// An empty membership table grants nobody access. Populate only through a
// controlled bootstrap after the account/identity provider has been chosen.
export const vehicleMemberships = sqliteTable('vehicle_memberships', {
  userId: text('user_id').notNull().references(() => users.id),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  role: text('role', { enum: ['admin_driver'] }).notNull().default('admin_driver'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
}, table => [primaryKey({ columns: [table.userId, table.vehicleId] })]);

export const routePoints = sqliteTable('route_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  accuracyMeters: real('accuracy_meters'),
  source: text('source', { enum: ['gps', 'interpolated'] }).notNull().default('gps'),
}, table => [index('idx_route_points_trip_time').on(table.tripId, table.recordedAt)]);

export const businessAddresses = sqliteTable('business_addresses', {
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  radiusMeters: integer('radius_meters').notNull().default(150),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const mileageRates = sqliteTable('mileage_rates', {
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  amountMicros: integer('amount_micros'),
  id: text('id').primaryKey(),
  amountPerKm: real('amount_per_km').notNull(),
  validFrom: integer('valid_from', { mode: 'timestamp' }).notNull(),
  validUntil: integer('valid_until', { mode: 'timestamp' }),
  sourceUrl: text('source_url'),
  createdBy: text('created_by').notNull().references(() => users.id),
}, table => [index('idx_mileage_rates_valid_from').on(table.validFrom)]);

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actorId: text('actor_id').notNull().references(() => users.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  oldValueJson: text('old_value_json'),
  newValueJson: text('new_value_json'),
  occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
}, table => [index('idx_audit_entity_time').on(table.entityType, table.entityId, table.occurredAt)]);

// Scoped retry receipts prevent duplicate manual trips after network retries.
export const tripCreateRequests = sqliteTable('trip_create_requests', {
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  userId: text('user_id').notNull().references(() => users.id),
  requestId: text('request_id').notNull(),
  tripId: text('trip_id').notNull().references(() => trips.id),
  requestJson: text('request_json').notNull(),
  responseJson: text('response_json').notNull(),
}, table => [primaryKey({ columns: [table.vehicleId, table.userId, table.requestId] })]);

export const reportSnapshots = sqliteTable('report_snapshots', {
 id: text('id').primaryKey(),
 vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
 createdBy: text('created_by').notNull().references(() => users.id),
 createdAt: integer('created_at').notNull(),
 requestId: text('request_id').notNull(),
 requestJson: text('request_json').notNull(),
 snapshotJson: text('snapshot_json').notNull(),
}, table => [uniqueIndex('idx_report_request').on(table.vehicleId,table.createdBy,table.requestId),index('idx_report_vehicle_time').on(table.vehicleId,table.createdAt)]);

// An ID is an app-instance claim, not hardware attestation. Ownership is fixed
// by registration; a deactivated instance is retained for audit/idempotency.
export const registeredDevices = sqliteTable('registered_devices', {
 id:text('id').primaryKey(),
 userId:text('user_id').notNull().references(()=>users.id),
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),
 name:text('name').notNull(),
 platform:text('platform',{enum:['ios','web']}).notNull(),
 active:integer('active',{mode:'boolean'}).notNull().default(true),
 revision:integer('revision').notNull().default(0),
 createdAt:integer('created_at').notNull(),
 updatedAt:integer('updated_at').notNull(),
 lastMutationId:text('last_mutation_id').notNull(),
},table=>[index('idx_registered_devices_owner_vehicle').on(table.userId,table.vehicleId,table.id),check('device_platform',sql`${table.platform} IN ('ios','web')`),check('device_active',sql`${table.active} IN (0,1)`),check('device_revision',sql`typeof(${table.revision})='integer' AND ${table.revision} BETWEEN 0 AND 9007199254740991`)]);
export const deviceRegisterRequests = sqliteTable('device_register_requests', {
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),
 userId:text('user_id').notNull().references(()=>users.id),
 requestId:text('request_id').notNull(),
 deviceId:text('device_id').notNull().references(()=>registeredDevices.id),
 requestJson:text('request_json').notNull(),
 responseJson:text('response_json').notNull(),
},table=>[primaryKey({columns:[table.vehicleId,table.userId,table.requestId]})]);

// Raw unverified observations; deliberately separate from trips and route_points.
export const detectionObservations=sqliteTable('detection_observations',{
 id:text('id').primaryKey(),vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),deviceId:text('device_id').notNull().references(()=>registeredDevices.id),eventId:text('event_id').notNull(),observedAt:integer('observed_at').notNull(),receivedAt:integer('received_at').notNull(),source:text('source').notNull(),eventKind:text('event_kind').notNull(),uncertainty:text('uncertainty').notNull(),payloadJson:text('payload_json').notNull(),canonicalJson:text('canonical_json').notNull(),mutationId:text('mutation_id').notNull(),
},table=>[uniqueIndex('idx_detection_event').on(table.deviceId,table.eventId),index('idx_detection_device_time').on(table.deviceId,table.receivedAt,table.id),check('detection_observed_time',sql`typeof(${table.observedAt})='integer' AND ${table.observedAt} BETWEEN 0 AND 253402300799`),check('detection_received_time',sql`typeof(${table.receivedAt})='integer' AND ${table.receivedAt} BETWEEN 0 AND 253402300799`),check('detection_source',sql`${table.source} IN ('gps','bluetooth','carplay','manual')`),check('detection_kind',sql`${table.eventKind} IN ('location','start_candidate','end_candidate','connection','disconnection')`),check('detection_uncertainty',sql`${table.uncertainty}='unverified_app_observation'`),check('detection_payload_size',sql`length(CAST(${table.payloadJson} AS BLOB))<=16384`),check('detection_canonical_size',sql`length(CAST(${table.canonicalJson} AS BLOB))<=16384`)]);
export const detectionIngestRequests=sqliteTable('detection_ingest_requests',{
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),deviceId:text('device_id').notNull().references(()=>registeredDevices.id),requestId:text('request_id').notNull(),observationId:text('observation_id').notNull().references(()=>detectionObservations.id),canonicalJson:text('canonical_json').notNull(),
},table=>[primaryKey({columns:[table.vehicleId,table.userId,table.deviceId,table.requestId]})]);

export const vehicleJourneys=sqliteTable('vehicle_journeys',{
 id:text('id').primaryKey(),vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),createdBy:text('created_by').notNull().references(()=>users.id),startedAt:integer('started_at').notNull(),endedAt:integer('ended_at'),status:text('status').notNull(),revision:integer('revision').notNull().default(0),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),lastMutationId:text('last_mutation_id').notNull(),
},t=>[uniqueIndex('idx_vehicle_journey_open').on(t.vehicleId).where(sql`${t.status}='review_open'`),index('idx_vehicle_journey_history').on(t.vehicleId,t.createdAt,t.id),check('journey_start',sql`typeof(${t.startedAt})='integer' AND ${t.startedAt} BETWEEN 0 AND 253402300799`),check('journey_status',sql`${t.status} IN ('review_open','review_closed')`),check('journey_revision',sql`typeof(${t.revision})='integer' AND ${t.revision} BETWEEN 0 AND 9007199254740991`),check('journey_end',sql`(${t.status}='review_open' AND ${t.endedAt} IS NULL) OR (${t.status}='review_closed' AND typeof(${t.endedAt})='integer' AND ${t.endedAt}>${t.startedAt} AND ${t.endedAt}<=253402300799)`)]);
export const journeyObservations=sqliteTable('journey_observations',{
 observationId:text('observation_id').primaryKey().references(()=>detectionObservations.id),journeyId:text('journey_id').notNull().references(()=>vehicleJourneys.id),linkedBy:text('linked_by').notNull().references(()=>users.id),linkedAt:integer('linked_at').notNull(),
},t=>[index('idx_journey_observations').on(t.journeyId,t.observationId)]);
export const journeyRequests=sqliteTable('journey_requests',{
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),requestId:text('request_id').notNull(),operation:text('operation').notNull(),requestJson:text('request_json').notNull(),responseJson:text('response_json').notNull(),
},t=>[primaryKey({columns:[t.vehicleId,t.userId,t.requestId]}),check('journey_operation',sql`${t.operation} IN ('create','join','close')`)]);

export const journeyChoices=sqliteTable('journey_choices',{
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),requestId:text('request_id').notNull(),journeyId:text('journey_id').notNull().references(()=>vehicleJourneys.id),expectedRevision:integer('expected_revision').notNull(),revision:integer('revision').notNull(),classification:text('classification').notNull(),reason:text('reason').notNull(),createdAt:integer('created_at').notNull(),requestJson:text('request_json').notNull(),responseJson:text('response_json').notNull(),
},t=>[primaryKey({columns:[t.vehicleId,t.userId,t.requestId]}),uniqueIndex('idx_journey_choice_revision').on(t.journeyId,t.revision),index('idx_journey_choice_current').on(t.journeyId,t.revision),check('journey_choice_classification',sql`${t.classification} IN ('business','private')`),check('journey_choice_revision',sql`typeof(${t.expectedRevision})='integer' AND ${t.expectedRevision}>=0 AND typeof(${t.revision})='integer' AND ${t.revision}=${t.expectedRevision}+1 AND ${t.revision}<=9007199254740991`)]);

// One reviewed journey can produce at most one logbook trip, across all users.
export const journeyMaterializations=sqliteTable('journey_materializations',{
 journeyId:text('journey_id').primaryKey().references(()=>vehicleJourneys.id),vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),tripId:text('trip_id').notNull().references(()=>trips.id),userId:text('user_id').notNull().references(()=>users.id),requestId:text('request_id').notNull(),sourceRevision:integer('source_revision').notNull(),revision:integer('revision').notNull(),createdAt:integer('created_at').notNull(),requestJson:text('request_json').notNull(),responseJson:text('response_json').notNull(),
},t=>[uniqueIndex('idx_materialization_trip').on(t.tripId),uniqueIndex('idx_materialization_request').on(t.vehicleId,t.userId,t.requestId),check('materialization_revision',sql`typeof(${t.sourceRevision})='integer' AND ${t.sourceRevision}>=0 AND typeof(${t.revision})='integer' AND ${t.revision}=${t.sourceRevision}+1 AND ${t.revision}<=9007199254740991`),check('materialization_request_size',sql`length(CAST(${t.requestJson} AS BLOB))<=16384 AND length(CAST(${t.responseJson} AS BLOB))<=16384`)]);

export const tripReviewRequests=sqliteTable('trip_review_requests',{
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),requestId:text('request_id').notNull(),tripId:text('trip_id').notNull().references(()=>trips.id),expectedRevision:integer('expected_revision').notNull(),revision:integer('revision').notNull(),requestJson:text('request_json').notNull(),responseJson:text('response_json').notNull(),
},t=>[primaryKey({columns:[t.vehicleId,t.userId,t.requestId]}),uniqueIndex('idx_trip_review_revision').on(t.tripId,t.revision),check('trip_review_revision',sql`typeof(${t.expectedRevision})='integer' AND ${t.expectedRevision}>=0 AND typeof(${t.revision})='integer' AND ${t.revision}=${t.expectedRevision}+1 AND ${t.revision}<=9007199254740991`)]);

export const mutationRequests=sqliteTable('mutation_requests',{
 vehicleId:text('vehicle_id').notNull().references(()=>vehicles.id),userId:text('user_id').notNull().references(()=>users.id),requestId:text('request_id').notNull(),operation:text('operation').notNull(),entityId:text('entity_id').notNull(),requestJson:text('request_json').notNull(),responseJson:text('response_json').notNull(),
},t=>[primaryKey({columns:[t.vehicleId,t.userId,t.requestId]}),check('mutation_operation',sql`${t.operation} IN ('trip-edit','settings')`),check('mutation_payload_size',sql`length(CAST(${t.requestJson} AS BLOB))<=16384 AND length(CAST(${t.responseJson} AS BLOB))<=65536`)]);
