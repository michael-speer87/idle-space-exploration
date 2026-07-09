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
          <span className="legend-dot legend-selected" />
          Selected system
        </li>

        <li>
          <span className="legend-dot legend-known" />
          Detected or surveyed
        </li>

        <li>
          <span className="legend-dot legend-unknown" />
          Unknown system
        </li>
      </ul>

      <h3>Outpost Markers</h3>

      <ul>
        <li>
          <span className="legend-outpost-marker legend-outpost-survey">
            △
          </span>
          Survey Array
        </li>

        <li>
          <span className="legend-outpost-marker legend-outpost-commerce">
            ●
          </span>
          Commerce Hub
        </li>

        <li>
          <span className="legend-outpost-marker legend-outpost-science">
            ▲
          </span>
          Science Station
        </li>

        <li>
          <span className="legend-outpost-marker legend-outpost-power">
            ◆
          </span>
          Power Relay
        </li>

        <li>
          <span className="legend-outpost-marker legend-outpost-extraction">
            ■
          </span>
          Extraction Rig
        </li>
      </ul>
    </div>
  );
}