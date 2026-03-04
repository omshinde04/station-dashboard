import { useState, useMemo } from "react";
import StationCard from "./StationCard";
import { Search } from "lucide-react";

export default function StationList({ stations = [], onFocus }) {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 6;

    /* ================= PRIORITY SORT ================= */

    const priority = {
        OUTSIDE: 1,
        OFFLINE: 2,
        INSIDE: 3
    };

    const sortedStations = useMemo(() => {
        return [...stations].sort(
            (a, b) => (priority[a.status] || 4) - (priority[b.status] || 4)
        );
    }, [stations]);

    /* ================= FILTER ================= */

    const filteredStations = useMemo(() => {

        return sortedStations.filter((s) => {

            const matchesSearch =
                s.stationId?.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "ALL" ||
                (filter === "ONLINE" && s.status === "INSIDE") ||
                (filter === "OUTSIDE" && s.status === "OUTSIDE") ||
                (filter === "OFFLINE" && s.status === "OFFLINE");

            return matchesSearch && matchesFilter;

        });

    }, [sortedStations, search, filter]);

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(filteredStations.length / PAGE_SIZE);

    const paginatedStations = filteredStations.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    /* ================= COUNTS ================= */

    const counts = useMemo(() => {

        let online = 0;
        let outside = 0;
        let offline = 0;

        stations.forEach((s) => {
            if (s.status === "INSIDE") online++;
            else if (s.status === "OUTSIDE") outside++;
            else if (s.status === "OFFLINE") offline++;
        });

        return { online, outside, offline };

    }, [stations]);

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm ring-1 ring-slate-200/60 flex flex-col">

            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-200/60 sticky top-0 bg-white/80 backdrop-blur-xl rounded-t-2xl">

                <div className="flex justify-between items-center mb-3">

                    <h3 className="text-sm font-bold text-slate-900">
                        Station Activity
                    </h3>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        {stations.length} Active
                    </span>

                </div>

                {/* SEARCH */}

                <div className="relative mb-3">

                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        placeholder="Search station..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-100 text-xs outline-none"
                    />

                </div>

                {/* FILTER TABS */}

                <div className="flex gap-2">

                    {[
                        { label: "ALL", count: stations.length },
                        { label: "ONLINE", count: counts.online },
                        { label: "OUTSIDE", count: counts.outside },
                        { label: "OFFLINE", count: counts.offline }
                    ].map((tab) => (

                        <button
                            key={tab.label}
                            onClick={() => {
                                setFilter(tab.label);
                                setPage(1);
                            }}
                            className={`
                                text-[11px] px-3 py-1 rounded-full font-semibold
                                ${filter === tab.label
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"}
                            `}
                        >
                            {tab.label} ({tab.count})
                        </button>

                    ))}

                </div>

            </div>

            {/* LIST BODY */}

            <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[480px] custom-scrollbar">

                {paginatedStations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">

                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            📡
                        </div>

                        <p className="text-sm font-medium">
                            No Stations Found
                        </p>

                    </div>
                )}

                {paginatedStations.map((station) => (

                    <StationCard
                        key={station.stationId}
                        station={station}
                        onFocus={onFocus}
                    />

                ))}

            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (

                <div className="flex justify-between items-center px-4 py-3 border-t text-xs">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 rounded bg-slate-100 disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span>
                        Page {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded bg-slate-100 disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}

        </div>
    );
}