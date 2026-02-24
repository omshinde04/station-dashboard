import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

let socket;
const addressCache = new Map();

async function reverseGeocode(lat, lng) {
    if (!lat || !lng) return "";

    const key = `${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (addressCache.has(key)) return addressCache.get(key);

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const address = data.display_name || "Unknown location";
        addressCache.set(key, address);
        return address;
    } catch {
        return "Unknown location";
    }
}

export function useStations(selectedDistrict, search) {
    const [stations, setStations] = useState({});
    const [connected, setConnected] = useState(false);
    const offlineTimeoutRef = useRef({});

    /* ===============================
       INITIAL FETCH
    ================================= */
    useEffect(() => {
        async function fetchStations() {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/stations/all`
                );

                const data = await res.json();
                const formatted = {};

                for (const station of data.data) {
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
                        status: station.status || "OFFLINE",
                        distance: station.distance_meters,
                        liveAddress,
                        assignedAddress,
                        lastSeen: station.updated_at
                            ? new Date(station.updated_at).getTime()
                            : null
                    };
                }

                setStations(formatted);

            } catch (err) {
                console.error("Fetch stations error:", err);
            }
        }

        fetchStations();
    }, []);

    /* ===============================
       SOCKET CONNECTION
    ================================= */
    useEffect(() => {
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

            // Instant UI update
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
                    allowedRadiusMeters,
                    liveAddress: prev[stationId]?.liveAddress || "Resolving...",
                    assignedAddress: prev[stationId]?.assignedAddress || "Resolving...",
                    lastSeen: Date.now()
                }
            }));

            // Resolve addresses in background
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

            // Auto offline after 2 mins no update
            if (offlineTimeoutRef.current[stationId]) {
                clearTimeout(offlineTimeoutRef.current[stationId]);
            }

            offlineTimeoutRef.current[stationId] = setTimeout(() => {
                setStations(prev => ({
                    ...prev,
                    [stationId]: {
                        ...prev[stationId],
                        status: "OFFLINE"
                    }
                }));
            }, 120000);
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

        const now = Date.now();

        const online = values.filter(
            s => s.lastSeen && now - s.lastSeen < 120000   // 2 minutes
        ).length;

        return {
            total: values.length,
            online,
            inside: values.filter(s => s.status === "INSIDE").length,
            outside: values.filter(s => s.status === "OUTSIDE").length,
            offline: values.filter(s => s.status === "OFFLINE").length
        };
    }, [stations]);
    /* ===============================
       FILTER + SORT
    ================================= */
    const sortedStations = useMemo(() => {
        const priority = { OUTSIDE: 1, OFFLINE: 2, INSIDE: 3 };

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
            .sort((a, b) => (priority[a.status] || 4) - (priority[b.status] || 4));
    }, [stations, search, selectedDistrict]);

    return { sortedStations, stats, connected };
}