import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'react-hot-toast';

const COLORS = ['#1D6968', '#A0422A', '#DCAF6C', '#4A7C70', '#C4B49A'];

interface AnalyticsData {
  residents: Array<{
    status: string;
    riskLevel: string;
    safehouse: string;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/portal');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          toast.error("Failed to fetch analytics data");
        }
      } catch (error) {
        console.error("Analytics load error:", error);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-muted/20 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  // Aggregate Data
  const statusCounts = (data?.residents || []).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const statusPieData = Object.entries(statusCounts).map(([id, value]) => ({ id, label: id, value }));

  const riskCounts = (data?.residents || []).reduce((acc: Record<string, number>, r) => {
    acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
    return acc;
  }, {});

  const riskBarData = ['Low', 'Medium', 'High', 'Critical'].map(level => ({
    level,
    count: riskCounts[level] || 0
  }));

  const safehouseCounts = (data?.residents || []).reduce((acc: Record<string, number>, r) => {
    acc[r.safehouse] = (acc[r.safehouse] || 0) + 1;
    return acc;
  }, {});

  const safehouseBarData = Object.entries(safehouseCounts).map(([sh, count]) => ({
    sh,
    count: count as number
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground mb-1 tracking-tight">Executive Intelligence</h1>
        <p className="font-body text-sm text-muted-foreground">High-fidelity safehouse metrics and operational insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resident Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Enrollment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsivePie
                data={statusPieData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.6}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={COLORS}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="hsl(var(--foreground))"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                theme={{
                  labels: { text: { fontSize: 10, fontWeight: 700 } },
                  tooltip: { container: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Assessment Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Aggregate Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveBar
                data={riskBarData}
                keys={['count']}
                indexBy="level"
                margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
                padding={0.4}
                valueScale={{ type: 'linear' }}
                colors={({ index }) => COLORS[index % COLORS.length]}
                borderRadius={4}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Resident Count',
                  legendPosition: 'middle',
                  legendOffset: -40
                }}
                theme={{
                  axis: { ticks: { text: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } } },
                  grid: { line: { stroke: 'hsl(var(--border))', strokeWidth: 1 } },
                  tooltip: { container: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy by Safehouse */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Safehouse Occupancy Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveBar
                data={safehouseBarData}
                keys={['count']}
                indexBy="sh"
                margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
                padding={0.2}
                layout="horizontal"
                valueScale={{ type: 'linear' }}
                colors={[COLORS[0]]}
                borderRadius={2}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Total Residents',
                  legendPosition: 'middle',
                  legendOffset: 32
                }}
                theme={{
                  axis: { ticks: { text: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } } },
                  grid: { line: { stroke: 'hsl(var(--border))', strokeWidth: 1 } },
                  tooltip: { container: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between items-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div>
          <h3 className="font-display text-lg text-primary tracking-tight">Compliance & Privacy</h3>
          <p className="font-body text-xs text-muted-foreground mt-1">All analytics are derived from anonymized data points. Individual identities are protected per IS414 protocols.</p>
        </div>
        <button className="px-6 h-11 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          Generate Full Compliance Audit
        </button>
      </div>
    </div>
  );
}