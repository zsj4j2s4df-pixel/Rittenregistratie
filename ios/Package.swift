// swift-tools-version: 6.0
import PackageDescription

// Testable libraries for the existing source preparation; no second app target,
// signing configuration, entitlement or dependency download is introduced.
let package = Package(
    name: "RitKompasNative",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [
        .library(name: "RitKompasCore", targets: ["RitKompasCore"]),
        .library(name: "RitKompasPreparationUI", targets: ["RitKompasPreparationUI"])
    ],
    targets: [
        .target(name: "RitKompasCore", path: "RitKompas/Core"),
        .target(name: "RitKompasPreparationUI", dependencies: ["RitKompasCore"], path: "RitKompas/UI"),
        .testTarget(name: "RitKompasCoreTests", dependencies: ["RitKompasCore"], path: "RitKompas/Tests")
    ]
)
