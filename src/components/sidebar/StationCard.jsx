export default function StationCard({ station }) {
    const statusColors = {
        INSIDE: {
            badge: "bg-emerald-100 text-emerald-700",
            border: "border-emerald-500"
        },
        OUTSIDE: {
            badge: "bg-red-100 text-red-700",
            border: "border-red-500"
        },
        OFFLINE: {
            badge: "bg-slate-100 text-slate-600",
            border: "border-slate-400"
        }
    };

    const style = statusColors[station.status] || statusColors.OFFLINE;

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
                    {station.stationId}
                </h4>

                <span className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${style.badge}`}>
                    {station.status}
                </span>
            </div>

            {/* COORDINATES */}
            <div className="text-xs font-mono text-slate-600 space-y-1">
                <div>
                    📍 <strong>Lat:</strong> {station.latitude?.toFixed(6) || "—"}
                </div>
                <div>
                    📍 <strong>Lng:</strong> {station.longitude?.toFixed(6) || "—"}
                </div>
            </div>

            {/* DISTANCE */}
            {station.distance !== undefined && (
                <div className="mt-2 text-xs text-slate-500">
                    📏 <strong>Distance:</strong> {station.distance || 0} m
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