import SwiftUI
import MapKit
import RitKompasCore

struct NativeTrialRouteMap: UIViewRepresentable {
    let points: [TrialPoint]
    func makeUIView(context: Context) -> MKMapView {
        let view = MKMapView(); view.delegate = context.coordinator
        view.showsUserLocation = false // Saved points only; never requests location itself.
        return view
    }
    func updateUIView(_ view: MKMapView, context: Context) {
        view.removeOverlays(view.overlays)
        var segments: [[CLLocationCoordinate2D]] = [], current: [CLLocationCoordinate2D] = []
        var previous: TrialPoint?
        for point in points {
            if let previous {
                let elapsed = point.time - previous.time
                let a = CLLocation(latitude: previous.location.latitude, longitude: previous.location.longitude)
                let b = CLLocation(latitude: point.location.latitude, longitude: point.location.longitude)
                if elapsed <= 0 || elapsed > 45 || b.distance(from: a) / Double(max(1, elapsed)) > 80 {
                    if current.count > 1 { segments.append(current) }; current = []
                }
            }
            current.append(CLLocationCoordinate2D(latitude: point.location.latitude, longitude: point.location.longitude))
            previous = point
        }
        if current.count > 1 { segments.append(current) }
        let overlays = segments.map { MKPolyline(coordinates: $0, count: $0.count) }
        view.addOverlays(overlays)
        let region = overlays.reduce(MKMapRect.null) { $0.union($1.boundingMapRect) }
        if !region.isNull {
            view.setVisibleMapRect(region, edgePadding: UIEdgeInsets(top: 40, left: 40, bottom: 40, right: 40), animated: false)
        } else if let first = points.first {
            view.setRegion(MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: first.location.latitude, longitude: first.location.longitude), latitudinalMeters: 500, longitudinalMeters: 500), animated: false)
        }
    }
    func makeCoordinator() -> Coordinator { Coordinator() }
    final class Coordinator: NSObject, MKMapViewDelegate {
        func mapView(_ mapView: MKMapView, rendererFor overlay: any MKOverlay) -> MKOverlayRenderer {
            guard let line = overlay as? MKPolyline else { return MKOverlayRenderer(overlay: overlay) }
            let renderer = MKPolylineRenderer(polyline: line)
            renderer.strokeColor = mapView.tintColor; renderer.lineWidth = 4
            return renderer
        }
    }
}
