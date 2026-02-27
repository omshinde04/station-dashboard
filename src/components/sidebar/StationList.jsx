import StationCard from "./StationCard";

export default function StationList({ stations = [], onFocus }) {
    const total = stations.length;

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm ring-1 ring-slate-200/60 flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200/60 sticky top-0 bg-white/80 backdrop-blur-xl rounded-t-2xl">
                <h3 className="text-sm font-bold tracking-wide text-slate-900">
                    Station Activity
                </h3>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    {total} Active
                </span>
            </div>

            {/* LIST BODY */}
            <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[520px] custom-scrollbar">

                {total === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            📡
                        </div>
                        <p className="text-sm font-medium">
                            No Stations Found
                        </p>
                        <p className="text-xs mt-1">
                            Try changing filters or search input
                        </p>
                    </div>
                )}

                {stations.map((station) => (
                    <div
                        key={station.stationId}
                        className="transition-all duration-300 hover:scale-[1.01]"
                    >
                        <StationCard
                            station={station}
                            onFocus={onFocus}
                        />
                    </div>
                ))}

            </div>
        </div>
    );
}