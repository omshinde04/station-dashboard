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

/* ===============================
   SOCKET INSTANCE (lazy + safe)
================================ */
let socket;

/* ===============================
   Reverse Geocode (Rate Safe)
================================ */
const addressCache = new Map();

async function reverseGeocode(lat, lng) {
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

/* ===============================
   Auto Fit Bounds
================================ */
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

/* ===============================
   MAIN COMPONENT
================================ */
function App() {

  const [stations, setStations] = useState({});
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());

  const offlineTimeoutRef = useRef({});

  /* ===============================
     Live Clock
  ================================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===============================
     SOCKET LIFECYCLE
  ================================= */
  useEffect(() => {

    socket = io(process.env.REACT_APP_API_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      transports: ["websocket"]
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

      let liveAddress = "";
      let assignedAddress = "";

      if (latitude && longitude)
        liveAddress = await reverseGeocode(latitude, longitude);

      if (assignedLatitude && assignedLongitude)
        assignedAddress = await reverseGeocode(
          assignedLatitude,
          assignedLongitude
        );

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
          liveAddress,
          assignedAddress,
          lastSeen: Date.now()
        }
      }));

      /* Offline Reset Timer */
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
      }, 120000); // 2 min
    });

    socket.on("statusUpdate", (data) => {
      setStations(prev => ({
        ...prev,
        [data.stationId]: {
          ...prev[data.stationId],
          status: data.status
        }
      }));
    });

    return () => {
      socket.disconnect();
    };

  }, []);

  /* ===============================
     STATS
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
     SORT + FILTER
  ================================= */
  const sortedStations = useMemo(() => {
    const priority = { OUTSIDE: 1, OFFLINE: 2, INSIDE: 3 };
    return Object.values(stations)
      .filter(s =>
        s.stationId?.toString().toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (priority[a.status] || 4) - (priority[b.status] || 4));
  }, [stations, search]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>

      {/* HEADER */}
      <div style={{
        background: "#111827",
        padding: "15px 25px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
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
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              marginRight: 20
            }}
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

            {sortedStations.map((station) => {
              if (!station.latitude || !station.longitude) return null;

              let color = "#22c55e";
              if (station.status === "OUTSIDE") color = "#ef4444";
              if (station.status === "OFFLINE") color = "#6b7280";

              return (
                <React.Fragment key={station.stationId}>

                  {station.assignedLatitude && (
                    <Circle
                      center={[station.assignedLatitude, station.assignedLongitude]}
                      radius={station.allowedRadiusMeters || 300}
                      pathOptions={{ color: "#3b82f6", fillOpacity: 0.05 }}
                    />
                  )}

                  <CircleMarker
                    center={[station.latitude, station.longitude]}
                    radius={14}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                  >
                    <Popup>
                      <strong>Station:</strong> {station.stationId}<br />
                      <strong>Status:</strong> {station.status}<br />
                      <strong>Distance:</strong> {station.distance || 0} m<br />
                      <strong>Latitude:</strong> {station.latitude}<br />
                      <strong>Longitude:</strong> {station.longitude}<br />
                      <hr />
                      <strong>Live:</strong><br />
                      {station.liveAddress}<br />
                      <hr />
                      <strong>Assigned:</strong><br />
                      {station.assignedAddress}
                    </Popup>
                  </CircleMarker>

                </React.Fragment>
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
          <h3 style={{ marginBottom: 15 }}>📡 Live Overview</h3>

          <StatCard title="Total" value={stats.total} color="#3b82f6" />
          <StatCard title="Inside" value={stats.inside} color="#22c55e" />
          <StatCard title="Outside" value={stats.outside} color="#ef4444" />
          <StatCard title="Offline" value={stats.offline} color="#6b7280" />

          <hr style={{ margin: "20px 0", borderColor: "#374151" }} />

          {sortedStations.map((station) => {

            let borderColor = "#22c55e";
            if (station.status === "OUTSIDE") borderColor = "#ef4444";
            if (station.status === "OFFLINE") borderColor = "#6b7280";

            return (
              <div key={station.stationId} style={{
                background: "#1f2937",
                padding: 16,
                borderRadius: 12,
                marginBottom: 15,
                borderLeft: `5px solid ${borderColor}`,
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
              }}>

                {/* Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8
                }}>
                  <div style={{ fontWeight: "bold", fontSize: 15 }}>
                    🚀 {station.stationId}
                  </div>
                  <div style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: borderColor,
                    color: "white"
                  }}>
                    {station.status}
                  </div>
                </div>

                {/* Coordinates */}
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  📍 <strong>Lat:</strong> {station.latitude?.toFixed(6)}
                  <br />
                  📍 <strong>Lng:</strong> {station.longitude?.toFixed(6)}
                </div>

                {/* Distance */}
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  📏 <strong>Distance:</strong> {station.distance || 0} m
                </div>

                {/* Assigned Location */}
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  🎯 <strong>Assigned Area:</strong><br />
                  {station.assignedAddress || "Not configured"}
                </div>

                {/* Live Address */}
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  🛰 <strong>Current Location:</strong><br />
                  {station.liveAddress || "Resolving..."}
                </div>

                {/* Last Seen */}
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  ⏱ Last Update:{" "}
                  {station.lastSeen
                    ? new Date(station.lastSeen).toLocaleTimeString()
                    : "—"}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: "#1f2937",
      padding: 15,
      borderRadius: 10,
      textAlign: "center",
      borderTop: `4px solid ${color}`,
      marginBottom: 10
    }}>
      <div style={{ fontSize: 13, color: "#9ca3af" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default App;