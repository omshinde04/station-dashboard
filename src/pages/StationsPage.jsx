import { useEffect, useState, useMemo } from "react";
import axios from "../utils/axiosInstance";

const districtMap = {
    "71": "Kolhapur",
    "72": "Ratnagiri",
    "73": "Sindhudurg",
    "74": "Raigad",
    "75": "Thane",
    "76": "Palghar",
    "77": "Nashik",
    "78": "Dhule",
    "79": "Nandurbar",
    "80": "Jalgaon",
    "81": "Wardha",
    "82": "Gondia",
    "83": "Gadchiroli",
    "84": "Bhandara",
    "85": "Washim",
    "86": "Hingoli",
    "87": "Jalna",
    "88": "Ahilyanagar"
};

export default function StationsPage() {

    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [search, setSearch] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");
    const [bulkPreview, setBulkPreview] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        station_id: "",
        assigned_latitude: "",
        assigned_longitude: "",
        allowed_radius_meters: 300
    });

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchStations();

        // 🔄 Auto refresh every 2 minutes
        const interval = setInterval(() => {
            fetchStations();
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    function handleExcelUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Normalize keys
            const formatted = jsonData.map(row => ({
                station_id: String(row.station_id || row.StationID || "").trim(),
                assigned_latitude: Number(row.assigned_latitude || row.latitude),
                assigned_longitude: Number(row.assigned_longitude || row.longitude),
                allowed_radius_meters: Number(row.allowed_radius_meters || 300)
            }));

            setBulkPreview(formatted);
        };

        reader.readAsArrayBuffer(file);
    }

    async function handleBulkSubmit() {
        try {
            setUploading(true);

            await axios.post("/api/admin/stations/bulk", {
                stations: bulkPreview
            });

            setBulkPreview([]);
            fetchStations();

            alert("Bulk upload successful");

        } catch (err) {
            alert(err.response?.data?.message || "Bulk upload failed");
        } finally {
            setUploading(false);
        }
    }

    async function fetchStations() {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/stations");
            setStations(res.data.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    /* ================= CREATE ================= */
    async function handleSubmit() {
        try {
            await axios.post("/api/admin/stations", form);

            setForm({
                station_id: "",
                assigned_latitude: "",
                assigned_longitude: "",
                allowed_radius_meters: 300
            });

            fetchStations();
        } catch (err) {
            alert(err.response?.data?.message || "Create failed");
        }
    }

    /* ================= EDIT ================= */
    function startEdit(station) {
        setEditingId(station.station_id);
        setEditForm({ ...station });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({});
    }

    async function saveEdit() {
        try {
            await axios.put(`/api/admin/stations/${editingId}`, {
                assigned_latitude: editForm.assigned_latitude,
                assigned_longitude: editForm.assigned_longitude,
                allowed_radius_meters: editForm.allowed_radius_meters,
                status: editForm.status
            });

            setEditingId(null);
            fetchStations();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    }

    /* ================= DELETE ================= */
    async function deleteStation(id) {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete station ${id}?`
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/admin/stations/${id}`);
            fetchStations();
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    }

    /* ================= FILTER ================= */
    const filteredStations = useMemo(() => {
        return stations.filter(station => {
            const matchesSearch =
                station.station_id
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const districtCode = station.station_id.slice(0, 2);

            const matchesDistrict =
                selectedDistrict === "ALL" ||
                districtCode === selectedDistrict;

            return matchesSearch && matchesDistrict;
        });
    }, [stations, search, selectedDistrict]);

    return (
        <div className="space-y-6">

            <h2 className="text-2xl font-bold">Manage Stations</h2>

            {/* FILTER */}
            <div className="bg-white p-6 rounded-xl shadow flex gap-4">
                <input
                    placeholder="Search Station ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />

                <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="ALL">All Districts</option>
                    {Object.entries(districtMap).map(([code, name]) => (
                        <option key={code} value={code}>
                            {code} - {name}
                        </option>
                    ))}
                </select>
            </div>
            {/* ================= BULK UPLOAD ================= */}
            <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">
                    Bulk Upload Stations (Excel)
                </h3>

                <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="mb-4"
                />

                {bulkPreview.length > 0 && (
                    <>
                        <div className="max-h-60 overflow-auto border rounded mb-4">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2">Station ID</th>
                                        <th className="p-2">Latitude</th>
                                        <th className="p-2">Longitude</th>
                                        <th className="p-2">Radius</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulkPreview.map((row, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-2">{row.station_id}</td>
                                            <td className="p-2">{row.assigned_latitude}</td>
                                            <td className="p-2">{row.assigned_longitude}</td>
                                            <td className="p-2">{row.allowed_radius_meters}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={handleBulkSubmit}
                            disabled={uploading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded"
                        >
                            {uploading ? "Uploading..." : "Confirm Bulk Upload"}
                        </button>
                    </>
                )}
            </div>
            {/* ADD */}
            <div className="bg-white p-6 rounded-xl shadow">
                <div className="grid grid-cols-4 gap-4">
                    <input
                        placeholder="Station ID"
                        value={form.station_id}
                        onChange={e => setForm({ ...form, station_id: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        placeholder="Latitude"
                        value={form.assigned_latitude}
                        onChange={e => setForm({ ...form, assigned_latitude: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        placeholder="Longitude"
                        value={form.assigned_longitude}
                        onChange={e => setForm({ ...form, assigned_longitude: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        placeholder="Radius"
                        value={form.allowed_radius_meters}
                        onChange={e => setForm({ ...form, allowed_radius_meters: e.target.value })}
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded"
                >
                    Add Station
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">District</th>
                            <th className="p-3">Latitude</th>
                            <th className="p-3">Longitude</th>
                            <th className="p-3">Radius</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center p-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            filteredStations.map(s => {
                                const districtCode = s.station_id.slice(0, 2);

                                return (
                                    <tr key={s.station_id} className="border-t">

                                        <td className="p-3 font-semibold">
                                            {s.station_id}
                                        </td>

                                        <td className="p-3 text-slate-500">
                                            {districtMap[districtCode] || "Unknown"}
                                        </td>

                                        <td className="p-3">
                                            {editingId === s.station_id ? (
                                                <input
                                                    value={editForm.assigned_latitude}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            assigned_latitude: e.target.value
                                                        })
                                                    }
                                                    className="border p-1 rounded w-full"
                                                />
                                            ) : (
                                                s.assigned_latitude
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {editingId === s.station_id ? (
                                                <input
                                                    value={editForm.assigned_longitude}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            assigned_longitude: e.target.value
                                                        })
                                                    }
                                                    className="border p-1 rounded w-full"
                                                />
                                            ) : (
                                                s.assigned_longitude
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {editingId === s.station_id ? (
                                                <input
                                                    value={editForm.allowed_radius_meters}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            allowed_radius_meters: e.target.value
                                                        })
                                                    }
                                                    className="border p-1 rounded w-full"
                                                />
                                            ) : (
                                                s.allowed_radius_meters
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {editingId === s.station_id ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            status: e.target.value
                                                        })
                                                    }
                                                    className="border p-1 rounded w-full"
                                                >
                                                    <option value="INSIDE">INSIDE</option>
                                                    <option value="OUTSIDE">OUTSIDE</option>
                                                    <option value="OFFLINE">OFFLINE</option>
                                                </select>
                                            ) : (
                                                s.status
                                            )}
                                        </td>

                                        <td className="p-3 space-x-2">
                                            {editingId === s.station_id ? (
                                                <>
                                                    <button
                                                        onClick={saveEdit}
                                                        className="bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="bg-slate-300 px-3 py-1 rounded text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEdit(s)}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteStation(s.station_id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}