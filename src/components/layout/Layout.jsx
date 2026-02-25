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
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-100">

            <Sidebar expanded={expanded} setExpanded={setExpanded} />

            <div
                className={`flex-1 transition-all duration-300 ${expanded ? "ml-60" : "ml-20"
                    }`}
            >
                <Header
                    search={search}
                    setSearch={setSearch}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    connected={connected}
                    onLogout={onLogout}
                />

                <main className="p-6">
                    {children}
                </main>
            </div>

        </div>
    );
}