import MapView from "../map/MapView";
import StatsGrid from "../sidebar/StatsGrid";
import StationList from "../sidebar/StationList";

export default function MainLayout({
    stations,
    stats,
    selectedStation,
    setSelectedStation
}) {

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

            {/* ================= STATS ================= */}

            <StatsGrid stats={stats} />

            {/* ================= MAP + STATIONS ================= */}

            <div className="flex gap-6">

                {/* ================= MAP ================= */}

                <section className="flex-1 bg-white rounded-2xl shadow-md overflow-hidden">

                    <MapView
                        stations={stations}
                        selectedStation={selectedStation}
                    />

                </section>

                {/* ================= STATION LIST ================= */}

                <aside className="w-[350px] bg-white rounded-2xl shadow-md p-4">

                    <Sidebar
                        stations={stations}
                        onFocus={setSelectedStation}
                    />
                </aside>

            </div>

        </div>
    );
}