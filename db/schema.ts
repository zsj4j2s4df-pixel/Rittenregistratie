import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
