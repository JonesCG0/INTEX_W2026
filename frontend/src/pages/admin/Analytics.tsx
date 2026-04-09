import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useReducedMotion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'sonner';
import type { AdminPortalOverview, ResidentRecord } from '@/types/admin';
import { getRiskColor, HAVEN_NIVO_COLORS, havenNivoTheme } from '@/lib/nivo';

const COLORS = HAVEN_NIVO_COLORS;

export default function Analytics() {
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
  const statusCounts = (data?.residents || []).reduce((acc: Record<string, number>, r: ResidentRecord) => {
    acc[r.caseStatus] = (acc[r.caseStatus] || 0) + 1;
    return acc;
  }, {});

  const statusPieData = Object.entries(statusCounts).map(([id, value]) => ({ id, label: id, value }));

  const riskCounts = (data?.residents || []).reduce((acc: Record<string, number>, r: ResidentRecord) => {
    acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
    return acc;
  }, {});

  const riskBarData = ['Low', 'Medium', 'High', 'Critical'].map(level => ({
    level,
    count: riskCounts[level] || 0
  }));

  const safehouseCounts = (data?.residents || []).reduce((acc: Record<string, number>, r: ResidentRecord) => {
    acc[r.safehouse] = (acc[r.safehouse] || 0) + 1;
    return acc;
  }, {});

  const safehouseBarData = Object.entries(safehouseCounts).map(([sh, count]) => ({
    sh,
    count: count as number
  }));

  const monthlyTrendData = (data?.reports.monthlyTrends || []).map((point) => ({
    month: point.monthLabel,
    donations: point.donationsPhp,
    recordings: point.processRecordings,
    visitations: point.visitations,
  }));

  const allocationTotals = (data?.contributions || []).flatMap((contribution) => contribution.allocations).reduce((acc: Record<string, number>, allocation) => {
    acc[allocation.programArea] = (acc[allocation.programArea] || 0) + allocation.amountAllocated;
    return acc;
  }, {});

  const allocationData = Object.entries(allocationTotals).map(([programArea, amount]) => ({
    programArea,
    amount,
  }));

  const donationsMonthlyData = monthlyTrendData.map((point) => ({
    month: point.month,
    donations: point.donations,
  }));

  const interactionsMonthlyData = monthlyTrendData.map((point) => ({
    month: point.month,
    recordings: point.recordings,
    visitations: point.visitations,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground mb-1 tracking-tight">Executive Intelligence</h1>
        <p className="font-body text-sm text-muted-foreground">High-fidelity safehouse metrics and operational insights</p>
        <p className="font-body text-xs text-muted-foreground mt-2">
          Data refreshed {new Date(data?.generatedAt ?? Date.now()).toLocaleString()} from {data?.sourceTables?.length ?? 0} source tables.
        </p>
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
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 56,
                    itemWidth: 90,
                    itemHeight: 18,
                    symbolSize: 12,
                    itemTextColor: 'hsl(var(--foreground))',
                  },
                ]}
                theme={havenNivoTheme}
                role="img"
                ariaLabel="Resident enrollment status distribution chart"
                animate={!reduceMotion}
              />
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View status distribution table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusPieData.map((row) => (
                      <tr key={`status-${row.id}`}>
                        <td>{row.label}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
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
              {riskBarData.length > 0 ? (
                <ResponsiveBar
                  data={riskBarData}
                  keys={['count']}
                  indexBy="level"
                  margin={{ top: 20, right: 30, bottom: 72, left: 56 }}
                  padding={0.4}
                  valueScale={{ type: 'linear' }}
                  colors={({ data }) => getRiskColor(String(data.level))}
                  borderRadius={4}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Resident Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  theme={havenNivoTheme}
                  role="img"
                  ariaLabel="Resident risk assessment chart"
                  animate={!reduceMotion}
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">Risk distribution data is not available yet.</p>
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View risk distribution table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Risk level</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskBarData.map((row) => (
                      <tr key={`risk-${row.level}`}>
                        <td>{row.level}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
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
              {safehouseBarData.length > 0 ? (
                <ResponsiveBar
                  data={safehouseBarData}
                  keys={['count']}
                  indexBy="sh"
                  margin={{ top: 20, right: 30, bottom: 56, left: 56 }}
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
                  theme={havenNivoTheme}
                  role="img"
                  ariaLabel="Safehouse occupancy volume chart"
                  animate={!reduceMotion}
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">Safehouse occupancy volume data is not available yet.</p>
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View safehouse occupancy table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Safehouse</th>
                      <th>Residents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safehouseBarData.map((row) => (
                      <tr key={`safehouse-${row.sh}`}>
                        <td>{row.sh}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Monthly Donations (PHP)</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {donationsMonthlyData.length > 0 ? (
                <ResponsiveBar
                  data={donationsMonthlyData}
                  keys={['donations']}
                  indexBy="month"
                  margin={{ top: 20, right: 20, bottom: 72, left: 60 }}
                  padding={0.3}
                  groupMode="grouped"
                  colors={[COLORS[0]]}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom-left',
                      direction: 'row',
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 16,
                      itemWidth: 96,
                      itemHeight: 18,
                      symbolSize: 12,
                    },
                  ]}
                  theme={havenNivoTheme}
                  role="img"
                  ariaLabel="Monthly donations chart"
                  animate={!reduceMotion}
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">Monthly donations data is not available yet.</p>
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View monthly donation table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Month</th>
                      <th>Donations (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationsMonthlyData.map((row) => (
                      <tr key={`donations-${row.month}`}>
                        <td>{row.month}</td>
                        <td>{row.donations.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Monthly Case Interactions</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {interactionsMonthlyData.length > 0 ? (
                <ResponsiveBar
                  data={interactionsMonthlyData}
                  keys={['recordings', 'visitations']}
                  indexBy="month"
                  margin={{ top: 20, right: 20, bottom: 72, left: 60 }}
                  padding={0.3}
                  colors={[COLORS[1], COLORS[2]]}
                  theme={havenNivoTheme}
                  role="img"
                  ariaLabel="Monthly case interactions chart for recordings and visitations"
                  animate={!reduceMotion}
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">Case interaction data is not available yet.</p>
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View case interactions table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Month</th>
                      <th>Recordings</th>
                      <th>Visitations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interactionsMonthlyData.map((row) => (
                      <tr key={`interactions-${row.month}`}>
                        <td>{row.month}</td>
                        <td>{row.recordings.toLocaleString()}</td>
                        <td>{row.visitations.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground font-bold">Allocation Totals by Program</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {allocationData.length > 0 ? (
                <ResponsiveBar
                  data={allocationData}
                  keys={['amount']}
                  indexBy="programArea"
                  margin={{ top: 20, right: 20, bottom: 72, left: 70 }}
                  padding={0.3}
                  colors={[COLORS[3]]}
                  theme={havenNivoTheme}
                  role="img"
                  ariaLabel="Program allocation totals chart"
                  animate={!reduceMotion}
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">Program allocation data is not available yet.</p>
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">View allocation table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Program area</th>
                      <th>Total allocated (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationData.map((row) => (
                      <tr key={`allocation-${row.programArea}`}>
                        <td>{row.programArea}</td>
                        <td>{row.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between items-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div>
          <h3 className="font-display text-lg text-primary tracking-tight">Compliance & Privacy</h3>
          <p className="font-body text-xs text-muted-foreground mt-1">All analytics are derived from anonymized data points. Individual identities are protected per IS414 protocols.</p>
        </div>
        <button type="button" disabled className="px-6 h-11 bg-primary/60 text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/10 cursor-not-allowed">
          Generate Full Compliance Audit
        </button>
      </div>
    </div>
  );
}