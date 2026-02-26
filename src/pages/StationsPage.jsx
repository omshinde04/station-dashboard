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
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [search, setSearch] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");

    const [form, setForm] = useState({
        station_id: "",
        assigned_latitude: "",
        assigned_longitude: "",
        allowed_radius_meters: 300
    });

    useEffect(() => {
        fetchStations();
    }, []);

    async function fetchStations() {
        const res = await axios.get("/api/admin/stations");
        setStations(res.data.data || []);
    }

    async function handleSubmit() {
        await axios.post("/api/admin/stations", form);
        setForm({
            station_id: "",
            assigned_latitude: "",
            assigned_longitude: "",
            allowed_radius_meters: 300
        });
        fetchStations();
    }

    function startEdit(station) {
        setEditingId(station.station_id);
        setEditForm({ ...station });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({});
    }

    async function saveEdit() {
        await axios.put(`/api/admin/stations/${editingId}`, {
            assigned_latitude: editForm.assigned_latitude,
            assigned_longitude: editForm.assigned_longitude,
            allowed_radius_meters: editForm.allowed_radius_meters,
            status: editForm.status
        });

        setEditingId(null);
        fetchStations();
    }

    /* ================= FILTER LOGIC ================= */
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

            {/* ================= FILTER SECTION ================= */}
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

            {/* ================= ADD STATION ================= */}
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

            {/* ================= TABLE ================= */}
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
                        {filteredStations.map(s => {
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

                                    <td className="p-3">
                                        {editingId === s.station_id ? (
                                            <>
                                                <button
                                                    onClick={saveEdit}
                                                    className="bg-emerald-600 text-white px-3 py-1 rounded text-xs mr-2"
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
                                            <button
                                                onClick={() => startEdit(s)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}