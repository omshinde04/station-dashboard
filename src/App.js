import React, { useEffect, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Circle
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

let socket;

/* ===============================
   DISTRICT MAP
================================ */
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

function FitBounds({ stations }) {
  const map = useMap();

  useEffect(() => {
    const points = Object.values(stations)
      .filter(s => s.latitude && s.longitude)
      .map(s => [s.latitude, s.longitude]);

    if (points.length > 0) {
      map.flyToBounds(points, { padding: [80, 80] });
    }
  }, [stations, map]);

  return null;
}

function App() {

  const [stations, setStations] = useState({});
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());
  const offlineTimeoutRef = useRef({});

  /* ===============================
     LIVE CLOCK
  ================================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          formatted[station.station_id] = {
            stationId: station.station_id,
            latitude: station.latitude,
            longitude: station.longitude,
            assignedLatitude: station.assigned_latitude,
            assignedLongitude: station.assigned_longitude,
            allowedRadiusMeters: station.allowed_radius_meters,
            status: station.status || "OFFLINE",
            distance: station.distance_meters,
            lastSeen: station.updated_at
              ? new Date(station.updated_at).getTime()
              : null
          };
        }

        setStations(formatted);

      } catch (err) {
        console.error("Failed to fetch stations:", err);
      }
    }

    fetchStations();
  }, []);

  /* ===============================
     SOCKET
  ================================= */
  useEffect(() => {

    socket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"]
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("locationUpdate", (data) => {

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
          allowedRadiusMeters,
          lastSeen: Date.now()
        }
      }));

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

    return () => socket?.disconnect();

  }, []);

  /* ===============================
     GLOBAL STATS
  ================================= */
  const stats = useMemo(() => {
    const values = Object.values(stations);
    return {
      total: values.length,
      inside: values.filter(s => s.status === "INSIDE").length,
      outside: values.filter(s => s.status === "OUTSIDE").length,
      offline: values.filter(s => s.status === "OFFLINE").length
    };
  }, [stations]);

  /* ===============================
     DISTRICT GROUPING
  ================================= */
  const groupedByDistrict = useMemo(() => {

    const grouped = {};

    Object.values(stations)
      .filter(s =>
        s.stationId?.toString().includes(search)
      )
      .forEach(station => {

        const code = station.stationId.toString().slice(0, 2);
        const districtName = districtMap[code] || "Unknown";

        if (!grouped[code]) {
          grouped[code] = {
            districtName,
            stations: [],
            stats: {
              total: 0,
              inside: 0,
              outside: 0,
              offline: 0
            }
          };
        }

        grouped[code].stations.push(station);
        grouped[code].stats.total++;

        if (station.status === "INSIDE") grouped[code].stats.inside++;
        if (station.status === "OUTSIDE") grouped[code].stats.outside++;
        if (station.status === "OFFLINE") grouped[code].stats.offline++;
      });

    return grouped;

  }, [stations, search]);

  /* ===============================
     RENDER
  ================================= */
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>

      {/* HEADER */}
      <div style={{
        background: "#111827",
        padding: "15px 25px",
        color: "white",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <div>
          <h2 style={{ margin: 0 }}>🚀 GeoSentinel Command Center</h2>
          <div style={{ fontSize: 12, color: connected ? "#22c55e" : "#ef4444" }}>
            {connected ? "● Connected" : "● Disconnected"}
          </div>
        </div>

        <div>
          <input
            placeholder="Search Station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: "none" }}
          />
          <div>{time.toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex" }}>

        {/* MAP */}
        <div style={{ flex: 3 }}>
          <MapContainer
            center={[18.57515, 73.76544]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds stations={stations} />

            {Object.values(groupedByDistrict)
              .flatMap(group => group.stations)
              .map(station => {

                if (!station.latitude || !station.longitude) return null;

                let color = "#22c55e";
                if (station.status === "OUTSIDE") color = "#ef4444";
                if (station.status === "OFFLINE") color = "#6b7280";

                return (
                  <CircleMarker
                    key={station.stationId}
                    center={[station.latitude, station.longitude]}
                    radius={12}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                  >
                    <Popup>
                      <strong>{station.stationId}</strong><br />
                      Status: {station.status}
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>

        {/* SIDE PANEL */}
        <div style={{
          flex: 1,
          background: "#111827",
          color: "white",
          padding: 20,
          overflowY: "auto"
        }}>
          <h3>📡 Overview</h3>

          <StatCard title="Total" value={stats.total} color="#3b82f6" />
          <StatCard title="Inside" value={stats.inside} color="#22c55e" />
          <StatCard title="Outside" value={stats.outside} color="#ef4444" />
          <StatCard title="Offline" value={stats.offline} color="#6b7280" />

          <hr style={{ margin: "20px 0", borderColor: "#374151" }} />

          {Object.entries(groupedByDistrict).map(([code, group]) => (
            <div key={code} style={{ marginBottom: 25 }}>
              <div style={{
                fontWeight: "bold",
                marginBottom: 8,
                borderBottom: "1px solid #374151",
                paddingBottom: 5
              }}>
                📍 {group.districtName} ({code}) —
                {group.stats.total} Stations
              </div>

              {group.stations.map(station => (
                <div key={station.stationId}
                  style={{
                    padding: 10,
                    background: "#1f2937",
                    borderRadius: 8,
                    marginBottom: 8
                  }}>
                  🚀 {station.stationId} — {station.status}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: "#1f2937",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderTop: `3px solid ${color}`
    }}>
      <div style={{ fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default App;