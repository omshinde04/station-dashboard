import { useState, useCallback, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { saveAs } from "file-saver";

export default function LogsPage() {

    const [stationId, setStationId] = useState("");
    const [status, setStatus] = useState("");
    const [timeRange, setTimeRange] = useState("24h"); // default
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [logs, setLogs] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const limit = 20;

    /* ===============================
       AUTO SET DEFAULT RANGE (24h)
    ================================= */
    useEffect(() => {
        applyQuickRange("24h");
    }, []);

    const applyQuickRange = (range) => {
        const now = new Date();
        let start = new Date();

        if (range === "1h") start.setHours(now.getHours() - 1);
        if (range === "6h") start.setHours(now.getHours() - 6);
        if (range === "24h") start.setHours(now.getHours() - 24);
        if (range === "7d") start.setDate(now.getDate() - 7);

        setTimeRange(range);
        setFrom(start.toISOString().slice(0, 16));
        setTo(now.toISOString().slice(0, 16));
    };

    /* ===============================
       CLEAR FILTERS
    ================================= */
    const clearFilters = () => {
        setStationId("");
        setStatus("");
        setLogs([]);
        setHasMore(false);
        applyQuickRange("24h");
    };

    /* ===============================
       FETCH LOGS
    ================================= */
    const fetchLogs = useCallback(async (reset = false) => {

        if (!stationId) {
            alert("Please enter Station ID");
            return;
        }

        try {
            setLoading(true);

            const lastTime =
                !reset && logs.length
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

            const newData = res.data?.data || [];

            if (reset) {
                setLogs(newData);
            } else {
                setLogs(prev => [...prev, ...newData]);
            }

            setHasMore(res.data?.hasMore || false);

        } catch (err) {
            console.error("Fetch logs error:", err);
        } finally {
            setLoading(false);
        }

    }, [stationId, from, to, status, logs]);

    /* ===============================
       EXPORT CSV
    ================================= */
    const exportXLS = async () => {

        if (!stationId) {
            alert("Station ID required for export");
            return;
        }

        try {
            setExporting(true);

            const res = await axios.get("/api/logs/export", {
                params: { stationId, from, to, status },
                responseType: "blob"
            });

            const blob = new Blob([res.data], { type: "text/csv" });
            saveAs(blob, `logs-${stationId}.csv`);

        } catch (err) {
            console.error("Export error:", err);
            alert("Export failed");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Station Location Logs
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Smart filtering with quick time ranges
                </p>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="bg-white p-6 rounded-2xl shadow ring-1 ring-slate-200 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

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

                    <button
                        onClick={() => fetchLogs(true)}
                        disabled={loading}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        {loading ? "Loading..." : "Apply"}
                    </button>

                    <button
                        onClick={clearFilters}
                        className="bg-slate-200 px-4 py-2 rounded-lg text-sm"
                    >
                        Reset
                    </button>
                </div>

                {/* QUICK TIME FILTERS */}
                <div className="flex gap-3 flex-wrap">
                    {["1h", "6h", "24h", "7d"].map(range => (
                        <button
                            key={range}
                            onClick={() => applyQuickRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm border 
                                ${timeRange === range
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100"
                                }`}
                        >
                            Last {range}
                        </button>
                    ))}
                </div>

                {/* CUSTOM DATE RANGE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="datetime-local"
                        value={from}
                        onChange={(e) => {
                            setTimeRange("custom");
                            setFrom(e.target.value);
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />

                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => {
                            setTimeRange("custom");
                            setTo(e.target.value);
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <button
                    onClick={exportXLS}
                    disabled={exporting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                    {exporting ? "Exporting..." : "Export CSV"}
                </button>

            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-2xl shadow overflow-x-auto ring-1 ring-slate-200">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Latitude</th>
                            <th className="px-4 py-3">Longitude</th>
                            <th className="px-4 py-3">Distance (m)</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-slate-400">
                                    No logs found in selected range
                                </td>
                            </tr>
                        )}

                        {logs.map(log => (
                            <tr key={log.id} className="border-t hover:bg-slate-50">
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