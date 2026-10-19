#if os(iOS)
import Foundation
import UserNotifications

public enum TripChoice: String, Sendable { case business, `private` }
public struct TripChoiceContext: Equatable, Sendable {
    public let proposalID: String
    public let vehicleID: String
    public let viewerID: String
    public let revision: Int
    public init(proposalID: String, vehicleID: String, viewerID: String, revision: Int) {
        self.proposalID = proposalID; self.vehicleID = vehicleID; self.viewerID = viewerID; self.revision = revision
    }
}
// A real implementation must atomically match the current authenticated local
// viewer/vehicle/pending proposal/revision and persist a stable action receipt.
// It must retain an unclassified proposal on missing/stale/failed actions, never
// trust notification userInfo as authority, and never auto-assign the driver.
public protocol TripChoiceStore: Actor {
    func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws
}
public actor UnconfiguredTripChoiceStore: TripChoiceStore {
    public init() {}
    public func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws {
        throw NativeAPIError.sessionNotConfigured
    }
}
public enum TripChoiceNotificationError: Error { case invalidContext, permissionRequired, unrecognizedAction }
@available(iOS 15.0, *)
public struct TripChoiceNotifications: Sendable {
    public static let category = "RITKOMPAS_TRIP_CHOICE_V1"
    public static let businessAction = "RITKOMPAS_BUSINESS_V1"
    public static let privateAction = "RITKOMPAS_PRIVATE_V1"
    public init() {}
    public static func valid(_ context: TripChoiceContext) -> Bool {
        let ids = [context.proposalID, context.vehicleID, context.viewerID]
        return ids.allSatisfy { !$0.isEmpty && $0.utf8.count <= 128 && !$0.unicodeScalars.contains(where: { $0.value < 32 || $0.value == 127 }) }
            && context.revision >= 0 && context.revision < 9_007_199_254_740_991
    }
    // Register without requesting permission. Merge rather than remove other app categories.
    public func registerCategories(center: UNUserNotificationCenter = .current()) async {
        let business = UNNotificationAction(identifier: Self.businessAction, title: "Zakelijk", options: [])
        let personal = UNNotificationAction(identifier: Self.privateAction, title: "Privé", options: [])
        let category = UNNotificationCategory(identifier: Self.category, actions: [business, personal], intentIdentifiers: [], options: [.customDismissAction])
        var categories = await center.notificationCategories()
        categories = Set(categories.filter { $0.identifier != Self.category })
        categories.insert(category)
        center.setNotificationCategories(categories)
    }
    // Call only after an explicit in-app permission choice, never on vehicle connection.
    public func requestPermission(center: UNUserNotificationCenter = .current()) async throws -> Bool {
        try await center.requestAuthorization(options: [.alert, .sound])
    }
    public func schedule(_ context: TripChoiceContext, center: UNUserNotificationCenter = .current()) async throws {
        guard Self.valid(context) else { throw TripChoiceNotificationError.invalidContext }
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized else { throw TripChoiceNotificationError.permissionRequired }
        let content = UNMutableNotificationContent()
        content.title = "Rit controleren"
        content.body = "Kies Zakelijk of Privé. Je kunt dit ook later doen."
        content.categoryIdentifier = Self.category
        // No address, location, name or business purpose on the lock screen.
        content.userInfo = ["proposalID": context.proposalID, "vehicleID": context.vehicleID,
                            "viewerID": context.viewerID, "revision": context.revision]
        let identifier = [context.viewerID, context.vehicleID, context.proposalID].map { Data($0.utf8).base64EncodedString() }.joined(separator: ".")
        try await center.add(UNNotificationRequest(identifier: identifier, content: content, trigger: nil))
    }
    // Called by the host application's notification delegate. No foreground flag:
    // iOS may deliver a background action, but lock/Focus/termination are not guaranteed.
    // Dismiss/open/default never silently means Private or Business.
    public func handle(actionIdentifier: String, categoryIdentifier: String, userInfo: [AnyHashable: Any], store: any TripChoiceStore) async throws {
        guard categoryIdentifier == Self.category else { throw TripChoiceNotificationError.unrecognizedAction }
        let choice: TripChoice
        switch actionIdentifier {
        case Self.businessAction: choice = .business
        case Self.privateAction: choice = .private
        case UNNotificationDefaultActionIdentifier, UNNotificationDismissActionIdentifier: return
        default: throw TripChoiceNotificationError.unrecognizedAction
        }
        guard let proposal = userInfo["proposalID"] as? String,
              let vehicle = userInfo["vehicleID"] as? String,
              let viewer = userInfo["viewerID"] as? String,
              let revision = userInfo["revision"] as? Int else { throw TripChoiceNotificationError.invalidContext }
        let context = TripChoiceContext(proposalID: proposal, vehicleID: vehicle, viewerID: viewer, revision: revision)
        guard Self.valid(context) else { throw TripChoiceNotificationError.invalidContext }
        try await store.chooseIfCurrent(choice, context: context)
    }
}
#endif
