import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function StationCard({ station }) {
    const [open, setOpen] = useState(false);

    let statusLabel;
    let style;

    if (station.status === "OFFLINE") {
        statusLabel = "OFFLINE";
        style = {
            badge: "bg-slate-100 text-slate-600",
            border: "border-slate-400",
            dot: "bg-slate-500"
        };
    } else if (station.status === "OUTSIDE") {
        statusLabel = "OUTSIDE";
        style = {
            badge: "bg-red-100 text-red-700",
            border: "border-red-500",
            dot: "bg-red-500"
        };
    } else {
        statusLabel = "ONLINE";
        style = {
            badge: "bg-emerald-100 text-emerald-700",
            border: "border-emerald-500",
            dot: "bg-emerald-500"
        };
    }

    // 🔥 SAFE FORMATTERS
    const formattedLat =
        station.latitude != null
            ? Number(station.latitude).toFixed(6)
            : "—";

    const formattedLng =
        station.longitude != null
            ? Number(station.longitude).toFixed(6)
            : "—";

    const formattedDistance =
        station.distance != null
            ? `${Number(station.distance).toFixed(2)} m`
            : null;

    return (
        <div
            className={`
                bg-white rounded-2xl shadow-sm
                border-l-4 ${style.border}
                transition-all duration-300
                hover:shadow-md
            `}
        >
            {/* HEADER */}
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer flex justify-between items-center px-5 py-4"
            >
                <div className="flex items-center gap-3">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${style.dot} ${station.status !== "OFFLINE" ? "animate-pulse" : ""
                            }`}
                    ></span>

                    <h4 className="font-bold text-slate-900">
                        {station.stationId || "—"}
                    </h4>
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${style.badge}`}
                    >
                        {statusLabel}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${open ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </div>

            {/* COLLAPSIBLE */}
            <div
                className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
                `}
            >
                <div className="px-5 pb-5 border-t border-slate-100">

                    {/* Coordinates */}
                    <div className="mt-4 text-xs font-mono text-slate-600 space-y-1">
                        <div>
                            📍 <strong>Lat:</strong> {formattedLat}
                        </div>
                        <div>
                            📍 <strong>Lng:</strong> {formattedLng}
                        </div>
                    </div>

                    {/* Distance */}
                    {formattedDistance && (
                        <div className="mt-3 text-xs text-slate-500">
                            📏 <strong>Distance:</strong> {formattedDistance}
                        </div>
                    )}

                    {/* Assigned Area */}
                    <div className="mt-3 text-xs text-slate-600">
                        🎯 <span className="font-semibold">Assigned Area:</span>
                        <div className="text-slate-500 mt-1 leading-relaxed">
                            {station.assignedAddress || "Not configured"}
                        </div>
                    </div>

                    {/* Current Location */}
                    <div className="mt-3 text-xs text-slate-600">
                        🛰 <span className="font-semibold">Current Location:</span>
                        <div className="text-slate-500 mt-1 leading-relaxed">
                            {station.liveAddress || "Resolving..."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}