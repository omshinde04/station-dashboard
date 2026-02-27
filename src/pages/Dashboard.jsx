import { useState } from "react";
import MapView from "../components/map/MapView";
import StatsGrid from "../components/sidebar/StatsGrid";
import StationList from "../components/sidebar/StationList";

export default function Dashboard({ stations, stats }) {
    const [selectedStation, setSelectedStation] = useState(null);

    return (
        <div className="flex gap-6">

            {/* LEFT - MAP */}
            <div className="flex-1">
                <MapView
                    stations={stations}
                    selectedStation={selectedStation}
                />
            </div>

            {/* RIGHT - SIDEBAR */}
            <div className="w-[380px] space-y-6">
                <StatsGrid stats={stats} />

                <StationList
                    stations={stations}
                    onFocus={setSelectedStation}
                />
            </div>

        </div>
    );
}