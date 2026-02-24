import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

let socket;

export function useStations(selectedDistrict, search) {
    const [stations, setStations] = useState({});
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        async function fetchStations() {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/stations/all`
            );
            const data = await res.json();

            const formatted = {};
            for (const station of data.data) {
                formatted[station.station_id] = {
                    stationId: station.station_id,
                    latitude: station.latitude,
                    longitude: station.longitude,
                    status: station.status || "OFFLINE",
                    lastSeen: station.updated_at
                        ? new Date(station.updated_at).getTime()
                        : null
                };
            }

            setStations(formatted);
        }

        fetchStations();
    }, []);

    useEffect(() => {
        socket = io(process.env.REACT_APP_API_URL);

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("locationUpdate", (data) => {
            setStations(prev => ({
                ...prev,
                [data.stationId]: {
                    ...prev[data.stationId],
                    ...data,
                    lastSeen: Date.now()
                }
            }));
        });

        return () => socket.disconnect();
    }, []);

    const stats = useMemo(() => {
        const values = Object.values(stations);
        return {
            total: values.length,
            inside: values.filter(s => s.status === "INSIDE").length,
            outside: values.filter(s => s.status === "OUTSIDE").length,
            offline: values.filter(s => s.status === "OFFLINE").length
        };
    }, [stations]);

    const sortedStations = useMemo(() => {
        return Object.values(stations).filter(s => {
            const matchesSearch =
                s.stationId?.toLowerCase().includes(search.toLowerCase());

            const districtCode = s.stationId?.slice(0, 2);
            const matchesDistrict =
                selectedDistrict === "ALL" ||
                districtCode === selectedDistrict;

            return matchesSearch && matchesDistrict;
        });
    }, [stations, search, selectedDistrict]);

    return { sortedStations, stats, connected };
}