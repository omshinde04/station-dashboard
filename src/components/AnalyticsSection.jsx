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
    Bar
} from "recharts";

const COLORS = ["#10B981", "#EF4444"]; // Emerald + Red

export default function AnalyticsSection() {

    const [statusData, setStatusData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [topStations, setTopStations] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const statusRes = await axios.get("/api/analytics/status");
            const dailyRes = await axios.get("/api/analytics/daily?days=7");
            const topRes = await axios.get("/api/analytics/top?limit=5");

            const formattedStatus = [
                { name: "Inside", value: statusRes.data.data.INSIDE },
                { name: "Outside", value: statusRes.data.data.OUTSIDE }
            ];

            setStatusData(formattedStatus);
            setDailyData(dailyRes.data.data);
            setTopStations(topRes.data.data);

        } catch (err) {
            console.error("Analytics Fetch Error:", err);
        }
    };

    return (
        <div className="mt-10 space-y-8">

            {/* Section Title */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    📊 Analytics Overview
                </h2>
                <p className="text-sm text-slate-500">
                    Real-time monitoring & violation insights
                </p>
            </div>

            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Status Distribution */}
                <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">
                        Live Status Distribution
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Daily Violations Trend */}
                <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">
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
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Bottom Row */}
            <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold mb-4 text-slate-700">
                    Top Violating Stations
                </h3>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topStations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="station_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="violations" fill="#EF4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}