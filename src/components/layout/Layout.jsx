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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen bg-slate-100">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col min-h-screen">

                <Header
                    toggleSidebar={() => setSidebarOpen(true)}
                    search={search}
                    setSearch={setSearch}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    connected={connected}
                    onLogout={onLogout}
                />

                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}