import { useState } from "react";
import Header from "./components/layout/Header";
import MainLayout from "./components/layout/MainLayout";
import { useStations } from "./hooks/useStations";

function App() {
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  const { sortedStations, stats, connected } =
    useStations(selectedDistrict, search);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        search={search}
        setSearch={setSearch}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        connected={connected}
      />

      <MainLayout
        stations={sortedStations}
        stats={stats}
      />
    </div>
  );
}

export default App;