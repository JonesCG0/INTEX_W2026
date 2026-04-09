import { useState, useEffect, type ComponentType } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IconUsers, 
  IconHeart, 
  IconTrendingUp, 
  IconAlertTriangle, 
  IconActivity,
  IconArrowRight
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { AdminPortalOverview } from '@/types/admin';
import { formatCompactChartNumber, HAVEN_NIVO_COLORS, barLegend, havenNivoTheme, shortenSafehouseLabel } from '@/lib/nivo';

const COLORS = HAVEN_NIVO_COLORS;
const STAT_BORDER_CLASSES = ['border-l-chart-1', 'border-l-chart-2', 'border-l-chart-3', 'border-l-chart-4'] as const;
const STAT_ICON_CLASSES = ['bg-chart-1/10 text-chart-1', 'bg-chart-2/10 text-chart-2', 'bg-chart-3/10 text-chart-3', 'bg-chart-4/10 text-chart-4'] as const;

const METRIC_VISUALS: Array<{
  matcher: (label: string) => boolean;
  icon: ComponentType<{ className?: string }>;
  colorIndex: number;
}> = [
  { matcher: (label) => /resident/i.test(label), icon: IconUsers, colorIndex: 0 },
  { matcher: (label) => /donation|fund|supporter|donor/i.test(label), icon: IconHeart, colorIndex: 1 },
  { matcher: (label) => /occupancy|capacity|safehouse|active/i.test(label), icon: IconTrendingUp, colorIndex: 2 },
  { matcher: () => true, icon: IconAlertTriangle, colorIndex: 3 },
];

function getMetricVisual(label: string) {
  return METRIC_VISUALS.find((item) => item.matcher(label)) ?? METRIC_VISUALS[METRIC_VISUALS.length - 1];
}

const StatCard = ({ title, value, detail, Icon, colorIndex, delay = 0 }: { title: string, value: string | number, detail: string, Icon: ComponentType<{ className?: string }>, colorIndex: number, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card className={`hover:shadow-md transition-all border-l-4 ${STAT_BORDER_CLASSES[colorIndex] ?? STAT_BORDER_CLASSES[0]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${STAT_ICON_CLASSES[colorIndex] ?? STAT_ICON_CLASSES[0]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="font-body text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-1 truncate">{detail}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<AdminPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`${API_BASE}/api/admin/portal`);
        if (response.ok) {
          const result: AdminPortalOverview = await response.json();
          setData(result);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-xl bg-card border-border/50 shadow-sm mt-6">
        <div className="text-center space-y-2">
          <p className="font-body font-medium text-foreground text-lg">Dashboard Unavailable</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">We couldn't load the operational overview. Please verify your connection or try logging out and back in.</p>
        </div>
      </div>
    );
  }

  const chartData = data?.reports?.safehouseComparison?.map(sh => ({
    safehouse: sh?.safehouse || '',
    shortSafehouse: shortenSafehouseLabel(sh?.safehouse || ''),
    "Occupancy": sh?.occupancy || 0,
    "Capacity": sh?.capacity || 0
  })) || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-body text-2xl text-foreground mb-1">Operational Overview</h1>
          <p className="font-body text-sm text-muted-foreground">Real-time status of Project Haven safehouses</p>
          <p className="font-body text-xs text-muted-foreground mt-2">
            Data refreshed {new Date(data.generatedAt).toLocaleString()} from {data.sourceTables?.length ?? 0} source tables.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <Link to="/admin/residents" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            Manage Residents <IconArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.dashboard?.metrics?.map((m, i) => (
          <StatCard
            key={i}
            title={m?.label || ''}
            value={m?.value || 0}
            detail={m?.detail || ''}
            Icon={getMetricVisual(m?.label || '').icon}
            colorIndex={getMetricVisual(m?.label || '').colorIndex}
            delay={i * 0.05}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <Card className="lg:col-span-2 min-h-[420px]">
          <CardHeader>
            <CardTitle className="font-body text-base">Safehouse Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveBar
                  data={chartData}
                  keys={['Occupancy', 'Capacity']}
                  indexBy="shortSafehouse"
                  margin={{ top: 20, right: 24, bottom: 72, left: 68 }}
                  padding={0.3}
                  groupMode="grouped"
                  valueScale={{ type: 'linear' }}
                  colors={[COLORS[0], COLORS[2]]}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -20,
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
                  legends={[barLegend]}
                  theme={havenNivoTheme}
                  animate={!reduceMotion}
                  role="img"
                  ariaLabel="Safehouse comparison chart showing occupancy and capacity"
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Safehouse occupancy data is not available yet. Once the portal has resident counts, this chart will populate automatically.
                  </p>
                </div>
              )}
            </div>
            <details>
              <summary className="text-xs text-muted-foreground cursor-pointer">View safehouse comparison table</summary>
              <table className="w-full mt-2 text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th>Safehouse</th>
                    <th>Occupancy</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={`admin-safehouse-${row.safehouse}`}>
                      <td>{row.safehouse}</td>
                      <td>{row.Occupancy}</td>
                      <td>{row.Capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </CardContent>
        </Card>

        {/* Alerts & Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-body text-base flex items-center gap-2 text-destructive">
                <IconAlertTriangle className="h-4 w-4" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!data?.dashboard?.alerts || data.dashboard.alerts.length === 0) ? (
                <p className="text-sm text-muted-foreground italic">No active alerts</p>
              ) : (
                data.dashboard.alerts.map((alert, i) => (
                  <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-sm font-semibold text-destructive">{alert?.title || 'Alert'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert?.detail || ''}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-body text-base flex items-center gap-2">
                <IconActivity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.dashboard?.recentActivity?.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-primary" />
                  <div>
                    <p className="font-body text-foreground leading-tight">{activity?.label || ''}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      {activity?.activityAt ? new Date(activity.activityAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-body text-base">ML Reintegration Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!data?.reports?.reintegrationQueue || data.reports.reintegrationQueue.length === 0) ? (
                <p className="text-sm text-muted-foreground italic">No ML readiness predictions are available yet.</p>
              ) : (
                data.reports.reintegrationQueue.map((prediction) => (
                  <div key={`${prediction.residentId}-${prediction.predictionTimestamp ?? 'current'}`} className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{prediction.residentCode}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {prediction.safehouse} · {prediction.caseStatus}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-xl text-primary">
                          {(prediction.reintegrationReadinessProbability * 100).toFixed(0)}%
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {prediction.predictedReadyWithin180Days ? 'Ready within 180d' : 'Monitor closely'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Scored {prediction.predictionTimestamp ? new Date(prediction.predictionTimestamp).toLocaleString() : 'recently'} via {prediction.modelName}.
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
