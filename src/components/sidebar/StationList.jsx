import { useState, useMemo } from "react";
import StationCard from "./StationCard";
import { Search } from "lucide-react";

export default function StationList({ stations = [], onFocus }) {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 6;

    /* SORT BY PRIORITY */
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

    /* FILTER + SEARCH */

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

    /* PAGINATION */

    const totalPages = Math.ceil(filteredStations.length / PAGE_SIZE);

    const paginatedStations = filteredStations.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col">

            {/* HEADER */}
            <div className="px-5 py-4 border-b">

                <div className="flex justify-between items-center mb-3">

                    <h3 className="text-sm font-bold">
                        Station Activity
                    </h3>

                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100">
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

                {/* FILTERS */}

                <div className="flex gap-2">

                    {["ALL", "ONLINE", "OUTSIDE", "OFFLINE"].map((f) => (

                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(1);
                            }}
                            className={`text-[11px] px-3 py-1 rounded-full font-semibold
                                ${filter === f
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"}
                            `}
                        >
                            {f}
                        </button>

                    ))}

                </div>

            </div>

            {/* LIST */}

            <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[520px]">

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
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 rounded bg-slate-100 disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span>
                        Page {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 rounded bg-slate-100 disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}

        </div>
    );
}