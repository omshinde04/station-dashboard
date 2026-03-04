import MainLayout from "../components/layout/MainLayout";

export default function Dashboard({ stations, stats }) {
    return (
        <MainLayout
            stations={stations}
            stats={stats}
        />
    );
}