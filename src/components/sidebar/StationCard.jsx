export default function StationCard({ station }) {
    const statusColors = {
        INSIDE: "bg-emerald-100 text-emerald-700",
        OUTSIDE: "bg-red-100 text-red-700",
        OFFLINE: "bg-slate-100 text-slate-600"
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex justify-between mb-2">
                <h4 className="font-bold">{station.stationId}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[station.status]}`}>
                    {station.status}
                </span>
            </div>

            <div className="text-xs font-mono text-slate-600">
                {station.latitude?.toFixed(6)},
                {station.longitude?.toFixed(6)}
            </div>

            <div className="text-[10px] text-slate-400 mt-2">
                Last Update: {station.lastSeen
                    ? new Date(station.lastSeen).toLocaleTimeString()
                    : "—"}
            </div>
        </div>
    );
}