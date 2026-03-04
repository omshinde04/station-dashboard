import { useState, useMemo, useEffect } from "react";
import StationCard from "./StationCard";
import { Search } from "lucide-react";

export default function StationList({ stations = [], onFocus }) {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 6;

    /* ===============================
       PRIORITY SORT
    =============================== */

    const sortedStations = useMemo(() => {

        const priority = {
            OUTSIDE: 1,
            OFFLINE: 2,
            INSIDE: 3
        };

        return [...stations].sort(
            (a, b) => (priority[a.status] || 4) - (priority[b.status] || 4)
        );

    }, [stations]);

    /* ===============================
       FILTER + SEARCH
    =============================== */

    const filteredStations = useMemo(() => {

        return sortedStations.filter((s) => {

            const matchSearch =
                s.stationId?.toLowerCase().includes(search.toLowerCase());

            const matchFilter =
                filter === "ALL" ||
                (filter === "ONLINE" && s.status === "INSIDE") ||
                (filter === "OUTSIDE" && s.status === "OUTSIDE") ||
                (filter === "OFFLINE" && s.status === "OFFLINE");

            return matchSearch && matchFilter;

        });

    }, [sortedStations, search, filter]);

    /* ===============================
       RESET PAGE WHEN FILTER CHANGES
    =============================== */

    useEffect(() => {
        setPage(1);
    }, [filter, search]);

    /* ===============================
       PAGINATION
    =============================== */

    const totalPages = Math.ceil(filteredStations.length / PAGE_SIZE);

    const paginatedStations = useMemo(() => {

        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        return filteredStations.slice(start, end);

    }, [filteredStations, page]);

    /* ===============================
       UI
    =============================== */

    return (
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 flex flex-col h-[640px]">

            {/* ================= HEADER ================= */}

            <div className="px-5 py-4 border-b bg-white sticky top-0 z-10">

                <div className="flex justify-between items-center mb-3">

                    <h3 className="text-sm font-bold text-slate-900">
                        Station Activity
                    </h3>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        {filteredStations.length} Results
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-400"
                    />

                </div>

                {/* FILTER BUTTONS */}

                <div className="flex gap-2 flex-wrap">

                    {["ALL", "ONLINE", "OUTSIDE", "OFFLINE"].map((f) => (

                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                                text-[11px] px-3 py-1 rounded-full font-semibold transition
                                ${filter === f
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
                            `}
                        >
                            {f}

                        </button>

                    ))}

                </div>

            </div>

            {/* ================= LIST ================= */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

                {paginatedStations.length === 0 && (

                    <div className="text-center text-slate-400 py-20">

                        <div className="text-3xl mb-2">📡</div>

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

            {/* ================= PAGINATION ================= */}

            {totalPages > 1 && (

                <div className="flex justify-between items-center px-4 py-3 border-t bg-slate-50 text-xs">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 rounded-lg bg-white ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="font-semibold text-slate-600">
                        Page {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded-lg bg-white ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}

        </div>
    );
}