#if os(iOS)
import Foundation
import UserNotifications

@available(iOS 15.0, *)
public actor LocalTripChoiceScheduler: TripChoiceScheduler {
    private let notifications = TripChoiceNotifications()
    public init() {}
    public func schedule(_ context: TripChoiceContext) async throws { try await notifications.schedule(context) }
    public func remove(_ context: TripChoiceContext) async { notifications.remove(context) }
}

// Immutable actor references only. OS callback payload is decoded synchronously
// into a Sendable enum before await. OS completion follows durable handling;
// no automatic HTTP request, delivery loop or implicit private/business choice.
@available(iOS 15.0, *)
public final class TripChoiceNotificationDelegate: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    private let handler: TripChoiceResponseHandler
    private let onResult: @Sendable (TripChoiceHandlingResult) async -> Void
    public init(handler: TripChoiceResponseHandler, onResult: @escaping @Sendable (TripChoiceHandlingResult) async -> Void) {
        self.handler = handler; self.onResult = onResult; super.init()
    }
    public static func decode(category: String, action: String, values: [AnyHashable: Any]) -> TripChoiceResponse {
        guard category == TripChoiceNotifications.category else { return .unrelated }
        if action == UNNotificationDefaultActionIdentifier { return .opened }
        if action == UNNotificationDismissActionIdentifier { return .dismissed }
        let choice: TripChoice
        switch action {
        case TripChoiceNotifications.businessAction: choice = .business
        case TripChoiceNotifications.privateAction: choice = .private
        default: return .malformed
        }
        guard let context = TripChoicePayloadDecoder.context(values) else { return .malformed }
        return .choose(choice, context)
    }
    public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        let decoded = Self.decode(category: response.notification.request.content.categoryIdentifier,
                                  action: response.actionIdentifier, values: response.notification.request.content.userInfo)
        let result = await handler.handle(decoded)
        await onResult(result)
    }
    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        // No identity/route data exposed; only the already minimal choice content.
        notification.request.content.categoryIdentifier == TripChoiceNotifications.category ? [.banner, .sound] : []
    }
}
#endif
