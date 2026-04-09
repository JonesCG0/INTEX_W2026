import { useEffect, useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconArrowLeft, IconPlus, IconCalendar, IconUser, IconHeartRateMonitor, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import type { AdminPortalOverview, RecordingRecord, ResidentRecord } from '@/types/admin';

const sessionTypes = ["Intake", "Individual Counseling", "Group Session", "Family Meeting", "Crisis Intervention", "Discharge Planning"];
const emotionalStates = ["Calm", "Anxious", "Distressed", "Hopeful", "Withdrawn", "Agitated"];

export default function Recordings() {
  const { id: residentId } = useParams();

  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [resident, setResident] = useState<ResidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<RecordingRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecordingRecord | null>(null);

  const [form, setForm] = useState({
    sessionAt: new Date().toISOString().split('T')[0],
    sessionType: 'Individual Counseling',
    sessionDurationMinutes: '60',
    emotionalState: 'Calm',
    emotionalStateEnd: 'Calm',
    staffName: '',
    summary: '',
    interventions: '',
    followUp: '',
    progressNoted: false,
    concernsFlagged: false,
    referralMade: false,
    notesRestricted: '',
  });

  async function load() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/residents/${residentId}/recordings`);
      if (response.ok) {
        const data: { recordings: RecordingRecord[] } = await response.json();
        setRecordings(data.recordings || []);
      }

      const portalResp = await apiFetch(`${API_BASE}/api/admin/portal`);
      if (portalResp.ok) {
        const portalData: AdminPortalOverview = await portalResp.json();
        const match = portalData.residents?.find((r) => r.id?.toString() === residentId);
        setResident(match || null);
      }
    } catch (error) {
      console.error("Load recordings error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [residentId]);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  function openCreate() {
    setEditingRecording(null);
    setForm({
      sessionAt: new Date().toISOString().split('T')[0],
      sessionType: 'Individual Counseling',
      sessionDurationMinutes: '60',
      emotionalState: 'Calm',
      emotionalStateEnd: 'Calm',
      staffName: '',
      summary: '',
      interventions: '',
      followUp: '',
      progressNoted: false,
      concernsFlagged: false,
      referralMade: false,
      notesRestricted: '',
    });
    setDrawerOpen(true);
  }

  function openEdit(recording: RecordingRecord) {
    setEditingRecording(recording);
    setForm({
      sessionAt: new Date(recording.sessionAt).toISOString().split('T')[0],
      sessionType: recording.sessionType,
      sessionDurationMinutes: recording.sessionDurationMinutes.toString(),
      emotionalState: recording.emotionalState,
      emotionalStateEnd: recording.emotionalStateEnd,
      staffName: recording.staffName,
      summary: recording.summary,
      interventions: recording.interventions,
      followUp: recording.followUp,
      progressNoted: recording.progressNoted,
      concernsFlagged: recording.concernsFlagged,
      referralMade: recording.referralMade,
      notesRestricted: recording.notesRestricted || '',
    });
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    try {
      const url = editingRecording
        ? `${API_BASE}/api/admin/portal/recordings/${editingRecording.id}`
        : `${API_BASE}/api/admin/portal/recordings`;
      const method = editingRecording ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId: Number(residentId),
          sessionAt: new Date(form.sessionAt).toISOString(),
          staffName: form.staffName,
          sessionType: form.sessionType,
          sessionDurationMinutes: Number(form.sessionDurationMinutes || 0),
          emotionalState: form.emotionalState,
          emotionalStateEnd: form.emotionalStateEnd,
          summary: form.summary,
          interventions: form.interventions,
          followUp: form.followUp,
          progressNoted: form.progressNoted,
          concernsFlagged: form.concernsFlagged,
          referralMade: form.referralMade,
          notesRestricted: form.notesRestricted || null,
        })
      });

      if (response.ok) {
        toast.success(editingRecording ? "Session updated" : "Case session recorded");
        setDrawerOpen(false);
        setEditingRecording(null);
        await load();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.error || "Failed to save recording");
      }
    } catch (error) {
      toast.error("Failed to save recording");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/recordings/${deleteTarget.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });

      if (response.ok) {
        toast.success("Session removed");
        setDeleteTarget(null);
        await load();
      } else {
        toast.error("Failed to delete session");
      }
    } catch (error) {
      toast.error("Failed to delete session");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted/20 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Link to="/admin/residents">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded">Clinical File</span>
            <h1 className="font-display text-3xl text-foreground tracking-tight">{resident?.codeName || 'Anonymized Resident'}</h1>
          </div>
          <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
            Status: <span className="font-semibold text-foreground">Verified</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            Safehouse: <span className="font-semibold text-foreground">{resident?.safehouse || 'Unknown'}</span>
          </p>
        </div>
        <Button onClick={openCreate} className="font-body gap-2 ml-auto shadow-sm">
          <IconPlus className="h-4 w-4" />
          Document Session
        </Button>
      </div>

      <div className="relative pl-10 space-y-8">
        <div className="absolute left-[13px] top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />

        {recordings.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <IconHeartRateMonitor className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground font-body">No clinical sessions have been documented for this resident.</p>
          </div>
        ) : (
          recordings.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[32px] top-6 w-5 h-5 rounded-full bg-background border-4 border-primary shadow-sm z-10" />

              <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
                <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {new Date(rec.sessionAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className="h-1 w-1 rounded-full bg-primary/30" />
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <IconUser className="h-3.5 w-3.5" />
                      {rec.staffName}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-primary text-primary-foreground">{rec.sessionType}</span>
                    {rec.emotionalState && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-accent/20 text-accent-foreground">{rec.emotionalState}</span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rec)}>
                      <IconPencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(rec)}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Clinical Summary</h4>
                      <p className="font-body text-sm text-foreground leading-relaxed">{rec.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rec.interventions && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Interventions Applied</h4>
                          <p className="font-body text-xs text-foreground/80 leading-relaxed italic">{rec.interventions}</p>
                        </div>
                      )}
                      {rec.followUp && (
                        <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                          <h4 className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2">Follow-up Plan</h4>
                          <p className="font-body text-xs text-foreground/80 leading-relaxed">{rec.followUp}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/40">
                        {rec.sessionDurationMinutes} min
                      </span>
                      {rec.emotionalStateEnd && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/40">
                          End state: {rec.emotionalStateEnd}
                        </span>
                      )}
                      {rec.progressNoted && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Progress noted</span>}
                      {rec.concernsFlagged && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Concern flagged</span>}
                      {rec.referralMade && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Referral made</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl tracking-tight">
              {editingRecording ? 'Edit Clinical Process Recording' : 'Clinical Process Recording'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Session Date</Label>
                <Input type="date" value={form.sessionAt} onChange={(e: ChangeEvent<HTMLInputElement>) => update('sessionAt', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Session Modality</Label>
                <Select value={form.sessionType} onValueChange={v => update('sessionType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{sessionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Duration (minutes)</Label>
                <Input type="number" value={form.sessionDurationMinutes} onChange={(e: ChangeEvent<HTMLInputElement>) => update('sessionDurationMinutes', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Ending Emotional State</Label>
                <Select value={form.emotionalStateEnd} onValueChange={v => update('emotionalStateEnd', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{emotionalStates.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Primary Emotional State</Label>
              <Select value={form.emotionalState} onValueChange={v => update('emotionalState', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{emotionalStates.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Staff Name</Label>
              <Input value={form.staffName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('staffName', e.target.value)} className="mt-1" />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Clinical Narrative / Summary</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('summary', e.target.value)}
                  className="font-body mt-1 min-h-[120px]"
                  placeholder="Detailed neutral narrative of the interaction..."
                />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Therapeutic Interventions</Label>
                <Textarea
                  value={form.interventions}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('interventions', e.target.value)}
                  className="font-body mt-1 min-h-[80px]"
                  placeholder="Techniques used (e.g. CBT, active listening, de-escalation)..."
                />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Follow-up / Action Items</Label>
                <Textarea
                  value={form.followUp}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('followUp', e.target.value)}
                  className="font-body mt-1 min-h-[80px]"
                  placeholder="Plan for the next interaction or internal referral..."
                />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Restricted Notes</Label>
                <Textarea
                  value={form.notesRestricted}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('notesRestricted', e.target.value)}
                  className="font-body mt-1 min-h-[80px]"
                  placeholder="Restricted follow-up or safeguarding details..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={form.progressNoted} onCheckedChange={(checked: boolean | 'indeterminate') => update('progressNoted', checked === true)} />
                <span className="font-body text-sm">Progress noted</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={form.concernsFlagged} onCheckedChange={(checked: boolean | 'indeterminate') => update('concernsFlagged', checked === true)} />
                <span className="font-body text-sm">Concern flagged</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={form.referralMade} onCheckedChange={(checked: boolean | 'indeterminate') => update('referralMade', checked === true)} />
                <span className="font-body text-sm">Referral made</span>
              </label>
            </div>

            <div className="pt-4">
              <Button onClick={handleSubmit} className="w-full h-12 font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                {editingRecording ? 'Save Changes' : 'Commit to Permanent Clinical Record'}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 italic uppercase tracking-wider">
                This entry will be cryptographically linked to your staff identity.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Clinical Record"
        description={`Are you sure you want to delete the session recorded by ${deleteTarget?.staffName} on ${deleteTarget ? new Date(deleteTarget.sessionAt).toLocaleDateString() : ''}? This cannot be undone.`}
      />
    </div>
  );
}
