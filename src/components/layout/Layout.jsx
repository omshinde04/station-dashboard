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
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">

            {/* HEADER */}
            <Header
                search={search}
                setSearch={setSearch}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                connected={connected}
                onLogout={onLogout}
            />

            {/* BODY AREA */}
            <div className="flex flex-1">

                {/* SIDEBAR (starts below header) */}
                <Sidebar />

                {/* MAIN CONTENT */}
                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}