export const HAVEN_NIVO_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const RISK_LEVEL_COLOR: Record<string, string> = {
  Low: 'hsl(var(--chart-3))',
  Medium: 'hsl(var(--chart-5))',
  High: 'hsl(var(--chart-2))',
  Critical: 'hsl(var(--destructive))',
};

export function getRiskColor(level: string): string {
  return RISK_LEVEL_COLOR[level] ?? HAVEN_NIVO_COLORS[1];
}

export function formatCompactChartNumber(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US');
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCompactCurrencyTick(value: number): string {
  if (Math.abs(value) < 1000) {
    return Math.round(value).toLocaleString('en-US');
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function shortenSafehouseLabel(name: string): string {
  const normalized = name
    .replace(/^Lighthouse Safehouse\s+/i, 'LH ')
    .replace(/^Safehouse\s+/i, 'SH ')
    .replace(/\s+Safehouse\s+/i, ' SH ')
    .trim();

  if (normalized.length <= 16) {
    return normalized;
  }

  return `${normalized.slice(0, 13).trimEnd()}...`;
}

export const havenNivoTheme = {
  background: 'transparent',
  text: {
    fill: 'hsl(var(--foreground))',
    fontSize: 12,
  },
  axis: {
    domain: {
      line: {
        stroke: 'hsl(var(--border))',
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fill: 'hsl(var(--muted-foreground))',
        fontSize: 12,
        fontWeight: 600,
      },
    },
    ticks: {
      line: {
        stroke: 'hsl(var(--border))',
        strokeWidth: 1,
      },
      text: {
        fill: 'hsl(var(--muted-foreground))',
        fontSize: 11,
      },
    },
  },
  grid: {
    line: {
      stroke: 'hsl(var(--border))',
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: 'hsl(var(--foreground))',
      fontSize: 11,
    },
  },
  labels: {
    text: {
      fill: 'hsl(var(--foreground))',
      fontSize: 11,
      fontWeight: 600,
    },
  },
  tooltip: {
    container: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.75rem',
      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
      maxWidth: '300px',
    },
  },
};

export const lineLegend = {
  anchor: 'bottom-left' as const,
  direction: 'row' as const,
  justify: false,
  translateX: 0,
  translateY: 56,
  itemsSpacing: 16,
  itemDirection: 'left-to-right' as const,
  itemWidth: 110,
  itemHeight: 18,
  itemOpacity: 0.9,
  symbolSize: 12,
  symbolShape: 'circle' as const,
};

export const barLegend = {
  dataFrom: 'keys' as const,
  anchor: 'bottom-left' as const,
  direction: 'row' as const,
  justify: false,
  translateX: 0,
  translateY: 56,
  itemsSpacing: 16,
  itemWidth: 110,
  itemHeight: 18,
  itemDirection: 'left-to-right' as const,
  itemOpacity: 0.9,
  symbolSize: 12,
  effects: [
    {
      on: 'hover' as const,
      style: {
        itemOpacity: 1,
      },
    },
  ],
};
