import { NavLink } from "react-router-dom";
import { Home, BarChart3, X } from "lucide-react";

export default function Sidebar({ open, onClose }) {

    return (
        <>
            {/* OVERLAY (for mobile) */}
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                />
            )}

            <div
                className={`
                    fixed lg:relative z-50
                    h-full bg-white shadow-xl
                    transition-all duration-300 ease-in-out
                    ${open ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"}
                    overflow-hidden
                `}
            >

                {/* CLOSE BUTTON (mobile) */}
                <div className="flex justify-end p-4 lg:hidden">
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-6 space-y-2 px-3">

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition
                             ${isActive
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"}`
                        }
                        onClick={onClose}
                    >
                        <Home size={18} />
                        {open && "Dashboard"}
                    </NavLink>

                    <NavLink
                        to="/analytics"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition
                             ${isActive
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"}`
                        }
                        onClick={onClose}
                    >
                        <BarChart3 size={18} />
                        {open && "Analytics"}
                    </NavLink>

                </nav>
            </div>
        </>
    );
}