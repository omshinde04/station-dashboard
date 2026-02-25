import { useState } from "react";
import Header from "./components/layout/Header";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import { useStations } from "./hooks/useStations";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  // ✅ ALWAYS call hook (React rule)
  const { sortedStations, stats, connected } =
    useStations(selectedDistrict, search);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // 🔐 If not authenticated → show login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <Header
        search={search}
        setSearch={setSearch}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        connected={connected}
        onLogout={handleLogout}
      />

      <MainLayout
        stations={sortedStations}
        stats={stats}
      />

    </div>
  );
}

export default App;