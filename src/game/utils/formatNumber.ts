type NumberFormatOptions = {
  compactThreshold?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

export function formatNumber(
  value: number,
  {
    compactThreshold = 1_000,
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
  }: NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Math.abs(value) >= compactThreshold) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(value);
}

export function formatResource(value: number): string {
  return formatNumber(value, {
    compactThreshold: 1_000,
    maximumFractionDigits: 2,
  });
}

export function formatRate(value: number): string {
  return formatNumber(value, {
    compactThreshold: 1_000,
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
  });
}