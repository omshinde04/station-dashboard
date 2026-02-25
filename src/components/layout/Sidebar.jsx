import { NavLink } from "react-router-dom";
import { Home, BarChart3, X } from "lucide-react";

export default function Sidebar({ open, onClose }) {
    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 z-50
          h-full w-64
          bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <span className="text-lg font-semibold tracking-wide">
                        Navigation
                    </span>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="mt-6 px-4 space-y-2">

                    <NavLink
                        to="/"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
              ${isActive
                                ? "bg-slate-800 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`
                        }
                    >
                        <Home size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/analytics"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
              ${isActive
                                ? "bg-slate-800 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`
                        }
                    >
                        <BarChart3 size={18} />
                        Analytics
                    </NavLink>

                </nav>
            </aside>
        </>
    );
}