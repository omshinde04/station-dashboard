import { useState } from "react";
import Header from "./components/layout/Header";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import { useStations } from "./hooks/useStations";

function App() {

  // 🔐 Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  // 🔎 Filters
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  // 🚀 Stations Hook (only runs if authenticated)
  const { sortedStations, stats, connected } =
    useStations(selectedDistrict, search);

  // ✅ Login Handler
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // ✅ Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // 🔒 If not logged in → show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 🔓 If logged in → show dashboard
  return (
    <div className="min-h-screen bg-slate-100">

      <Header
        search={search}
        setSearch={setSearch}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        connected={connected}
        onLogout={handleLogout}   // 👈 Pass logout
      />

      <MainLayout
        stations={sortedStations}
        stats={stats}
      />

    </div>
  );
}

export default App;