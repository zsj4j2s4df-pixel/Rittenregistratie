import Foundation

// Operational TEST policy, not evidence of a vehicle, driver or fiscal trip.
// No engine/ignition assumption (including EV); a short stop never ends a trip.
public struct NativeMotionSample: Sendable {
    public let time: Int64 // Unix seconds, unlike session expiries in milliseconds.
    public let location: ObservationLocation
    public let speed: Double
    public init(time: Int64, latitude: Double, longitude: Double, accuracy: Double, speed: Double) {
        self.time = time; self.location = ObservationLocation(latitude: latitude, longitude: longitude, accuracyMeters: accuracy); self.speed = speed
    }
    public func valid(now: Int64) -> Bool {
        time >= 0 && time <= 253_402_300_799 && now >= time && now - time <= 15
        && location.latitude.isFinite && abs(location.latitude) <= 90
        && location.longitude.isFinite && abs(location.longitude) <= 180
        && location.accuracyMeters.isFinite && (0...30).contains(location.accuracyMeters)
        && speed.isFinite && (0...80).contains(speed)
    }
}
public struct ForegroundMotionDetector: Sendable {
    private var last: NativeMotionSample?
    private var movingSince: Int64?
    private var movingSamples = 0
    private var stoppedAt: NativeMotionSample?
    public private(set) var active = false
    public init() {}
    // No end is synthesized on loss of permission, backgrounding, clock jump,
    // inaccurate GPS or restart. A later start is explicitly separate evidence.
    public mutating func interrupt() {
        last = nil; movingSince = nil; movingSamples = 0; stoppedAt = nil; active = false
    }
    public mutating func observe(_ sample: NativeMotionSample, now: Int64) -> ObservationKind? {
        guard sample.valid(now: now) else { interrupt(); return nil }
        if let last, sample.time <= last.time { interrupt(); return nil }
        if let last, sample.time - last.time > 30 { interrupt() }
        last = sample
        if !active {
            guard sample.speed >= 2.5 else { movingSince = nil; movingSamples = 0; return nil }
            if movingSince == nil { movingSince = sample.time }
            movingSamples += 1
            if movingSamples >= 3, sample.time - movingSince! >= 12 {
                active = true; stoppedAt = nil; return .startCandidate
            }
        } else if sample.speed <= 0.8 {
            if let stop = stoppedAt {
                if distance(stop.location, sample.location) > 30 { stoppedAt = sample }
                else if sample.time - stop.time >= 120 {
                    active = false; movingSince = nil; movingSamples = 0; stoppedAt = nil
                    return .endCandidate
                }
            } else { stoppedAt = sample }
        } else { stoppedAt = nil }
        return nil
    }
    private func distance(_ a: ObservationLocation, _ b: ObservationLocation) -> Double {
        let rad = Double.pi / 180
        let dy = (b.latitude-a.latitude)*rad, dx = (b.longitude-a.longitude)*rad
        let h = pow(sin(dy/2),2) + cos(a.latitude*rad)*cos(b.latitude*rad)*pow(sin(dx/2),2)
        return 6_371_000 * 2 * asin(sqrt(min(1,max(0,h))))
    }
}
