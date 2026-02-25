import { NavLink } from "react-router-dom";
import { Home, BarChart3 } from "lucide-react";

export default function Sidebar({ open }) {

    return (
        <div
            className={`
                bg-white shadow-lg border-r border-slate-200
                transition-all duration-300
                ${open ? "w-[220px]" : "w-[70px]"}
            `}
        >
            <div className="p-4 font-bold text-slate-700">
                {open ? "GeoSentinel" : "GS"}
            </div>

            <nav className="mt-6 space-y-2 px-2">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition
                        ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`
                    }
                >
                    <Home size={18} />
                    {open && "Dashboard"}
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition
                        ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`
                    }
                >
                    <BarChart3 size={18} />
                    {open && "Analytics"}
                </NavLink>

            </nav>
        </div>
    );
}