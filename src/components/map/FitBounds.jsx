import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FitBounds({ stations }) {
    const map = useMap();

    useEffect(() => {
        const points = stations
            .filter(s => s.latitude && s.longitude)
            .map(s => [s.latitude, s.longitude]);

        if (points.length > 0) {
            map.flyToBounds(points, { padding: [80, 80] });
        }
    }, [stations, map]);

    return null;
}