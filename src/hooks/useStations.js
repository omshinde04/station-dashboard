import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import axios from "../utils/axiosInstance";

let socket;
const addressCache = new Map();

/* ===============================
   REVERSE GEOCODE
================================= */
async function reverseGeocode(lat, lng) {
    if (!lat || !lng) return "";

    const key = `${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (addressCache.has(key)) return addressCache.get(key);

    try {
        const res = await axios.get("/api/geocode", {
            params: { lat, lng }
        });

        const address = res.data.display_name || "Unknown location";
        addressCache.set(key, address);
        return address;

    } catch {
        return "Unknown location";
    }
}

/* ===============================
   MAIN HOOK
================================= */
export function useStations(selectedDistrict, search) {

    const [stations, setStations] = useState({});
    const [connected, setConnected] = useState(false);

    /* ===============================
       INITIAL FETCH (PROTECTED)
    ================================= */
    useEffect(() => {

        const token = localStorage.getItem("token");
        if (!token) return; // ✅ Prevent API call if not logged in

        async function fetchStations() {
            try {
                const res = await axios.get("/api/stations/all");

                const stationList = res.data.data || [];
                const formatted = {};

                for (const station of stationList) {

                    let liveAddress = "";
                    let assignedAddress = "";

                    if (station.latitude && station.longitude) {
                        liveAddress = await reverseGeocode(
                            station.latitude,
                            station.longitude
                        );
                    }

                    if (station.assigned_latitude && station.assigned_longitude) {
                        assignedAddress = await reverseGeocode(
                            station.assigned_latitude,
                            station.assigned_longitude
                        );
                    }

                    formatted[station.station_id] = {
                        stationId: station.station_id,
                        latitude: station.latitude,
                        longitude: station.longitude,
                        assignedLatitude: station.assigned_latitude,
                        assignedLongitude: station.assigned_longitude,
                        allowedRadiusMeters: station.allowed_radius_meters,
                        status: station.status,
                        distance: station.distance_meters,
                        liveAddress,
                        assignedAddress
                    };
                }

                setStations(formatted);

            } catch (err) {
                console.error(
                    "Fetch stations error:",
                    err.response?.data || err.message
                );
            }
        }

        fetchStations();

    }, []);

    /* ===============================
       SOCKET CONNECTION
    ================================= */
    useEffect(() => {

        const token = localStorage.getItem("token");
        if (!token) return; // ✅ Prevent socket before login

        socket = io(process.env.REACT_APP_API_URL, {
            transports: ["websocket"],
            reconnection: true
        });

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("locationUpdate", async (data) => {

            const {
                stationId,
                latitude,
                longitude,
                status,
                distance,
                assignedLatitude,
                assignedLongitude,
                allowedRadiusMeters
            } = data;

            setStations(prev => ({
                ...prev,
                [stationId]: {
                    ...prev[stationId],
                    stationId,
                    latitude,
                    longitude,
                    status,
                    distance,
                    assignedLatitude,
                    assignedLongitude,
                    allowedRadiusMeters
                }
            }));

            const liveAddress = await reverseGeocode(latitude, longitude);
            const assignedAddress = await reverseGeocode(
                assignedLatitude,
                assignedLongitude
            );

            setStations(prev => ({
                ...prev,
                [stationId]: {
                    ...prev[stationId],
                    liveAddress,
                    assignedAddress
                }
            }));
        });

        return () => {
            if (socket) socket.disconnect();
        };

    }, []);

    /* ===============================
       STATS
    ================================= */
    const stats = useMemo(() => {

        const values = Object.values(stations);

        const inside = values.filter(s => s.status === "INSIDE").length;
        const outside = values.filter(s => s.status === "OUTSIDE").length;
        const offline = values.filter(s => s.status === "OFFLINE").length;

        const online = inside + outside;

        return {
            total: values.length,
            online,
            inside,
            outside,
            offline
        };

    }, [stations]);

    /* ===============================
       FILTER + SORT
    ================================= */
    const sortedStations = useMemo(() => {

        const priority = { OUTSIDE: 1, INSIDE: 2, OFFLINE: 3 };

        return Object.values(stations)
            .filter(s => {

                const matchesSearch =
                    s.stationId?.toLowerCase().includes(search.toLowerCase());

                const districtCode = s.stationId?.slice(0, 2);

                const matchesDistrict =
                    selectedDistrict === "ALL" ||
                    districtCode === selectedDistrict;

                return matchesSearch && matchesDistrict;

            })
            .sort((a, b) =>
                (priority[a.status] || 4) - (priority[b.status] || 4)
            );

    }, [stations, search, selectedDistrict]);

    return { sortedStations, stats, connected };
}