import { useEffect, useState } from "react";
import { Search, ChevronDown, LogOut, User } from "lucide-react";
import RailtailLogo from "../../assets/images/railtail.png";

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
    "80": "Jalgaon",

    // ✅ Newly Added
    "81": "Wardha",
    "82": "Gondia",
    "83": "Gadchiroli",
    "84": "Bhandara",
    "85": "Washim",
    "86": "Hingoli",
    "87": "Jalna",
    "88": "Ahilyanagar"
};

export default function Header({
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
    connected,
    onLogout
}) {
    const [time, setTime] = useState(new Date());

    // 🔐 Decode logged-in email from token
    const token = localStorage.getItem("token");
    let userEmail = "";

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userEmail = payload.email || "";
        } catch { }
    }

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">

                {/* LEFT SIDE - BRANDING */}
                <div className="flex items-center gap-5">

                    <img
                        src={RailtailLogo}
                        alt="Railtail Logo"
                        className="h-10 object-contain"
                    />

                    <div className="h-8 w-px bg-slate-300" />

                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Railtail
                        </h1>
                        <span className="text-[11px] uppercase tracking-widest text-emerald-600 font-semibold">
                            Command Center
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE CONTROLS */}
                <div className="flex items-center gap-6">

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
                            className="h-10 w-64 pl-9 pr-4 rounded-xl bg-slate-100/70 text-sm 
                            ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500
                            transition-all outline-none"
                        />
                    </div>

                    {/* DISTRICT SELECT */}
                    <div className="relative">
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="appearance-none h-10 pl-4 pr-10 rounded-xl bg-white 
                            text-sm font-medium ring-1 ring-slate-200
                            hover:ring-slate-300 focus:ring-2 focus:ring-emerald-500
                            transition-all outline-none"
                        >
                            <option value="ALL">All Districts</option>
                            {Object.entries(districtMap).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name} ({code})
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>

                    {/* CONNECTION STATUS */}
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider
                        ${connected
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                                : "bg-red-50 text-red-600 ring-1 ring-red-500/30"
                            }`}
                    >
                        <span className="relative flex h-2 w-2">
                            <span
                                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${connected
                                    ? "bg-emerald-400 animate-ping"
                                    : "bg-red-400"
                                    }`}
                            />
                            <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${connected
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                    }`}
                            />
                        </span>

                        {connected ? "System Live" : "Disconnected"}
                    </div>

                    {/* CLOCK */}
                    <div className="px-4 py-2 bg-slate-100/80 rounded-xl font-mono text-sm font-medium text-slate-700 shadow-inner">
                        {time.toLocaleTimeString()}
                    </div>

                    {/* USER INFO */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 ring-1 ring-slate-200">
                        <User size={16} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-700">
                            {userEmail}
                        </span>
                    </div>

                    {/* LOGOUT */}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 
                        text-red-600 text-xs font-bold uppercase tracking-wider 
                        ring-1 ring-red-200 hover:bg-red-100 transition-all"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>

                </div>
            </div>
        </header>
    );
}