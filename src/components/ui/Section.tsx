import type { ReactNode } from "react";

type SectionProps = {
    title: ReactNode;
    children: ReactNode;
    className?: string;
    divider?: boolean;
};

export function Section({
    title,
    children,
    className = "",
    divider = true,
}: SectionProps) {
    return (
        <section className={`
                ${divider ? "border-t border-ise-border pt-4" : ""}
                ${className}
            `}
        >
            <h3 className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.08em]
                text-ise-text-subtle
            "
            >
                {title}
            </h3>

            {children}
        </section>
    )
}