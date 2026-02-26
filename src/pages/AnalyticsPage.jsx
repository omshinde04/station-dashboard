import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
    Legend
} from "recharts";
import {
    ShieldCheck,
    AlertTriangle,
    Activity,
    Wifi,
    WifiOff
} from "lucide-react";

const COLORS = {
    INSIDE: "#10B981",
    OUTSIDE: "#EF4444",
    OFFLINE: "#64748B"
};

export default function AnalyticsPage() {

    const [status, setStatus] = useState({});
    const [dailyData, setDailyData] = useState([]);
    const [topStations, setTopStations] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =============================
       FETCH ANALYTICS
    ============================= */
    const fetchAnalytics = async () => {
        try {

            const [statusRes, dailyRes, topRes] = await Promise.all([
                axios.get("/api/analytics/status"),
                axios.get("/api/analytics/daily?days=7"),
                axios.get("/api/analytics/top?limit=5")
            ]);

            setStatus(statusRes.data.data || {});
            setDailyData(dailyRes.data.data || []);
            setTopStations(topRes.data.data || []);

        } catch (err) {
            console.error("Analytics Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* =============================
       INITIAL LOAD + AUTO REFRESH
    ============================= */
    useEffect(() => {
        fetchAnalytics();

        const interval = setInterval(() => {
            fetchAnalytics();
        }, 120000); // refresh every 2 mins

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-slate-500 text-lg">
                Loading analytics...
            </div>
        );
    }

    const pieData = [
        { name: "Inside", value: status.INSIDE || 0 },
        { name: "Outside", value: status.OUTSIDE || 0 },
        { name: "Offline", value: status.OFFLINE || 0 }
    ];

    return (
        <div className="max-w-[1700px] mx-auto space-y-14 pb-16">

            {/* HEADER */}
            <div>
                <h2 className="text-4xl font-bold text-slate-900">
                    System Analytics
                </h2>
                <p className="text-slate-500 mt-2">
                    Enterprise compliance monitoring dashboard
                </p>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                <KpiCard
                    icon={<Activity size={20} />}
                    title="Total Stations"
                    value={status.TOTAL || 0}
                />

                <KpiCard
                    icon={<Wifi size={20} />}
                    title="Online Stations"
                    value={status.ONLINE || 0}
                    highlight
                />

                <KpiCard
                    icon={<WifiOff size={20} />}
                    title="Offline Stations"
                    value={status.OFFLINE || 0}
                />

                <KpiCard
                    icon={<ShieldCheck size={20} />}
                    title="Compliance Rate"
                    value={`${status.COMPLIANCE_RATE || 0}%`}
                    highlight
                />

                <KpiCard
                    icon={<AlertTriangle size={20} />}
                    title="Violations"
                    value={status.OUTSIDE || 0}
                    danger
                />
            </div>

            {/* STATUS DISTRIBUTION */}
            <ChartCard title="Live Status Distribution">
                <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            outerRadius={130}
                            label
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[entry.name.toUpperCase()]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* TREND + TOP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                <ChartCard title="7-Day Violation Trend">
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#EF4444"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top Violating Stations">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={topStations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="station_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="violations"
                                fill="#EF4444"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

            </div>
        </div>
    );
}

/* =============================
   KPI CARD
============================= */
function KpiCard({ icon, title, value, highlight, danger }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">

            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide">
                {icon}
                {title}
            </div>

            <div
                className={`text-3xl font-bold mt-3 ${danger
                    ? "text-red-600"
                    : highlight
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}
            >
                {value}
            </div>
        </div>
    );
}

/* =============================
   CHART CARD
============================= */
function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
                {title}
            </h3>
            {children}
        </div>
    );
}