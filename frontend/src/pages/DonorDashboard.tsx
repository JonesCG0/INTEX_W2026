import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { IconHeart } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { formatCompactCurrencyTick, HAVEN_NIVO_COLORS, barLegend, havenNivoTheme } from '@/lib/nivo';
import { formatMonthKey } from '@/lib/dashboard-format';

interface DonorDashboardData {
  displayName: string;
  totalImpactPhp: number;
  totalDonations: number;
  lastGiftingAt: string | null;
  contributions: Array<{
    id: number;
    type: string;
    amountPhp: number | null;
    programArea: string;
    description: string;
    date: string;
  }>;
  safehouseUpdates: Array<{
    safehouseName: string;
    updateTitle: string;
    updateDetail: string;
    postedAt: string;
  }>;
  impactStats: Array<{
    label: string;
    value: string;
    icon: string;
  }>;
  generatedAt: string;
  sourceTables: string[];
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DonorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`${API_BASE}/api/DonorPortal/dashboard`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          const errorData = await response.json().catch(() => null);
          const message = errorData?.error ?? 'Failed to load your personal impact data';
          setError(message);
          toast.error(message);
        }
      } catch (error) {
        console.error("Donor dash error:", error);
        setError('A network error occurred while loading your donor dashboard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 space-y-3">
            <h1 className="font-body text-2xl text-foreground">Donor Dashboard Unavailable</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              If this is a new donor account, the linked profile should be created automatically. Try signing out and back in if this persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <Card>
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground">No donor data is available yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeCounts = data.contributions.reduce((acc: Record<string, number>, contribution) => {
    acc[contribution.type] = (acc[contribution.type] || 0) + (contribution.amountPhp || 0);
    return acc;
  }, {});

  const pieData = Object.entries(typeCounts).map(([id, value]) => ({ id, label: id, value }));

  const monthCounts = data.contributions.reduce((acc: Record<string, number>, contribution) => {
    const month = formatMonthKey(contribution.date);
    acc[month] = (acc[month] || 0) + (contribution.amountPhp || 0);
    return acc;
  }, {});

  const barData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(`${month}-01T00:00:00`).toLocaleString('default', { month: 'short', year: '2-digit' }),
      amount: amount as number,
    }));

  const hasContributionData = pieData.length > 0;
  const hasTrendData = barData.length > 0;
  const compactLifetimeImpact = `₱${formatCompactCurrencyTick(data.totalImpactPhp)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-body text-3xl sm:text-4xl text-foreground mb-1 tracking-tight">Your Stewardship Journey</h1>
          <p className="font-body text-sm text-muted-foreground">Thank you for your partnership, {data.displayName}</p>
          <p className="font-body text-xs text-muted-foreground mt-2">
            Data refreshed {new Date(data.generatedAt).toLocaleString()} from {data.sourceTables?.length ?? 0} source tables.
          </p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Verified Donor Partner</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="min-h-[156px] p-6 sm:p-8 text-center flex flex-col justify-center">
              <p className="font-body text-3xl sm:text-4xl text-primary font-bold break-words leading-none">{compactLifetimeImpact}</p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Lifetime Impact</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="min-h-[156px] p-6 sm:p-8 text-center flex flex-col justify-center">
              <p className="font-body text-3xl sm:text-4xl text-foreground font-bold break-words leading-none">{data.totalDonations.toLocaleString()}</p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Gifts Recorded</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="min-h-[156px] p-6 sm:p-8 text-center flex flex-col justify-center">
              <p className="font-body text-3xl sm:text-4xl text-accent font-bold break-words leading-none">
                {data.lastGiftingAt ? new Date(data.lastGiftingAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Latest Gift</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="min-h-[370px]">
              <CardHeader>
                <CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold">Giving Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-[250px]">
                  {hasContributionData ? (
                    <ResponsivePie
                      data={pieData}
                      margin={{ top: 20, right: 20, bottom: 72, left: 20 }}
                      innerRadius={0.6}
                      padAngle={0.5}
                      cornerRadius={4}
                      colors={HAVEN_NIVO_COLORS}
                      enableArcLinkLabels={false}
                      theme={havenNivoTheme}
                      role="img"
                      ariaLabel="Donor giving allocation chart grouped by contribution type"
                      legends={[
                        {
                          anchor: 'bottom',
                          direction: 'row',
                          translateY: 56,
                          itemWidth: 72,
                          itemHeight: 18,
                          itemTextColor: 'hsl(var(--foreground))',
                          symbolSize: 10,
                          symbolShape: 'circle',
                        },
                      ]}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No donation history has been recorded yet. This chart will populate once contributions exist.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <details className="px-6 pb-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">View giving allocation table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Type</th>
                      <th>Total (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((row) => (
                      <tr key={`alloc-${row.id}`}>
                        <td>{row.label}</td>
                        <td>{Number(row.value).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </Card>

            <Card className="min-h-[370px]">
              <CardHeader>
                <CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold">Monthly Trends (PHP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-[250px]">
                  {hasTrendData ? (
                    <ResponsiveBar
                      data={barData}
                      keys={['amount']}
                      indexBy="month"
                      margin={{ top: 10, right: 10, bottom: 72, left: 64 }}
                      padding={0.4}
                      colors={[HAVEN_NIVO_COLORS[0]]}
                      borderRadius={4}
                      axisLeft={{
                        tickSize: 0,
                        tickPadding: 10,
                        format: (value) => formatCompactCurrencyTick(Number(value)),
                      }}
                      axisBottom={{ tickSize: 0, tickPadding: 10 }}
                      labelSkipWidth={16}
                      labelFormat={(value) => formatCompactCurrencyTick(Number(value))}
                      legends={[barLegend]}
                      theme={havenNivoTheme}
                      role="img"
                      ariaLabel="Monthly donor contribution trend chart"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Monthly contribution trends will appear after the first donation is recorded.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <details className="px-6 pb-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">View monthly contribution table</summary>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Month</th>
                      <th>Amount (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barData.map((row) => (
                      <tr key={`trend-${row.month}`}>
                        <td>{row.month}</td>
                        <td>{row.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold font-bold">Verified Contribution Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-body text-xs uppercase tracking-wider font-extrabold">Date</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-wider font-extrabold">Type</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-wider font-extrabold">Program Area</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-wider font-extrabold text-right">Amount (PHP)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.contributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-body italic">No contributions found in this record</TableCell>
                      </TableRow>
                    ) : (
                      data.contributions.map((contribution) => (
                        <TableRow key={contribution.id} className="border-b border-border/40 transition-colors odd:bg-card even:bg-muted/10 hover:bg-primary/5">
                          <TableCell className="font-body text-xs">{new Date(contribution.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-body text-xs pb-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-bold">
                              {contribution.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-body text-xs text-muted-foreground">{contribution.programArea}</TableCell>
                          <TableCell className="font-body text-xs font-bold text-right tracking-tight">₱{contribution.amountPhp?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="font-body text-xl text-foreground tracking-tight">Project Pulse</h3>
          {data.safehouseUpdates.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">No safehouse updates are available yet.</p>
              </CardContent>
            </Card>
          ) : (
            data.safehouseUpdates.map((update, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}>
                <Card className="hover:border-primary/40 transition-colors group cursor-default">
                  <CardContent className="p-6">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="max-w-full break-words text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded">
                        {update.safehouseName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-body text-base text-foreground mb-2 group-hover:text-primary transition-colors">{update.updateTitle}</h4>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{update.updateDetail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <h4 className="font-body text-sm text-secondary mb-3 flex items-center gap-2">
                <IconHeart className="h-4 w-4" />
                Stewardship Support
              </h4>
              <p className="font-body text-xs text-muted-foreground mb-4">
                Have questions about your giving history or need a tax certificate? Our stewardship team is here to help.
              </p>
              <Button size="sm" variant="outline" className="w-full text-xs uppercase tracking-widest border-secondary/30 text-secondary hover:bg-secondary/5">
                Contact Steward
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
