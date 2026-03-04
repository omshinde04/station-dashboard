import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";

export default function StationCard({ station, onFocus }) {

    const [open, setOpen] = useState(false);

    const statusConfig = {
        OFFLINE: {
            label: "OFFLINE",
            badge: "bg-slate-100 text-slate-600",
            border: "border-slate-400",
            dot: "bg-slate-500"
        },
        OUTSIDE: {
            label: "OUTSIDE",
            badge: "bg-red-100 text-red-700",
            border: "border-red-500",
            dot: "bg-red-500"
        },
        INSIDE: {
            label: "ONLINE",
            badge: "bg-emerald-100 text-emerald-700",
            border: "border-emerald-500",
            dot: "bg-emerald-500"
        }
    };

    const config = statusConfig[station.status] || statusConfig.INSIDE;

    const formattedTime =
        station.updated_at
            ? new Date(station.updated_at).toLocaleTimeString("en-IN")
            : "—";

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border-l-4 ${config.border} hover:shadow-md transition`}
        >

            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer flex justify-between items-center px-4 py-3"
            >

                <div className="flex items-center gap-3">

                    <span
                        className={`h-2.5 w-2.5 rounded-full ${config.dot} ${station.status !== "OFFLINE" ? "animate-pulse" : ""}`}
                    />

                    <div className="flex flex-col leading-tight">

                        <span className="font-semibold text-sm">
                            {station.stationId}
                        </span>

                        <span className="text-[10px] text-slate-400">
                            {formattedTime}
                        </span>

                    </div>

                </div>

                <div className="flex items-center gap-2">

                    {station.latitude && (

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFocus && onFocus(station);
                            }}
                            className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                        >
                            <MapPin size={12} />
                            Locate
                        </button>

                    )}

                    <span
                        className={`text-[9px] px-2 py-1 rounded-full font-semibold ${config.badge}`}
                    >
                        {config.label}
                    </span>

                    <ChevronDown
                        size={14}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />

                </div>

            </div>

        </div>
    );
}