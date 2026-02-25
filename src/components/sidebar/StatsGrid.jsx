import {
    Activity,
    CheckCircle,
    AlertTriangle,
    WifiOff,
    Wifi
} from "lucide-react";
import StatCard from "./StatCard";

export default function StatsGrid({ stats }) {

    const totalMachines = stats.total || 0;
    const onlineMachines = stats.online || 0;
    const inside = stats.inside || 0;
    const outside = stats.outside || 0;
    const offline = stats.offline || 0;

    // 🔥 Percentages based on ONLINE machines only
    const percentOnlineBased = (value) =>
        onlineMachines > 0
            ? ((value / onlineMachines) * 100).toFixed(1)
            : 0;

    // 🔥 Percentages based on TOTAL machines
    const percentTotalBased = (value) =>
        totalMachines > 0
            ? ((value / totalMachines) * 100).toFixed(1)
            : 0;

    return (
        <div className="grid grid-cols-2 gap-5">

            {/* Total Machines */}
            <StatCard
                title="Total Machines"
                value={totalMachines}
                icon={<Activity size={20} />}
                color="blue"
            />

            {/* Online Machines */}
            <StatCard
                title="Online Machines"
                value={onlineMachines}
                icon={<Wifi size={20} />}
                color="green"
                percentage={percentTotalBased(onlineMachines)}
            />

            {/* Inside */}
            <StatCard
                title="Inside Perimeter"
                value={inside}
                icon={<CheckCircle size={20} />}
                color="green"
                percentage={percentOnlineBased(inside)}
            />

            {/* Outside */}
            <StatCard
                title="Outside Safe Zone"
                value={outside}
                icon={<AlertTriangle size={20} />}
                color="red"
                percentage={percentOnlineBased(outside)}
            />

            {/* Offline */}
            <StatCard
                title="Offline / Errors"
                value={offline}
                icon={<WifiOff size={20} />}
                color="gray"
                percentage={percentTotalBased(offline)}
            />

        </div>
    );
}