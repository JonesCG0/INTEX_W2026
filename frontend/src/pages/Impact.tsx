import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import ImpactStatCard from '../components/ImpactStatCard';
import CulturalDivider from '../components/CulturalDivider';
import { motion, useReducedMotion } from 'framer-motion';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'sonner';
import { formatCompactChartNumber, formatCompactCurrencyTick, HAVEN_NIVO_COLORS, barLegend, havenNivoTheme, lineLegend, shortenSafehouseLabel } from '@/lib/nivo';
import { parseDisplayValue } from '@/lib/dashboard-format';

interface ImpactTrendPoint {
  monthLabel: string;
  donationAmountPhp: number;
  activeResidents: number;
}

interface ImpactMetric {
  label: string;
  valueDisplay: string;
  detail: string;
}

interface ImpactSafehouse {
  name: string;
  currentOccupancy: number;
  capacityGirls: number;
}

interface ImpactData {
  hero: {
    headline: string;
    summary: string;
    publishedLabel: string;
  };
  metrics: ImpactMetric[];
  donationTrend: ImpactTrendPoint[];
  safehouses: ImpactSafehouse[];
  generatedAt: string;
  sourceTables: string[];
}

export default function Impact() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const response = await apiFetch(`${API_BASE}/api/public/impact`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          const payload = await response.json().catch(() => null);
          const message = payload?.error ?? "Failed to load impact data.";
          setError(message);
          toast.error(message);
        }
      } catch (error) {
        console.error("Impact fetch error:", error);
        setError("A network error occurred while loading impact analytics.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchImpact();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <h2 className="font-display text-2xl text-foreground mb-2">Impact Dashboard Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-xl rounded-xl border border-border/60 bg-card p-8 text-center">
          <h2 className="font-display text-2xl text-foreground mb-2">No impact data yet</h2>
          <p className="text-sm text-muted-foreground">The public dashboard will appear when impact records are available.</p>
        </div>
      </div>
    );
  }

  const donationLineData = [
    {
      id: "Donations",
      color: HAVEN_NIVO_COLORS[0],
      data: data.donationTrend.map(pt => ({
        x: pt.monthLabel,
        y: pt.donationAmountPhp
      }))
    }
  ];

  const residentLineData = [
    {
      id: "Residents",
      color: HAVEN_NIVO_COLORS[1],
      data: data.donationTrend.map(pt => ({
        x: pt.monthLabel,
        y: pt.activeResidents
      }))
    }
  ];

  const barData = data.safehouses.map(sh => ({
    name: sh.name,
    shortName: shortenSafehouseLabel(sh.name),
    "Occupancy": sh.currentOccupancy,
    "Capacity": sh.capacityGirls
  }));

  const impactCardTransition = reduceMotion ? { duration: 0.15, delay: 0 } : { duration: 0.7 };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={impactCardTransition}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              {data.hero.headline || "Impact Dashboard"}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              {data.hero.summary || "Transparent reporting on how your support transforms lives and strengthens communities"}
            </p>
            {data.hero.publishedLabel && (
              <p className="text-xs text-muted-foreground mt-4 opacity-70 uppercase tracking-widest">
                {data.hero.publishedLabel}
              </p>
            )}
            {data.generatedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Data refreshed {new Date(data.generatedAt).toLocaleString()} from {data.sourceTables.length ?? 0} source tables.
              </p>
            )}
          </motion.div>

          <CulturalDivider variant="step" className="mb-12" />

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {data.metrics.map((metric, idx) => {
              const parsed = parseDisplayValue(metric.valueDisplay);
              return (
                <ImpactStatCard
                  key={idx}
                  value={parsed.numericValue}
                  label={metric.label}
                  detail={metric.detail}
                  prefix={parsed.prefix}
                  suffix={parsed.suffix}
                  decimals={parsed.suffix === "%" ? 1 : 0}
                  delay={idx * 0.1}
                />
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {/* Donations Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0.15 } : undefined}
              className="bg-card border border-border rounded-xl p-6 min-h-[420px]"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">Donation Trend (PHP)</h3>
              <div className="h-[300px]">
                {donationLineData[0].data.length > 0 ? (
                  <ResponsiveLine
                    data={donationLineData}
                    margin={{ top: 20, right: 24, bottom: 72, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -25,
                      legend: 'Timeline',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      format: (value) => formatCompactCurrencyTick(Number(value)),
                      legend: 'PHP',
                      legendOffset: -45,
                      legendPosition: 'middle'
                    }}
                    colors={{ datum: 'color' }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    enableGridX={false}
                    animate={!reduceMotion}
                    useMesh={true}
                    legends={[lineLegend]}
                    theme={havenNivoTheme}
                    role="img"
                    ariaLabel="Donation trend chart showing monthly donation totals in Philippine pesos"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Trend data is not available yet. Once the backend returns monthly records, this chart will populate automatically.
                    </p>
                  </div>
                )}
              </div>
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View donation trend data table</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th>Month</th>
                        <th>Donation (PHP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.donationTrend.map((row) => (
                        <tr key={`donation-${row.monthLabel}`}>
                          <td>{row.monthLabel}</td>
                          <td>{row.donationAmountPhp.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </motion.div>

            {/* Residents Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0.15 } : undefined}
              className="bg-card border border-border rounded-xl p-6 min-h-[420px]"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">Active Residents Trend</h3>
              <div className="h-[300px]">
                {residentLineData[0].data.length > 0 ? (
                  <ResponsiveLine
                    data={residentLineData}
                    margin={{ top: 20, right: 24, bottom: 72, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false, reverse: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -25,
                      legend: 'Timeline',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      format: (value) => formatCompactChartNumber(Number(value)),
                      legend: 'Resident Count',
                      legendOffset: -45,
                      legendPosition: 'middle'
                    }}
                    colors={{ datum: 'color' }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    enableGridX={false}
                    animate={!reduceMotion}
                    useMesh
                    legends={[lineLegend]}
                    theme={havenNivoTheme}
                    role="img"
                    ariaLabel="Resident trend chart showing monthly active resident counts"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Resident monthly trend data is not available yet.
                    </p>
                  </div>
                )}
              </div>
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View resident trend data table</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th>Month</th>
                        <th>Active Residents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.donationTrend.map((row) => (
                        <tr key={`residents-${row.monthLabel}`}>
                          <td>{row.monthLabel}</td>
                          <td>{row.activeResidents.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </motion.div>

            {/* Safehouse Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0.15 } : undefined}
              className="bg-card border border-border rounded-xl p-6 min-h-[420px]"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">Safehouse Occupancy</h3>
              <div className="h-[300px]">
                {barData.length > 0 ? (
                  <ResponsiveBar
                    data={barData}
                    keys={['Occupancy', 'Capacity']}
                    indexBy="shortName"
                    margin={{ top: 16, right: 24, bottom: 72, left: 68 }}
                    padding={0.3}
                    groupMode="grouped"
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={[HAVEN_NIVO_COLORS[0], HAVEN_NIVO_COLORS[2]]}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -25,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      format: (value) => formatCompactChartNumber(Number(value)),
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelFormat={(value) => formatCompactChartNumber(Number(value))}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    legends={[barLegend]}
                    theme={havenNivoTheme}
                    animate={!reduceMotion}
                    role="img"
                    ariaLabel="Safehouse occupancy chart comparing current occupancy and capacity"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Safehouse occupancy data is not available yet. Once the dashboard has live safehouse records, this chart will render here.
                    </p>
                  </div>
                )}
              </div>
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View safehouse occupancy table</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th>Safehouse</th>
                        <th>Occupancy</th>
                        <th>Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barData.map((row) => (
                        <tr key={`safehouse-${row.name}`}>
                          <td>{row.name}</td>
                          <td>{row.Occupancy}</td>
                          <td>{row.Capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </motion.div>
          </div>

          {/* Testimonials */}
          <CulturalDivider variant="wave" className="mb-12" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="font-display text-3xl text-foreground mb-8">Voices of Hope</h2>
            <blockquote className="bg-card border border-border rounded-xl p-8">
              <p className="font-body text-lg text-muted-foreground italic leading-relaxed mb-4">
                "Project Haven didn't just offer shelter. It gave me a place where my identity, my family story, and my future all felt worth protecting."
              </p>
              <cite className="font-body text-sm text-primary not-italic">— Former resident from the Hopi-serving pilot safehouse</cite>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
