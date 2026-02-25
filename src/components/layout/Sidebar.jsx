import { NavLink } from "react-router-dom";
import { Home, BarChart3, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const [expanded, setExpanded] = useState(false);

    return (
        <aside
            className={`
        h-screen fixed top-0 left-0 z-40
        bg-white border-r border-slate-200
        transition-all duration-300
        ${expanded ? "w-60" : "w-20"}
      `}
        >
            {/* Toggle Button */}
            <div className="h-16 flex items-center justify-between px-4 border-b">
                {expanded && <span className="font-semibold">Railtail</span>}
                <button onClick={() => setExpanded(!expanded)}>
                    <ChevronRight
                        size={18}
                        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                </button>
            </div>

            <nav className="mt-6 flex flex-col gap-2 px-3">
                <NavItem to="/" icon={<Home size={20} />} label="Dashboard" expanded={expanded} />
                <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" expanded={expanded} />
            </nav>
        </aside>
    );
}

function NavItem({ to, icon, label, expanded }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
        ${isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`
            }
        >
            {icon}
            {expanded && <span>{label}</span>}
        </NavLink>
    );
}