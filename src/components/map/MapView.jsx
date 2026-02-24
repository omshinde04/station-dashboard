import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ stations }) {
    return (
        <div className="relative z-0 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-lg">

            <MapContainer
                center={[18.57515, 73.76544]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {stations.map((station) => {
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
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.9
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="w-[260px]">

                                    {/* HEADER */}
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-slate-900 text-sm">
                                            🚀 {station.stationId}
                                        </h3>

                                        <span
                                            className={`text-[10px] px-2 py-1 rounded-full font-semibold
                        ${station.status === "INSIDE"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : station.status === "OUTSIDE"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {station.status}
                                        </span>
                                    </div>

                                    {/* COORDINATES */}
                                    <div className="text-xs font-mono text-slate-600 space-y-1">
                                        <div>
                                            📍 <strong>Lat:</strong>{" "}
                                            {station.latitude?.toFixed(6) || "—"}
                                        </div>
                                        <div>
                                            📍 <strong>Lng:</strong>{" "}
                                            {station.longitude?.toFixed(6) || "—"}
                                        </div>
                                    </div>

                                    {/* DISTANCE */}
                                    {station.distance !== undefined && (
                                        <div className="mt-2 text-xs text-slate-600">
                                            📏 <strong>Distance:</strong>{" "}
                                            {station.distance || 0} m
                                        </div>
                                    )}

                                    {/* ASSIGNED AREA */}
                                    <div className="mt-3 text-xs">
                                        <div className="font-semibold text-slate-700">
                                            🎯 Assigned Area
                                        </div>
                                        <div className="text-slate-500 leading-snug mt-1">
                                            {station.assignedAddress || "Not configured"}
                                        </div>
                                    </div>

                                    {/* CURRENT LOCATION */}
                                    <div className="mt-3 text-xs">
                                        <div className="font-semibold text-slate-700">
                                            🛰 Current Location
                                        </div>
                                        <div className="text-slate-500 leading-snug mt-1">
                                            {station.liveAddress || "Resolving..."}
                                        </div>
                                    </div>

                                    {/* LAST UPDATE */}
                                    <div className="mt-3 text-[10px] text-slate-400 border-t pt-2">
                                        ⏱ Last Update:{" "}
                                        {station.lastSeen
                                            ? new Date(station.lastSeen).toLocaleTimeString()
                                            : "—"}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}