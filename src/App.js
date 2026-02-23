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

//district 
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

function App() {

  const [stations, setStations] = useState({});
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());
  const offlineTimeoutRef = useRef({});
  // ADD THIS STATE inside App()
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");


  // ✅ ADD THIS FUNCTION HERE
  async function resolveAddressAsync(data) {
    const liveAddress = await reverseGeocode(data.latitude, data.longitude);
    const assignedAddress = await reverseGeocode(
      data.assignedLatitude,
      data.assignedLongitude
    );

    setStations(prev => ({
      ...prev,
      [data.stationId]: {
        ...prev[data.stationId],
        liveAddress,
        assignedAddress
      }
    }));
  }
  /* ===============================
     LIVE CLOCK
  ================================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===============================
     🔥 INITIAL FETCH ALL STATIONS
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
        console.error("Failed to fetch stations:", err);
      }
    }

    fetchStations();

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

      // 🔥 Instant UI update (NO blocking)
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

      // 🔥 Resolve address in background
      resolveAddressAsync(data);

      // 🔥 Reset offline timer
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
    return {
      total: values.length,
      inside: values.filter(s => s.status === "INSIDE").length,
      outside: values.filter(s => s.status === "OUTSIDE").length,
      offline: values.filter(s => s.status === "OFFLINE").length
    };
  }, [stations]);

  const sortedStations = useMemo(() => {
    const priority = { OUTSIDE: 1, OFFLINE: 2, INSIDE: 3 };

    return Object.values(stations)
      .filter(s => {

        // 🔎 Search filter
        const matchesSearch = s.stationId
          ?.toString()
          .toLowerCase()
          .includes(search.toLowerCase());

        // 🏙 District filter
        const districtCode = s.stationId?.toString().slice(0, 2);

        const matchesDistrict =
          selectedDistrict === "ALL" ||
          districtCode === selectedDistrict;

        return matchesSearch && matchesDistrict;
      })
      .sort((a, b) => (priority[a.status] || 4) - (priority[b.status] || 4));

  }, [stations, search, selectedDistrict]);


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
        </div>
        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              marginRight: 10
            }}
          >
            <option value="ALL">All Districts</option>
            {Object.entries(districtMap).map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code})
              </option>
            ))}
          </select>

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