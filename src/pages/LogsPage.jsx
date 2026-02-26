import { useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function LogsPage() {

    const [stationId, setStationId] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [logs, setLogs] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const limit = 20;

    /* ===============================
       FETCH LOGS
    ================================= */
    const fetchLogs = useCallback(async (reset = false) => {

        if (!stationId) {
            alert("Please enter Station ID");
            return;
        }

        if (from && to && from > to) {
            alert("From date cannot be after To date");
            return;
        }

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

    /* ===============================
       EXPORT XLS
    ================================= */
    const exportXLS = async () => {

        if (!stationId) {
            alert("Station ID required for export");
            return;
        }

        try {
            setExporting(true);

            const res = await axios.get("/api/logs/export", {
                params: { stationId, from, to, status }
            });

            const rows = res.data?.data || [];

            if (!rows.length) {
                alert("No logs available to export");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(blob, `logs-${stationId}.xlsx`);

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
                    Advanced filtering & Excel export
                </p>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="bg-white p-6 rounded-2xl shadow ring-1 ring-slate-200">

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

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
                        type="datetime-local"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />

                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />

                    <button
                        onClick={() => fetchLogs(true)}
                        disabled={loading}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Apply"}
                    </button>

                    <button
                        onClick={clearFilters}
                        className="bg-slate-200 px-4 py-2 rounded-lg text-sm"
                    >
                        Clear
                    </button>
                </div>

                <div className="mt-4">
                    <button
                        onClick={exportXLS}
                        disabled={exporting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>
                </div>
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
                                    No logs found
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
                        className="px-6 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}