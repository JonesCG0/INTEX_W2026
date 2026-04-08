import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IconUsers, 
  IconHeart, 
  IconTrendingUp, 
  IconAlertTriangle, 
  IconActivity,
  IconArrowRight
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const COLORS = ['#1D6968', '#A0422A', '#DCAF6C', '#4A7C70'];

interface DashboardOverview {
  dashboard: {
    metrics: Array<{ label: string; value: string; detail: string }>;
    alerts: Array<{ severity: string; title: string; detail: string }>;
    recentActivity: Array<{ activityAt: string; label: string; detail: string }>;
  };
  reports: {
    safehouseComparison: Array<{ safehouse: string; occupancy: number; capacity: number }>;
  };
}

const StatCard = ({ title, value, detail, Icon, color, delay = 0 }: { title: string, value: string | number, detail: string, Icon: any, color: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card className="hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: color } as React.CSSProperties}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10`, color }}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-1 truncate">{detail}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/admin/portal`, { credentials: 'include' });
        if (response.ok) {
          const result = await response.json();
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
          <p className="font-display font-medium text-foreground text-lg">Dashboard Unavailable</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">We couldn't load the operational overview. Please verify your connection or try logging out and back in.</p>
        </div>
      </div>
    );
  }

  const chartData = data?.reports?.safehouseComparison?.map(sh => ({
    safehouse: sh?.safehouse || '',
    "Occupancy": sh?.occupancy || 0,
    "Capacity": sh?.capacity || 0
  })) || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">Operational Overview</h1>
          <p className="font-body text-sm text-muted-foreground">Real-time status of Project Haven safehouses</p>
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
            Icon={[IconUsers, IconHeart, IconTrendingUp, IconAlertTriangle][i % 4]} 
            color={COLORS[i % 4]} 
            delay={i * 0.05} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-body text-base">Safehouse Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={chartData}
                keys={['Occupancy', 'Capacity']}
                indexBy="safehouse"
                margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                groupMode="grouped"
                valueScale={{ type: 'linear' }}
                colors={[COLORS[0], COLORS[2]]}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20
                  }
                ]}
                theme={{
                  axis: { ticks: { text: { fill: 'hsl(var(--muted-foreground))' } } },
                  grid: { line: { stroke: 'hsl(var(--border))' } },
                  legends: { text: { fill: 'hsl(var(--foreground))' } }
                }}
              />
            </div>
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
        </div>
      </div>
    </div>
  );
}