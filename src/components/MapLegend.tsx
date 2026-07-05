export function MapLegend() {
    return (
        <div className="map-legend">
            <h2>Map Legend</h2>

            <ul>
                <li>
                    <span className="legend-dot legend-claimed" />
                    Claimed system
                </li>

                <li>
                    <span className="legent-dot legend-selected" />
                    Selected system
                </li>

                <li>
                    <span className="legend-dot legend-known" />
                    Detected or surveyed
                </li>

                <li>
                    <span className="legend-dot legend-unknown" />
                    Unknown System
                </li>
            </ul>
        </div>
    );
}