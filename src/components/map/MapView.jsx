import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ stations }) {
    return (
        <div className="h-[calc(100vh-160px)] rounded-xl overflow-hidden shadow">
            <MapContainer
                center={[18.57515, 73.76544]}
                zoom={13}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {stations.map(station => {
                    if (!station.latitude) return null;

                    const color =
                        station.status === "OUTSIDE"
                            ? "#DC2626"
                            : station.status === "OFFLINE"
                                ? "#6B7280"
                                : "#16A34A";

                    return (
                        <CircleMarker
                            key={station.stationId}
                            center={[station.latitude, station.longitude]}
                            radius={12}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                        >
                            <Popup>
                                <strong>{station.stationId}</strong>
                                <br />
                                Status: {station.status}
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}