import type { ReactNode } from "react";

type PanelProps = {
    title: string;
    subtitle?: string;
    rightSlot?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function Panel({
    title,
    subtitle,
    rightSlot,
    children,
    className = "",
}: PanelProps) {
    return (
        <section className={`
            overflow-hidden rounded-panel
            border border-ise-border
            bg-ise-surface
            shadow-panel
            ${className}
        `}
        >
            <header className="
                flex items-start justify-between gap-3
                border-b border-ise-border
                bg-ise-surface-raised
                px-4 py-3
            "
            >
                <div className="min-w-0">
                    <h2 className="
                        m-0 truncate
                        text-sm font-semibold tracking-wide
                        text-ise-text
                    "
                    >
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="mt-1 mb-0 text-xs text-ise-text-muted">
                            {subtitle}
                        </p>
                    )}
                </div>

                {rightSlot && (
                    <div className="shrink-0 text-xs text-ise-text-muted">
                        {rightSlot}
                    </div>
                )}
            </header>

            <div className="p-4">{children}</div>
        </section>
    );
}