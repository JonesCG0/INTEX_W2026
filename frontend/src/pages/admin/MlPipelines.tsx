import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch, readApiErrorMessage } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { IconActivity, IconArrowRight, IconChartBar } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

interface MlOverview {
  integration: {
    mode: string;
    studioUrl?: string | null;
    workspaceName?: string | null;
    resourceGroup?: string | null;
    subscriptionId?: string | null;
    statusMessage: string;
  };
  pipelines: MlPipeline[];
  recentRuns: MlRun[];
  generatedAt: string;
}

interface MlPipeline {
  key: string;
  name: string;
  domain: string;
  status: string;
  purpose: string;
  notebookPath: string;
  outputFileName: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  resultSummary: string;
  inputs: string[];
  outputs: string[];
  snapshot: MlSnapshot;
  recentRuns: MlRun[];
}

interface MlSnapshot {
  fileName?: string | null;
  lastModifiedAt?: string | null;
  rowCount: number;
  headers: string[];
  previewRows: string[][];
}

interface MlRun {
  runId: string;
  pipelineKey: string;
  pipelineName: string;
  status: string;
  progressPercent: number;
  startedAt: string;
  completedAt?: string | null;
  message: string;
  resultFileName?: string | null;
  resultSummary?: string | null;
}

const statusStyles: Record<string, string> = {
  Ready: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  Planned: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  Queued: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  Running: 'bg-primary/10 text-primary border-primary/20',
  Succeeded: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  Failed: 'bg-destructive/10 text-destructive border-destructive/20'
};

const formatDateTime = (value?: string | null) => value ? new Date(value).toLocaleString() : 'Not yet';

export default function MlPipelines() {
  const [data, setData] = useState<MlOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoadError(null);
    try {
      const response = await apiFetch(`${API_BASE}/api/ml/pipelines`);
      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, 'Failed to load ML pipeline overview.'));
      }

      setData(await response.json());
    } catch (error) {
      console.error('ML pipelines load error:', error);
      const message = error instanceof Error ? error.message : 'Failed to load pipeline data';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const readyCount = useMemo(() => data?.pipelines.filter(pipeline => pipeline.status === 'Ready').length ?? 0, [data]);

  const startRun = async (pipelineKey: string) => {
    setRunningKey(pipelineKey);
    try {
      const response = await apiFetch(`${API_BASE}/api/ml/pipelines/${pipelineKey}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes[pipelineKey] ?? '' })
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, 'Unable to start pipeline run.'));
      }

      const payload = await response.json();
      toast.success(`Started ${payload.pipelineName}`);
      await load();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to start run');
    } finally {
      setRunningKey(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted/20 rounded-lg animate-pulse" />)}
        </div>
        <div className="h-96 bg-muted/20 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-xl bg-card border-border/50 shadow-sm mt-6">
        <div className="text-center space-y-2">
          <p className="font-body font-medium text-foreground text-lg">ML Pipelines Unavailable</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {loadError ?? 'We could not load the pipeline catalog. Check the backend API or sign in again as an admin.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IconActivity className="h-5 w-5 text-primary" />
            <h1 className="font-body text-3xl text-foreground tracking-tight">ML Pipelines</h1>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Notebook-backed scoring pipelines with demo run control, output previews, and an Azure ML connection path.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
            {data.integration.mode}
          </Badge>
          <Button variant="outline" onClick={load} className="gap-2">
            <IconChartBar className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pipelines</p>
            <p className="mt-2 font-body text-3xl text-foreground">{data.pipelines.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Eight notebooks across donor, case management, and operations domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ready</p>
            <p className="mt-2 font-body text-3xl text-foreground">{readyCount}</p>
            <p className="text-xs text-muted-foreground mt-1">All notebooks are runnable in demo mode</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">With output</p>
            <p className="mt-2 font-body text-3xl text-foreground">{data.pipelines.filter(p => p.snapshot.rowCount > 0).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Notebooks that have produced scored output snapshots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest snapshot</p>
            <p className="mt-2 font-body text-xl text-foreground">{formatDateTime(data.generatedAt)}</p>
            <p className="text-xs text-muted-foreground mt-1">Catalog refreshed from the backend service</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
          {data.pipelines.map((pipeline) => {
            const latest = pipeline.recentRuns[0];
            const pipelineRuns = pipeline.recentRuns.length;
            return (
              <Card key={pipeline.key} className="overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/20">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="font-body text-xl">{pipeline.name}</CardTitle>
                        <Badge className={statusStyles[pipeline.status] ?? 'bg-muted text-muted-foreground border-border'}>
                          {pipeline.status}
                        </Badge>
                        <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                          {pipeline.domain}
                        </Badge>
                      </div>
                      <CardDescription className="max-w-3xl text-sm text-muted-foreground">
                        {pipeline.purpose}
                      </CardDescription>
                    </div>
                    <div className="md:text-right space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{pipeline.primaryMetricLabel}</span>
                        <span>{pipeline.primaryMetricValue}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Notebook: <span className="font-mono text-foreground">{pipeline.notebookPath}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Inputs</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pipeline.inputs.map((item) => (
                            <Badge key={item} variant="secondary" className="font-normal">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Outputs</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pipeline.outputs.map((item) => (
                            <Badge key={item} variant="outline" className="font-normal">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Current output snapshot</p>
                        <span className="text-xs text-muted-foreground">{pipeline.snapshot.rowCount} rows</span>
                      </div>
                      <p className="text-sm text-foreground">{pipeline.resultSummary}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Output file: <span className="font-mono text-foreground">{pipeline.snapshot.fileName ?? pipeline.outputFileName}</span></p>
                        <p>Last modified: <span className="text-foreground">{formatDateTime(pipeline.snapshot.lastModifiedAt)}</span></p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Latest pipeline activity</span>
                          <span className="text-foreground">{latest ? latest.status : 'No ad hoc run yet'}</span>
                        </div>
                        <Progress value={latest?.progressPercent ?? (pipeline.status === 'Planned' ? 0 : 100)} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <label htmlFor={`notes-${pipeline.key}`} className="text-xs uppercase tracking-widest text-muted-foreground">
                        Run notes
                      </label>
                      <Textarea
                        id={`notes-${pipeline.key}`}
                        value={notes[pipeline.key] ?? ''}
                        onChange={(event) => setNotes((current) => ({ ...current, [pipeline.key]: event.target.value }))}
                        placeholder="Optional context for the next run"
                        className="min-h-[88px] md:w-[420px]"
                        disabled={pipeline.status === 'Planned'}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => void startRun(pipeline.key)}
                        disabled={pipeline.status === 'Planned' || runningKey === pipeline.key}
                        className="gap-2"
                      >
                        {runningKey === pipeline.key ? 'Starting...' : 'Run pipeline'}
                        <IconArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Preview rows</p>
                      <p className="text-xs text-muted-foreground">{pipelineRuns} recent run(s)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {pipeline.snapshot.headers.map((header) => (
                              <TableHead key={header} className="whitespace-nowrap">
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pipeline.snapshot.previewRows.length > 0 ? (
                            pipeline.snapshot.previewRows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={`${rowIndex}-${cellIndex}`} className="whitespace-nowrap text-xs">
                                    {cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={Math.max(pipeline.snapshot.headers.length, 1)} className="text-sm text-muted-foreground">
                                No preview rows were found for this output snapshot yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
