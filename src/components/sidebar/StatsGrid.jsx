import {
    Activity,
    CheckCircle,
    AlertTriangle,
    WifiOff,
    Wifi
} from "lucide-react";
import StatCard from "./StatCard";

export default function StatsGrid({ stats }) {
    const total = stats.total || 0;

    const percentage = (value) =>
        total ? ((value / total) * 100).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-2 gap-5">

            <StatCard
                title="Total Machines"
                value={stats.total}
                icon={<Activity size={20} />}
                color="blue"
            />

            <StatCard
                title="Online Machines"
                value={stats.online}
                icon={<Wifi size={20} />}
                color="green"
            />
            <StatCard
                title="Inside Perimeter"
                value={stats.inside}
                icon={<CheckCircle size={20} />}
                color="green"
                percentage={percentage(stats.inside)}
            />

            <StatCard
                title="Outside Safe Zone"
                value={stats.outside}
                icon={<AlertTriangle size={20} />}
                color="red"
                percentage={percentage(stats.outside)}
            />

            <StatCard
                title="Offline / Errors"
                value={stats.offline}
                icon={<WifiOff size={20} />}
                color="gray"
                percentage={percentage(stats.offline)}
            />

        </div>
    );
}