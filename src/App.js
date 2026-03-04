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
  const [selectedAgency, setSelectedAgency] = useState("ALL");

  // 🚀 Stations Hook
  const { sortedStations, stats, connected } =
    useStations(selectedDistrict, selectedAgency, search);

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
        selectedAgency={selectedAgency}
        setSelectedAgency={setSelectedAgency}
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

          <Route
            path="/logs"
            element={<LogsPage />}
          />

          <Route
            path="/stations"
            element={<StationsPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/" />}
          />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;