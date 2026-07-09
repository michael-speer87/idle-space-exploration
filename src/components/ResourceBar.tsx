import type { CalculatedRates } from "../game/systems/rateSystem";

type ResourceBarProps = {
    credits: number;
    science: number;
    rates: CalculatedRates;
};

export function ResourceBar({ credits, science, rates }: ResourceBarProps) {
    return (
        <div className="resource-bar">
            <ResourcePill 
                label="Credits" 
                value={credits.toFixed(0)}
                rate={rates.creditsPerSecond.toFixed(2)}
            />
            <ResourcePill 
                label="Science" 
                value={science.toFixed(0)}
                rate={rates.sciencePerSecond.toFixed(2)} 
            />
            <ResourcePill 
                label="EP/sec" 
                value={rates.epPerSecond.toFixed(0)} 
                rate={rates.epPerSecond.toFixed(2)}
            />
            <ResourcePill 
                label="Energy" 
                value={`${rates.energySurplus >= 0 ? "+": ""}${rates.energySurplus.toFixed(1)}`} 
                rate={rates.energyProduced.toFixed(2)}
            />
            <ResourcePill
                label="Efficiency"
                value={`${Math.round(rates.productionEfficiency * 100)}`}
                rate={`${rates.energyUsed.toFixed(2)} / ${rates.energyProduced.toFixed(2)}`}
            />
        </div> 
    );
}

type ResourcePillProps = {
    label: string;
    value: string;
    rate: string;
};

function ResourcePill({ label, value, rate }: ResourcePillProps) {
    return (
        <div className="resource-pill">
            <span>{label}</span>
            <strong>{value}</strong>
            <span>{rate}</span>
        </div>
    )
}