import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";

export default function LogsPage() {

    const [stationId, setStationId] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    /* ===============================
       FETCH LOGS (STABLE FUNCTION)
    ================================= */
    const fetchLogs = useCallback(async () => {

        if (!stationId) return;

        try {
            const res = await axios.get("/api/logs", {
                params: {
                    stationId,
                    page,
                    limit,
                    from,
                    to,
                    status
                }
            });

            setLogs(res.data.data);
            setTotalPages(res.data.totalPages);

        } catch (err) {
            console.error("Fetch logs error:", err);
        }

    }, [stationId, page, limit, from, to, status]);

    /* ===============================
       AUTO FETCH WHEN PAGE CHANGES
    ================================= */
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="space-y-6">

            <h2 className="text-2xl font-bold text-slate-800">
                Station Location Logs
            </h2>

            {/* ================= FILTERS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl shadow">

                <input
                    placeholder="Station ID"
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Status</option>
                    <option value="INSIDE">INSIDE</option>
                    <option value="OUTSIDE">OUTSIDE</option>
                </select>

                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                />

                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                />

                <button
                    onClick={() => {
                        setPage(1);
                        fetchLogs();
                    }}
                    className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm"
                >
                    Apply
                </button>
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Latitude</th>
                            <th className="px-4 py-3">Longitude</th>
                            <th className="px-4 py-3">Distance (m)</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-t">
                                <td className="px-4 py-3">
                                    {new Date(log.recorded_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">{log.latitude}</td>
                                <td className="px-4 py-3">{log.longitude}</td>
                                <td className="px-4 py-3">{log.distance_meters}</td>
                                <td className={`px-4 py-3 font-semibold ${log.status === "OUTSIDE"
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                    }`}>
                                    {log.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="flex justify-between items-center">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>

                <span className="text-sm">
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>

        </div>
    );
}