import StationList from "./StationList";

export default function Sidebar({ stations, onFocus }) {
    return (
        <div className="flex flex-col gap-6">

            <StationList
                stations={stations}
                onFocus={onFocus}
            />

        </div>
    );
}