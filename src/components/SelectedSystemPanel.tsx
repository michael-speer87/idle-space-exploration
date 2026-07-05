import type { AffinityProfile, StarSystem } from "../game/types";

type SelectedSystemPanelProps = {
    system: StarSystem | null;
};

export function SelectedSystemPanel({ system }: SelectedSystemPanelProps) {
    if (system === null) {
        return (
            <aside className="system-panel">
                <h2>No System Selected</h2>
                <p>Select a star system to inspect it.</p>
            </aside>
        );
    }

    return (
        <aside className="system-panel">
            <p className="panel-kicker">
                {system.isHome ? "Home System" : "Star System"}    
            </p>"

            <h2>{system.name}</h2>

            <section className="panel-section">
                <h3>Status</h3>

                <dl>
                    <PanelRow label="ID" value={system.id} />
                    <PanelRow
                        label="Coordinates"
                        value={`q: ${system.coord.q}, r: ${system.coord.r}`}
                    />
                    <PanelRow label="Star" value={system.starVisual} />
                    <PanelRow label="Exploration" value={system.explorationState} />
                    <PanelRow label="Claim" value={system.claimState} />
                    <PanelRow
                        label="Survey Requirement"
                        value={system.surveyRequirement.toString()}
                    />
                </dl>
            </section>

            <section className="panel-section">
                <h3>Outpost Potential</h3>

                <dl>
                    <PanelRow
                        label="Support Slots"
                        value={system.supportSlotCount.toString()}
                    />
                    <PanelRow
                        label="Primary Outpost"
                        value={system.primaryOutpostId ?? "None"}
                    />
                </dl>
            </section>

            <section className="panel-section">
                <h3>Affinities</h3>
                <AffinityGrid affinities={system.affinities} />
            </section>

            {system.hasGradCommand && (
                <p className="grad-command-note">GRaD Command established.</p>
            )}
        </aside>
    );
}

type PanelRowProps = {
    label: string;
    value: string;
};

function PanelRow({ label, value }: PanelRowProps) {
    return (
        <div>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

type AffinityGridProps = {
    affinities: AffinityProfile;
};

function AffinityGrid({ affinities }: AffinityGridProps) {
    return (
        <div className="affinity-grid">
            {Object.entries(affinities).map(([name, level]) => (
                <div key={name} className={`affinity-pill affinity-#{level}`}>
                    <span>{name}: </span>
                    <strong>{level}</strong>
                </div>
            ))}
        </div>
    );
}