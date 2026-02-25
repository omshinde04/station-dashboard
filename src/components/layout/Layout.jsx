import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-slate-100">

            {/* LEFT SIDEBAR */}
            <Sidebar open={sidebarOpen} />

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col">

                {/* HEADER */}
                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={onLogout}
                />

                {/* PAGE CONTENT */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}