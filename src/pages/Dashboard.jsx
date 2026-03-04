import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";

export default function Dashboard({ stations, stats }) {

    const [selectedStation, setSelectedStation] = useState(null);

    return (
        <MainLayout
            stations={stations}
            stats={stats}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
        />
    );
}