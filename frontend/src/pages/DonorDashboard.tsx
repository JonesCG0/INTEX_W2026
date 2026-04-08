import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'react-hot-toast';
import { IconHeart } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

const COLORS = ['#1D6968', '#A0422A', '#DCAF6C', '#4A7C70', '#C4B49A'];

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
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DonorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/DonorPortal/dashboard');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          toast.error("Failed to load your personal impact data");
        }
      } catch (error) {
        console.error("Donor dash error:", error);
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

  if (!data) return null;

  // Prepare Chart Data
  const typeCounts = data.contributions.reduce((acc: Record<string, number>, c) => {
    acc[c.type] = (acc[c.type] || 0) + (c.amountPhp || 0);
    return acc;
  }, {});

  const pieData = Object.entries(typeCounts).map(([id, value]) => ({ id, label: id, value }));

  const monthCounts = data.contributions.reduce((acc: Record<string, number>, c) => {
    const month = new Date(c.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + (c.amountPhp || 0);
    return acc;
  }, {});

  const barData = Object.entries(monthCounts).map(([month, amount]) => ({ month, amount: amount as number }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-1 tracking-tight">Your Stewardship Journey</h1>
          <p className="font-body text-sm text-muted-foreground">Thank you for your partnership, {data.displayName}</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Verified Donor Partner</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-8 text-center">
              <p className="font-display text-4xl text-primary font-bold">₱{data.totalImpactPhp.toLocaleString()}</p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Lifetime Impact</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-display text-4xl text-foreground font-bold">{data.totalDonations}</p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Gifts Recorded</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-display text-4xl text-accent font-bold">
                {data.lastGiftingAt ? new Date(data.lastGiftingAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mt-2 font-bold">Latest Gift</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-[350px]">
              <CardHeader><CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold">Giving Allocation</CardTitle></CardHeader>
              <CardContent className="h-[270px]">
                <ResponsivePie
                  data={pieData}
                  margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                  innerRadius={0.6}
                  padAngle={0.5}
                  cornerRadius={4}
                  colors={COLORS}
                  enableArcLinkLabels={false}
                  theme={{
                    tooltip: { container: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }
                  }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 50,
                      itemWidth: 80,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      symbolSize: 10,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="h-[350px]">
              <CardHeader><CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold">Monthly Trends (PHP)</CardTitle></CardHeader>
              <CardContent className="h-[270px]">
                <ResponsiveBar
                  data={barData}
                  keys={['amount']}
                  indexBy="month"
                  margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                  padding={0.4}
                  colors={[COLORS[0]]}
                  borderRadius={4}
                  axisLeft={{ tickSize: 0, tickPadding: 10 }}
                  axisBottom={{ tickSize: 0, tickPadding: 10 }}
                  theme={{
                    axis: { ticks: { text: { fontSize: 10 } } },
                    grid: { line: { stroke: 'hsl(var(--border))' } },
                    tooltip: { container: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Donation History Table */}
          <Card>
            <CardHeader><CardTitle className="font-body text-xs uppercase tracking-widest text-muted-foreground font-extrabold font-bold">Verified Contribution Record</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-body text-[10px] uppercase tracking-wider font-extrabold">Date</TableHead>
                      <TableHead className="font-body text-[10px] uppercase tracking-wider font-extrabold">Type</TableHead>
                      <TableHead className="font-body text-[10px] uppercase tracking-wider font-extrabold">Program Area</TableHead>
                      <TableHead className="font-body text-[10px] uppercase tracking-wider font-extrabold text-right">Amount (PHP)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.contributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-body italic">No contributions found in this record</TableCell>
                      </TableRow>
                    ) : (
                      data.contributions.map(c => (
                        <TableRow key={c.id} className="hover:bg-muted/10 transition-colors border-b border-border/40">
                          <TableCell className="font-body text-xs">{new Date(c.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-body text-xs pb-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold">
                              {c.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-body text-xs text-muted-foreground">{c.programArea}</TableCell>
                          <TableCell className="font-body text-xs font-bold text-right tracking-tight">₱{c.amountPhp?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safehouse Updates Sidebar */}
        <div className="space-y-6">
          <h3 className="font-display text-xl text-foreground tracking-tight">Project Pulse</h3>
          {data.safehouseUpdates.map((update, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}>
              <Card className="hover:border-primary/40 transition-colors group cursor-default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded">
                      {update.safehouseName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(update.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-display text-base text-foreground mb-2 group-hover:text-primary transition-colors">{update.updateTitle}</h4>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{update.updateDetail}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <h4 className="font-display text-sm text-secondary mb-3 flex items-center gap-2">
                <IconHeart className="h-4 w-4" />
                Stewardship Support
              </h4>
              <p className="font-body text-[11px] text-muted-foreground mb-4">
                Have questions about your giving history or need a tax certificate? Our stewardship team is here to help.
              </p>
              <Button size="sm" variant="outline" className="w-full text-[10px] uppercase tracking-widest border-secondary/30 text-secondary hover:bg-secondary/5">
                Contact Steward
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}