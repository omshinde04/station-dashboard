import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
    children,
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
    selectedAgency,
    setSelectedAgency,
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
                selectedAgency={selectedAgency}
                setSelectedAgency={setSelectedAgency}
                connected={connected}
                onLogout={onLogout}
            />

            {/* BODY */}
            <div className="flex flex-1">

                <Sidebar />

                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}