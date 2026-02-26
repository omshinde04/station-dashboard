import { useState, useCallback } from "react";
import axios from "../utils/axiosInstance";

export default function LogsPage() {

    const [stationId, setStationId] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [logs, setLogs] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const limit = 20;

    const fetchLogs = useCallback(async (reset = false) => {

        if (!stationId) return;

        try {
            setLoading(true);

            const lastTime = !reset && logs.length
                ? logs[logs.length - 1].recorded_at
                : null;

            const res = await axios.get("/api/logs", {
                params: {
                    stationId,
                    from,
                    to,
                    status,
                    limit,
                    lastTime
                }
            });

            if (reset) {
                setLogs(res.data.data);
            } else {
                setLogs(prev => [...prev, ...res.data.data]);
            }

            setHasMore(res.data.hasMore);

        } catch (err) {
            console.error("Fetch logs error:", err);
        } finally {
            setLoading(false);
        }

    }, [stationId, from, to, status, logs]);

    return (
        <div className="space-y-6">

            <h2 className="text-2xl font-bold text-slate-800">
                Station Location Logs
            </h2>

            {/* FILTERS */}
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
                    onClick={() => fetchLogs(true)}
                    className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm"
                >
                    Apply
                </button>
            </div>

            {/* TABLE */}
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

            {hasMore && (
                <div className="flex justify-center">
                    <button
                        onClick={() => fetchLogs(false)}
                        disabled={loading}
                        className="px-6 py-2 bg-slate-200 rounded-lg"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}