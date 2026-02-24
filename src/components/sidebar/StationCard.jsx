export default function StationCard({ station }) {
    const now = Date.now();

    // 🔥 Heartbeat check (2 minutes timeout)
    const isOnline =
        station.lastSeen && now - station.lastSeen < 120000;

    // 🔥 Final status logic
    let statusLabel;
    let style;

    if (!isOnline) {
        statusLabel = "OFFLINE";
        style = {
            badge: "bg-slate-100 text-slate-600",
            border: "border-slate-400"
        };
    } else if (station.status === "OUTSIDE") {
        statusLabel = "OUTSIDE";
        style = {
            badge: "bg-red-100 text-red-700",
            border: "border-red-500"
        };
    } else {
        statusLabel = "INSIDE";
        style = {
            badge: "bg-emerald-100 text-emerald-700",
            border: "border-emerald-500"
        };
    }

    return (
        <div
            className={`
        bg-white rounded-2xl p-5 shadow-sm
        border-l-4 ${style.border}
        transition-all duration-300
        hover:shadow-md hover:-translate-y-[2px]
      `}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-900 tracking-tight">
                    {station.stationId || "—"}
                </h4>

                <span
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${style.badge}`}
                >
                    {statusLabel}
                </span>
            </div>

            {/* COORDINATES */}
            <div className="text-xs font-mono text-slate-600 space-y-1">
                <div>
                    📍 <strong>Lat:</strong>{" "}
                    {station.latitude !== undefined
                        ? station.latitude.toFixed(6)
                        : "—"}
                </div>
                <div>
                    📍 <strong>Lng:</strong>{" "}
                    {station.longitude !== undefined
                        ? station.longitude.toFixed(6)
                        : "—"}
                </div>
            </div>

            {/* DISTANCE */}
            {station.distance !== undefined && (
                <div className="mt-2 text-xs text-slate-500">
                    📏 <strong>Distance:</strong> {station.distance} m
                </div>
            )}

            {/* ASSIGNED LOCATION */}
            <div className="mt-3 text-xs text-slate-600">
                🎯 <span className="font-semibold">Assigned Area:</span>
                <div className="text-slate-500 mt-1 leading-relaxed">
                    {station.assignedAddress || "Not configured"}
                </div>
            </div>

            {/* CURRENT LOCATION */}
            <div className="mt-3 text-xs text-slate-600">
                🛰 <span className="font-semibold">Current Location:</span>
                <div className="text-slate-500 mt-1 leading-relaxed">
                    {station.liveAddress || "Resolving..."}
                </div>
            </div>

            {/* LAST UPDATE */}
            <div className="mt-4 text-[10px] text-slate-400 border-t pt-3">
                ⏱ Last Update:{" "}
                {station.lastSeen
                    ? new Date(station.lastSeen).toLocaleTimeString()
                    : "—"}
            </div>
        </div>
    );
}