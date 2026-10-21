#if os(iOS)
import SwiftUI
// Non-personal, device-local appearance only. No account, address or choice.
public enum NativeAppearanceTheme: String, CaseIterable, Identifiable {
    case anthracite = "Anthracite", desert = "Desert"
    public static let storageKey = "ritkompas.appearance.v1"
    public var id: String { rawValue }
    public var scheme: ColorScheme { self == .desert ? .light : .dark }
    public var background: Color { self == .desert ? Color(red: 0.93, green: 0.89, blue: 0.82) : Color(red: 0.055, green: 0.075, blue: 0.075) }
    public var panel: Color { self == .desert ? Color(red: 0.98, green: 0.95, blue: 0.89) : Color(red: 0.10, green: 0.13, blue: 0.13) }
    public var text: Color { self == .desert ? Color(red: 0.14, green: 0.17, blue: 0.16) : .white }
    public var muted: Color { self == .desert ? Color(red: 0.35, green: 0.38, blue: 0.36) : Color(red: 0.65, green: 0.70, blue: 0.68) }
    public var accent: Color { self == .desert ? Color(red: 0.25, green: 0.29, blue: 0.28) : Color(red: 0.84, green: 0.76, blue: 0.62) }
    public var positive: Color { self == .desert ? Color(red: 0.25, green: 0.38, blue: 0.20) : Color(red: 0.60, green: 0.73, blue: 0.40) }
}
#endif
#if os(iOS)
private struct NativeFormAppearance: ViewModifier {
    @AppStorage(NativeAppearanceTheme.storageKey) private var stored = NativeAppearanceTheme.anthracite.rawValue
    @ViewBuilder func body(content: Content) -> some View {
        let theme = NativeAppearanceTheme(rawValue: stored) ?? .anthracite
        if #available(iOS 16.0, *) {
            content.scrollContentBackground(.hidden).background(theme.background)
                .foregroundColor(theme.text).tint(theme.accent).preferredColorScheme(theme.scheme)
        } else {
            content.background(theme.background).foregroundColor(theme.text)
                .tint(theme.accent).preferredColorScheme(theme.scheme)
        }
    }
}
public extension View {
    func nativeFormAppearance() -> some View { modifier(NativeFormAppearance()) }
}
#endif
