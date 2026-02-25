import { useState } from "react";
import MapView from "../map/MapView";
import Sidebar from "../sidebar/Sidebar"; // right side station list
import AnalyticsSection from "../AnalyticsSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MainLayout({ stations, stats }) {
    const [analyticsOpen, setAnalyticsOpen] = useState(true);

    return (
        <div className="flex max-w-[1600px] mx-auto px-6 py-6 gap-6">

            {/* ================= LEFT ANALYTICS PANEL ================= */}
            <div
                className={`
                    bg-white rounded-2xl shadow-md transition-all duration-300
                    ${analyticsOpen ? "w-[420px]" : "w-[70px]"}
                `}
            >
                {/* Toggle Button */}
                <div className="flex justify-end p-3 border-b">
                    <button
                        onClick={() => setAnalyticsOpen(!analyticsOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100"
                    >
                        {analyticsOpen ? (
                            <ChevronLeft size={18} />
                        ) : (
                            <ChevronRight size={18} />
                        )}
                    </button>
                </div>

                {/* Analytics Content */}
                {analyticsOpen && (
                    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
                        <AnalyticsSection />
                    </div>
                )}
            </div>

            {/* ================= CENTER MAP ================= */}
            <section className="flex-1">
                <MapView stations={stations} />
            </section>

            {/* ================= RIGHT STATION SIDEBAR ================= */}
            <aside className="w-[350px]">
                <Sidebar stations={stations} stats={stats} />
            </aside>

        </div>
    );
}