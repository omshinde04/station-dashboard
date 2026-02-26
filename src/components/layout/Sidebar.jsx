import { NavLink } from "react-router-dom";
import { Home, BarChart3, FileText, MapPin } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 p-4">

            <nav className="flex flex-col gap-2">

                <NavItem
                    to="/"
                    icon={<Home size={18} />}
                    label="Dashboard"
                />

                <NavItem
                    to="/analytics"
                    icon={<BarChart3 size={18} />}
                    label="Analytics"
                />

                <NavItem
                    to="/logs"
                    icon={<FileText size={18} />}
                    label="Logs"
                />

                <NavItem
                    to="/stations"
                    icon={<MapPin size={18} />}
                    label="Stations"
                />

            </nav>
        </aside>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}