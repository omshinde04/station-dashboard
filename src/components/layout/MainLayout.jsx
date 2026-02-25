import MapView from "../map/MapView";
import Sidebar from "../sidebar/Sidebar";
import AnalyticsSection from "../AnalyticsSection";

export default function MainLayout({ stations, stats }) {
    return (
        <main className="flex max-w-[1600px] mx-auto gap-6 px-6 py-6">
            <section className="w-[70%]">
                <MapView stations={stations} />
                <AnalyticsSection />
            </section>

            <aside className="w-[30%]">
                <Sidebar stations={stations} stats={stats} />

            </aside>
        </main>
    );
}