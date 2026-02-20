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

const socket = io("http://localhost:5001", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 3000
});

// ===============================
// Reverse Geocode Cache
// ===============================
const addressCache = {};

async function getAddress(lat, lng) {
  const key = `${lat.toFixed(4)}-${lng.toFixed(4)}`;
  if (addressCache[key]) return addressCache[key];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    const address = data.display_name || "Unknown location";
    addressCache[key] = address;
    return address;
  } catch {
    return "Unknown location";
  }
}

// ===============================
// Auto Fit Bounds
// ===============================
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

// ===============================
// MAIN DASHBOARD
// ===============================
function App() {

  const [stations, setStations] = useState({});
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);
  const fetchingRef = useRef({});

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===============================
  // SOCKET EVENTS
  // ===============================
  useEffect(() => {

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("locationUpdate", async (data) => {

      const {
        stationId,
        latitude,
        longitude,
        assignedLatitude,
        assignedLongitude
      } = data;

      let liveAddress = "";
      let assignedAddress = "";

      if (!fetchingRef.current[stationId]) {
        fetchingRef.current[stationId] = true;

        if (latitude && longitude)
          liveAddress = await getAddress(latitude, longitude);

        if (assignedLatitude && assignedLongitude)
          assignedAddress = await getAddress(assignedLatitude, assignedLongitude);

        fetchingRef.current[stationId] = false;
      }

      setStations(prev => ({
        ...prev,
        [stationId]: {
          ...prev[stationId],
          ...data,
          liveAddress,
          assignedAddress,
          lastSeen: new Date()
        }
      }));
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
      socket.off("locationUpdate");
      socket.off("statusUpdate");
    };

  }, []);

  // ===============================
  // AUTO OFFLINE DETECTION (FRONTEND SAFETY)
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => {
        const updated = { ...prev };

        Object.values(updated).forEach(station => {
          if (station.lastSeen) {
            const diff = (new Date() - new Date(station.lastSeen)) / 1000;
            if (diff > 120) station.status = "OFFLINE";
          }
        });

        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // STATS
  // ===============================
  const stats = useMemo(() => {
    const values = Object.values(stations);
    return {
      total: values.length,
      inside: values.filter(s => s.status === "INSIDE").length,
      outside: values.filter(s => s.status === "OUTSIDE").length,
      offline: values.filter(s => s.status === "OFFLINE").length
    };
  }, [stations]);

  // ===============================
  // SORT BY PRIORITY
  // ===============================
  const sortedStations = useMemo(() => {
    const priority = { OUTSIDE: 1, OFFLINE: 2, INSIDE: 3 };
    return Object.values(stations)
      .filter(s => s.stationId?.toString().includes(search))
      .sort((a, b) => priority[a.status] - priority[b.status]);
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
          <div style={{ fontSize: "12px", color: connected ? "#22c55e" : "#ef4444" }}>
            {connected ? "● Connected to Server" : "● Disconnected"}
          </div>
        </div>

        <div>
          <input
            placeholder="Search Station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "none",
              marginRight: "20px"
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

            {sortedStations.map((station, index) => {

              if (!station.latitude || !station.longitude) return null;

              let color = "#22c55e";
              if (station.status === "OUTSIDE") color = "#ef4444";
              if (station.status === "OFFLINE") color = "#6b7280";

              return (
                <React.Fragment key={index}>

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
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.9
                    }}
                  >
                    <Popup>
                      <strong>Station:</strong> {station.stationId}<br />
                      <strong>Status:</strong> {station.status}<br />
                      <strong>Distance:</strong> {station.distance || 0} m<br />
                      <hr />
                      <strong>Live:</strong><br />
                      {station.liveAddress || "Loading..."}<br />
                      <hr />
                      <strong>Assigned:</strong><br />
                      {station.assignedAddress || "Not configured"}
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
          padding: "20px",
          overflowY: "auto"
        }}>

          <h3>📡 Live Overview</h3>

          <StatCard title="Total" value={stats.total} color="#3b82f6" />
          <StatCard title="Inside" value={stats.inside} color="#22c55e" />
          <StatCard title="Outside" value={stats.outside} color="#ef4444" />
          <StatCard title="Offline" value={stats.offline} color="#6b7280" />

          <hr style={{ margin: "20px 0", borderColor: "#374151" }} />

          {sortedStations.map((station, index) => (
            <div key={index} style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "10px",
              borderLeft: `5px solid ${station.status === "OUTSIDE"
                ? "#ef4444"
                : station.status === "OFFLINE"
                  ? "#6b7280"
                  : "#22c55e"
                }`
            }}>
              <div style={{ fontWeight: "bold" }}>
                {station.stationId}
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                {station.status}
              </div>
              <div style={{ fontSize: "12px" }}>
                📍 {station.liveAddress || "Loading..."}
              </div>
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
      padding: "15px",
      borderRadius: "10px",
      textAlign: "center",
      borderTop: `4px solid ${color}`,
      marginBottom: "10px"
    }}>
      <div style={{ fontSize: "13px", color: "#9ca3af" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default App;