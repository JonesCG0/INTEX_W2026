import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IconActivity, IconHeart, IconTrendingUp } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import type { DonorRelationshipKr, DonorRelationshipOkrs } from '@/types/admin';

const krCards: Array<{
  key: keyof Pick<DonorRelationshipOkrs, 'retentionRate' | 'upgradeRate' | 'portalEngagementRate'>;
  icon: typeof IconHeart;
  iconClass: string;
  borderClass: string;
}> = [
  {
    key: 'retentionRate',
    icon: IconHeart,
    iconClass: 'bg-chart-1/10 text-chart-1',
    borderClass: 'border-l-chart-1',
  },
  {
    key: 'upgradeRate',
    icon: IconTrendingUp,
    iconClass: 'bg-chart-2/10 text-chart-2',
    borderClass: 'border-l-chart-2',
  },
  {
    key: 'portalEngagementRate',
    icon: IconActivity,
    iconClass: 'bg-chart-3/10 text-chart-3',
    borderClass: 'border-l-chart-3',
  },
];

function formatPercent(value: number | null) {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)}%`;
}

function KrCard({
  kr,
  Icon,
  iconClass,
  borderClass,
  index,
  reduceMotion,
}: {
  kr: DonorRelationshipKr;
  Icon: typeof IconHeart;
  iconClass: string;
  borderClass: string;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reduceMotion ? undefined : { duration: 0.35, delay: 0.08 * index }}
    >
      <Card className={`border-l-4 ${borderClass}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="font-body text-lg text-foreground">{kr.title}</CardTitle>
            <div className={`rounded-lg p-2 ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <p className="font-body text-sm text-muted-foreground">{kr.explanation}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Value</p>
              <p className="font-display text-3xl text-foreground">{formatPercent(kr.percent)}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ratio</p>
              <p className="font-body text-2xl font-semibold text-foreground">{kr.numerator} / {kr.denominator}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formula</p>
            <p className="mt-1 font-body text-sm text-foreground">{kr.formula}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DonorRelationshipOkrsPage() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<DonorRelationshipOkrs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`${API_BASE}/api/admin/portal/donor-relationship-okrs`);
        if (!response.ok) {
          toast.error('Failed to load donor relationship OKRs.');
          return;
        }

        const result: DonorRelationshipOkrs = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to load donor relationship OKRs:', error);
        toast.error('A network error occurred while loading donor relationship OKRs.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded bg-muted/30" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/20" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl bg-muted/20" />
          <div className="h-80 animate-pulse rounded-xl bg-muted/20" />
          <div className="h-80 animate-pulse rounded-xl bg-muted/20" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-border/60 bg-card">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl text-foreground">Donor Relationship OKRs Unavailable</h1>
          <p className="font-body text-sm text-muted-foreground">
            The donor relationship metrics could not be loaded. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl text-foreground">Donor Relationship OKRs</h1>
        <p className="font-body text-sm text-muted-foreground">Actively measured objective and key results for supporter relationship health.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-body text-lg text-foreground">Objective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-body text-base text-foreground">{data.objectiveStatement}</p>
          <p className="font-body text-xs text-muted-foreground">{data.periodDescription}</p>
          <p className="font-body text-xs text-muted-foreground">
            Last computed: {new Date(data.computedAtUtc).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {krCards.map((item, index) => (
          <KrCard
            key={item.key}
            kr={data[item.key]}
            Icon={item.icon}
            iconClass={item.iconClass}
            borderClass={item.borderClass}
            index={index}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
