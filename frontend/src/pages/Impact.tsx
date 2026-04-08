import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import ImpactStatCard from '../components/ImpactStatCard';
import CulturalDivider from '../components/CulturalDivider';
import { motion } from 'framer-motion';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { toast } from 'react-hot-toast';

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
}

const COLORS = ['#1D6968', '#A0422A', '#DCAF6C', '#4A7C70', '#C4B49A'];

export default function Impact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const response = await fetch(`${API_BASE}/api/public/impact`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          toast.error("Failed to load impact data.");
        }
      } catch (error) {
        console.error("Impact fetch error:", error);
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

  const lineData = [
    {
      id: "Donations",
      color: COLORS[0],
      data: data?.donationTrend.map(pt => ({
        x: pt.monthLabel,
        y: pt.donationAmountPhp
      })) || []
    },
    {
      id: "Residents",
      color: COLORS[1],
      data: data?.donationTrend.map(pt => ({
        x: pt.monthLabel,
        y: pt.activeResidents
      })) || []
    }
  ];

  const barData = data?.safehouses.map(sh => ({
    name: sh.name,
    "Occupancy": sh.currentOccupancy,
    "Capacity": sh.capacityGirls
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              {data?.hero.headline || "Impact Dashboard"}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              {data?.hero.summary || "Transparent reporting on how your support transforms lives and strengthens communities"}
            </p>
            {data?.hero.publishedLabel && (
              <p className="text-xs text-muted-foreground mt-4 opacity-70 uppercase tracking-widest">
                {data.hero.publishedLabel}
              </p>
            )}
          </motion.div>

          <CulturalDivider variant="step" className="mb-12" />

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {data?.metrics?.map((metric, idx) => {
              // Extract numeric value if possible for animation, otherwise just show label
              const numericValue = parseInt(metric.valueDisplay.replace(/[^\d]/g, '')) || 0;
              const hasPrefix = metric.valueDisplay.includes("PHP");
              
              return (
                <ImpactStatCard 
                  key={idx}
                  value={numericValue} 
                  label={metric.label}
                  prefix={hasPrefix ? "₱" : ""}
                  delay={idx * 0.1} 
                />
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Trends Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 h-[400px]"
            >
              <h3 className="font-body text-lg font-semibold text-foreground mb-4 text-center">Impact Trends</h3>
              <div className="h-[300px]">
                <ResponsiveLine
                  data={lineData}
                  margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Timeline',
                    legendOffset: 36,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Volume',
                    legendOffset: -45,
                    legendPosition: 'middle'
                  }}
                  colors={{ datum: 'color' }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                  theme={{
                    axis: {
                      ticks: { text: { fill: 'hsl(var(--muted-foreground))' } },
                      legend: { text: { fill: 'hsl(var(--muted-foreground))' } }
                    },
                    grid: { line: { stroke: 'hsl(var(--border))' } },
                    legends: { text: { fill: 'hsl(var(--foreground))' } }
                  }}
                />
              </div>
            </motion.div>

            {/* Safehouse Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 h-[400px]"
            >
              <h3 className="font-body text-lg font-semibold text-foreground mb-4 text-center">Safehouse Occupancy</h3>
              <div className="h-[300px]">
                <ResponsiveBar
                  data={barData}
                  keys={['Occupancy', 'Capacity']}
                  indexBy="name"
                  margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  groupMode="grouped"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={[COLORS[0], COLORS[2]]}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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
                      symbolSize: 20,
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                  theme={{
                    axis: {
                      ticks: { text: { fill: 'hsl(var(--muted-foreground))' } },
                    },
                    grid: { line: { stroke: 'hsl(var(--border))' } },
                    legends: { text: { fill: 'hsl(var(--foreground))' } }
                  }}
                />
              </div>
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
                "Project Haven didn't just give me a roof — they gave me back my identity. The counselors understood my culture, my language, my pain. For the first time, I felt like I belonged somewhere."
              </p>
              <cite className="font-body text-sm text-primary not-italic">— Former Resident, Hopi Haven</cite>
            </blockquote>
          </motion.div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}