import { useState } from "react";
import MapView from "../map/MapView";
import Sidebar from "../sidebar/Sidebar";
import StatsGrid from "../sidebar/StatsGrid";
import AnalyticsSection from "../AnalyticsSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MainLayout({ stations, stats }) {

    const [analyticsOpen, setAnalyticsOpen] = useState(true);

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* ================= TOP STATS ================= */}

            <StatsGrid stats={stats} />

            {/* ================= MAIN AREA ================= */}

            <div className="flex gap-6">

                {/* LEFT ANALYTICS PANEL */}
                <div
                    className={`
                        bg-white rounded-2xl shadow-md transition-all duration-300
                        ${analyticsOpen ? "w-[420px]" : "w-[70px]"}
                    `}
                >

                    <div className="flex justify-end p-3 border-b">
                        <button
                            onClick={() => setAnalyticsOpen(!analyticsOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                        >
                            {analyticsOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </div>

                    {analyticsOpen && (
                        <div className="p-4 overflow-y-auto h-[calc(100vh-240px)]">
                            <AnalyticsSection />
                        </div>
                    )}

                </div>

                {/* MAP */}
                <section className="flex-1">
                    <MapView stations={stations} />
                </section>

                {/* STATION LIST */}
                <aside className="w-[350px]">
                    <Sidebar stations={stations} />
                </aside>

            </div>
        </div>
    );
}