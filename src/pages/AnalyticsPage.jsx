import { useEffect, useState, useMemo } from "react";
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

const COLORS = {
    INSIDE: "#10B981",
    OUTSIDE: "#EF4444"
};

export default function AnalyticsPage() {

    const [statusData, setStatusData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [topStations, setTopStations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [statusRes, dailyRes, topRes] = await Promise.all([
                axios.get("/api/analytics/status"),
                axios.get("/api/analytics/daily?days=7"),
                axios.get("/api/analytics/top?limit=5")
            ]);

            const inside = statusRes.data.data.INSIDE || 0;
            const outside = statusRes.data.data.OUTSIDE || 0;

            setStatusData([
                { name: "Inside Safe Zone", value: inside },
                { name: "Outside Safe Zone", value: outside }
            ]);

            setDailyData(dailyRes.data.data || []);
            setTopStations(topRes.data.data || []);

        } catch (err) {
            console.error("Analytics Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const totalStations = useMemo(() => {
        return statusData.reduce((sum, item) => sum + item.value, 0);
    }, [statusData]);

    const complianceRate = useMemo(() => {
        const inside = statusData.find(s => s.name.includes("Inside"))?.value || 0;
        if (totalStations === 0) return 0;
        return Math.round((inside / totalStations) * 100);
    }, [statusData, totalStations]);

    if (loading) {
        return (
            <div className="text-center mt-20 text-slate-500 text-lg">
                Loading analytics...
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12">

            {/* HEADER */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800">
                    📊 System Analytics
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Real-time compliance monitoring and violation insights
                </p>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <SummaryCard
                    title="Total Active Stations"
                    value={totalStations}
                    subtitle="Stations reporting status"
                />

                <SummaryCard
                    title="Compliance Rate"
                    value={`${complianceRate}%`}
                    subtitle="Stations inside safe zone"
                    highlight={complianceRate >= 80}
                />

                <SummaryCard
                    title="Current Violations"
                    value={
                        statusData.find(s => s.name.includes("Outside"))?.value || 0
                    }
                    subtitle="Stations outside permitted radius"
                    danger
                />
            </div>

            {/* STATUS PIE */}
            <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">
                    Live Station Status Distribution
                </h3>

                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie data={statusData} dataKey="value" outerRadius={110} label>
                            {statusData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={
                                        entry.name.includes("Inside")
                                            ? COLORS.INSIDE
                                            : COLORS.OUTSIDE
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* TREND + TOP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        7-Day Violation Trend
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
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
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        Top Violating Stations
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topStations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="station_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="violations"
                                fill="#EF4444"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

function SummaryCard({ title, value, subtitle, highlight, danger }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {title}
            </h4>

            <div className={`text-3xl font-bold mt-2 ${danger
                ? "text-red-600"
                : highlight
                    ? "text-emerald-600"
                    : "text-slate-900"
                }`}>
                {value}
            </div>

            <p className="text-xs text-slate-500 mt-2">
                {subtitle}
            </p>
        </div>
    );
}