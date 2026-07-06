import type { CalculatedRates } from "../game/systems/rateSystem";

type ResourceBarProps = {
    credits: number;
    science: number;
    rates: CalculatedRates;
};

export function ResourceBar({ credits, science, rates }: ResourceBarProps) {
    return (
        <div className="resource-bar">
            <ResourcePill label="Credits" value={credits.toFixed(0)} />
            <ResourcePill label="Science" value={science.toFixed(0)} />
            <ResourcePill label="EP/sec" value={rates.epPerSecond.toFixed(0)} />
            <ResourcePill 
                label="Energy" 
                value={`${rates.energySurplus >= 0 ? "+": ""}${rates.energySurplus}`} 
            />
        </div> 
    );
}

type ResourcePillProps = {
    label: string;
    value: string;
};

function ResourcePill({ label, value }: ResourcePillProps) {
    return (
        <div className="resource-pill">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    )
}