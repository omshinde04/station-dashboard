import { useState } from "react";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import AnalyticsSection from "../AnalyticsSection";

export default function Sidebar() {
    const [open, setOpen] = useState(true);

    return (
        <div
            className={`
                h-screen bg-white shadow-xl border-r border-slate-200
                transition-all duration-300 ease-in-out
                ${open ? "w-[420px]" : "w-[70px]"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                {open && (
                    <div className="flex items-center gap-2">
                        <BarChart3 size={18} />
                        <span className="font-semibold text-slate-700">
                            Analytics
                        </span>
                    </div>
                )}

                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 rounded-lg hover:bg-slate-100"
                >
                    {open ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-70px)] p-4">
                {open && <AnalyticsSection />}
            </div>
        </div>
    );
}