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
        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1 ml-20">

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