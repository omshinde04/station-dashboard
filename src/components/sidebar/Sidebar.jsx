import StatsGrid from "./StatsGrid";
import StationList from "./StationList";

export default function Sidebar({ stations, stats }) {
    return (
        <div className="flex flex-col gap-6">

            <StationList stations={stations} />
        </div>
    );
}