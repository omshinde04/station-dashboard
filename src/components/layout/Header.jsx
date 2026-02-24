import { useEffect, useState } from "react";
import { Shield, Search, ChevronDown } from "lucide-react";

const districtMap = {
    "71": "Kolhapur",
    "72": "Ratnagiri",
    "73": "Sindhudurg",
    "74": "Raigad",
    "75": "Thane",
    "76": "Palghar",
    "77": "Nashik",
    "78": "Dhule",
    "79": "Nandurbar",
    "80": "Jalgaon"
};

export default function Header({
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
    connected
}) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-6 py-5 backdrop-blur-xl bg-white/70 border-b border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center max-w-[1600px] mx-auto">

                {/* LEFT SIDE - LOGO */}
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md">
                        <Shield size={22} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            GeoSentinel
                        </h1>
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
                            Real-Time Monitoring System
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE - CONTROLS */}
                <div className="flex items-center gap-5">

                    {/* SEARCH */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            placeholder="Search stations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-11 w-64 pl-9 pr-4 rounded-xl bg-slate-100/70 text-sm 
                         ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500
                         transition-all outline-none"
                        />
                    </div>

                    {/* DISTRICT DROPDOWN */}
                    <div className="relative">
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-white 
                         text-sm font-medium ring-1 ring-slate-200
                         hover:ring-slate-300 focus:ring-2 focus:ring-emerald-500
                         transition-all outline-none"
                        >
                            <option value="ALL">All Districts</option>
                            {Object.entries(districtMap).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>

                    {/* LIVE STATUS */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full 
            ${connected
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                            : "bg-red-50 text-red-600 ring-1 ring-red-500/30"
                        }`}>

                        {connected && (
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                        )}

                        <span className="text-xs font-bold uppercase tracking-wider">
                            {connected ? "Live" : "Offline"}
                        </span>
                    </div>

                    {/* CLOCK */}
                    <div className="px-4 py-2 bg-slate-100/80 rounded-xl font-mono text-sm font-medium text-slate-700 shadow-inner">
                        {time.toLocaleTimeString()}
                    </div>

                </div>
            </div>
        </header>
    );
}