import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import { useStations } from "./hooks/useStations";
import LogsPage from "./pages/LogsPage";
import StationsPage from "./pages/StationsPage";

function App() {

  // 🔐 Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  // 🔎 Filters
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  // 🚀 Stations Hook (always called — React rule)
  const { sortedStations, stats, connected } =
    useStations(selectedDistrict, search);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // 🔒 Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout
        search={search}
        setSearch={setSearch}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        connected={connected}
        onLogout={handleLogout}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                stations={sortedStations}
                stats={stats}
              />
            }
          />

          <Route
            path="/analytics"
            element={<AnalyticsPage />}
          />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/stations" element={<StationsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;