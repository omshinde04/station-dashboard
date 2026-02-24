import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function StationCard({ station }) {
    const [open, setOpen] = useState(false);
    const now = Date.now();

    // 🔥 Heartbeat check (2 minutes timeout)
    const isOnline =
        station.lastSeen && now - station.lastSeen < 120000;

    let statusLabel;
    let style;

    if (!isOnline) {
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

    return (
        <div
            className={`
        bg-white rounded-2xl shadow-sm
        border-l-4 ${style.border}
        transition-all duration-300
        hover:shadow-md
      `}
        >
            {/* 🔥 HEADER (Always Visible) */}
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer flex justify-between items-center px-5 py-4"
            >
                <div className="flex items-center gap-3">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${style.dot} ${isOnline ? "animate-pulse" : ""
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

            {/* 🔥 COLLAPSIBLE CONTENT */}
            <div
                className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
            >
                <div className="px-5 pb-5 border-t border-slate-100">

                    {/* COORDINATES */}
                    <div className="mt-4 text-xs font-mono text-slate-600 space-y-1">
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
                        <div className="mt-3 text-xs text-slate-500">
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
            </div>
        </div>
    );
}