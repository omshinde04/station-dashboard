import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
    children,
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
    connected,
    onLogout
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-slate-100">

            <Sidebar open={sidebarOpen} />

            <div className="flex-1 flex flex-col">

                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    search={search}
                    setSearch={setSearch}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    connected={connected}
                    onLogout={onLogout}
                />

                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}