import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
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
import { IconPlus, IconCalendar, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import type { AdminPortalOverview, ResidentRecord, VisitationRecord } from '@/types/admin';

const visitTypes = [
  "Routine follow-up",
  "Safety check",
  "Family meeting",
  "Reintegration assessment",
  "Case conference",
  "Initial assessment",
];

export default function Visitations() {
  const { id: residentIdParam } = useParams();

  const [visitations, setVisitations] = useState<VisitationRecord[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVisitation, setEditingVisitation] = useState<VisitationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitationRecord | null>(null);
  const [residentFilter, setResidentFilter] = useState(residentIdParam || 'all');

  const [form, setForm] = useState({
    residentId: residentIdParam ? Number(residentIdParam) : 0,
    visitAt: new Date().toISOString().split('T')[0],
    visitType: 'Routine follow-up',
    socialWorker: '',
    locationVisited: '',
    familyMembersPresent: '',
    purpose: '',
    observations: '',
    familyCooperation: 'Moderate',
    safetyConcernsNoted: false,
    followUpNeeded: false,
    followUpNotes: '',
    visitOutcome: '',
  });

  async function load() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal`);
      if (response.ok) {
        const data: AdminPortalOverview = await response.json();
        setResidents(data.residents || []);
        setVisitations(data.visitations || []);
      }
    } catch (error) {
      console.error("Load visitations error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (residentIdParam) {
      setResidentFilter(residentIdParam);
      setForm(prev => ({ ...prev, residentId: Number(residentIdParam) }));
    }
  }, [residentIdParam]);

  const filteredVisitations = useMemo(() => {
    if (residentFilter === 'all') return visitations;
    return visitations.filter(v => v.residentId.toString() === residentFilter);
  }, [visitations, residentFilter]);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  function openCreate() {
    setEditingVisitation(null);
    setForm({
      residentId: residentIdParam ? Number(residentIdParam) : (residents[0]?.id || 0),
      visitAt: new Date().toISOString().split('T')[0],
      visitType: 'Routine follow-up',
      socialWorker: '',
      locationVisited: '',
      familyMembersPresent: '',
      purpose: '',
      observations: '',
      familyCooperation: 'Moderate',
      safetyConcernsNoted: false,
      followUpNeeded: false,
      followUpNotes: '',
      visitOutcome: '',
    });
    setDrawerOpen(true);
  }

  function openEdit(visitation: VisitationRecord) {
    setEditingVisitation(visitation);
    setForm({
      residentId: visitation.residentId,
      visitAt: new Date(visitation.visitAt).toISOString().split('T')[0],
      visitType: visitation.visitType,
      socialWorker: visitation.socialWorker,
      locationVisited: visitation.locationVisited,
      familyMembersPresent: visitation.familyMembersPresent || '',
      purpose: visitation.purpose,
      observations: visitation.observations,
      familyCooperation: visitation.familyCooperation,
      safetyConcernsNoted: visitation.safetyConcernsNoted,
      followUpNeeded: visitation.followUpNeeded,
      followUpNotes: visitation.followUpNotes || '',
      visitOutcome: visitation.visitOutcome,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    try {
      const url = editingVisitation
        ? `${API_BASE}/api/admin/portal/visitations/${editingVisitation.id}`
        : `${API_BASE}/api/admin/portal/visitations`;
      const method = editingVisitation ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId: form.residentId,
          visitAt: new Date(form.visitAt).toISOString(),
          socialWorker: form.socialWorker,
          visitType: form.visitType,
          locationVisited: form.locationVisited,
          familyMembersPresent: form.familyMembersPresent || null,
          purpose: form.purpose,
          observations: form.observations,
          familyCooperation: form.familyCooperation,
          safetyConcernsNoted: form.safetyConcernsNoted,
          followUpNeeded: form.followUpNeeded,
          followUpNotes: form.followUpNotes || null,
          visitOutcome: form.visitOutcome,
        })
      });

      if (response.ok) {
        toast.success(editingVisitation ? "Visitation updated" : "Visitation recorded");
        setDrawerOpen(false);
        setEditingVisitation(null);
        await load();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.error || "Failed to save visitation");
      }
    } catch (error) {
      toast.error("Failed to save visitation");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/visitations/${deleteTarget.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });
      if (response.ok) {
        toast.success("Visitation deleted");
        setDeleteTarget(null);
        await load();
      } else {
        toast.error("Failed to delete visitation");
      }
    } catch (error) {
      toast.error("Failed to delete visitation");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded bg-muted/30 animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-muted/20 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted/20 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="w-full sm:max-w-sm space-y-2">
            <div className="h-3 w-28 rounded bg-muted/20 animate-pulse" />
            <div className="h-10 rounded-md bg-muted/20 animate-pulse" />
          </div>
          <div className="h-5 w-48 rounded bg-muted/20 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card/60 p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded-full bg-muted/20 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted/20 animate-pulse" />
                  </div>
                  <div className="h-6 w-44 rounded bg-muted/20 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted/20 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted/20 animate-pulse" />
                  <div className="h-8 w-8 rounded-full bg-muted/20 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="rounded-lg bg-muted/20 p-4">
                    <div className="h-3 w-24 rounded bg-muted/20 animate-pulse mb-3" />
                    <div className="h-12 rounded bg-muted/20 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-6 w-24 rounded-full bg-muted/20 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Visitation Records</h1>
          <p className="font-body text-sm text-muted-foreground">Track home visits, assessments, and family engagement</p>
        </div>
        <Button onClick={openCreate} className="font-body gap-2">
          <IconPlus className="h-4 w-4" />
          New Visitation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="w-full sm:max-w-sm">
          <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Resident Filter</Label>
          <Select value={residentFilter} onValueChange={value => setResidentFilter(value)}>
            <SelectTrigger className="font-body mt-1">
              <SelectValue placeholder="All residents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All residents</SelectItem>
              {residents.map(resident => (
                <SelectItem key={resident.id} value={resident.id.toString()}>
                  {resident.codeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 text-sm text-muted-foreground">
          Showing {filteredVisitations.length} visitation{filteredVisitations.length === 1 ? '' : 's'}
        </div>
      </div>

      {filteredVisitations.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card">
          <IconCalendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground font-body">No visitation records are available for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisitations.map((visitation, index) => (
            <motion.div
              key={visitation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Card className="border-none shadow-md bg-card/60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded">Visitation</span>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">{new Date(visitation.visitAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-body text-xl text-foreground">{visitation.residentName}</h3>
                      <p className="text-sm text-muted-foreground">{visitation.visitType}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(visitation)} aria-label={`Edit visitation for ${visitation.residentName}`} title={`Edit visitation for ${visitation.residentName}`} type="button">
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(visitation)} aria-label={`Delete visitation for ${visitation.residentName}`} title={`Delete visitation for ${visitation.residentName}`} type="button">
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Observations</p>
                      <p className="text-sm">{visitation.observations}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Follow-up</p>
                      <p className="text-sm">{visitation.followUpNotes || 'None recorded'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Family Cooperation</p>
                      <p className="text-sm">{visitation.familyCooperation}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Outcome</p>
                      <p className="text-sm">{visitation.visitOutcome}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest">
                    <span className="px-2.5 py-1 rounded-full bg-muted/40">{visitation.socialWorker}</span>
                    <span className="px-2.5 py-1 rounded-full bg-muted/40">{visitation.locationVisited}</span>
                    {visitation.safetyConcernsNoted && <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Safety concern noted</span>}
                    {visitation.followUpNeeded && <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Follow-up needed</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-body text-2xl tracking-tight">
              {editingVisitation ? 'Edit Visitation' : 'New Visitation'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-8">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Resident</Label>
              <Select value={form.residentId ? form.residentId.toString() : ''} onValueChange={value => update('residentId', Number(value))}>
                <SelectTrigger className="font-body mt-1">
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map(resident => (
                    <SelectItem key={resident.id} value={resident.id.toString()}>
                      {resident.codeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Visit Date</Label>
                <Input type="date" value={form.visitAt} onChange={(e: ChangeEvent<HTMLInputElement>) => update('visitAt', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Visit Type</Label>
                <Select value={form.visitType} onValueChange={value => update('visitType', value)}>
                  <SelectTrigger className="font-body mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Social Worker</Label>
                <Input value={form.socialWorker} onChange={(e: ChangeEvent<HTMLInputElement>) => update('socialWorker', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Location Visited</Label>
                <Input value={form.locationVisited} onChange={(e: ChangeEvent<HTMLInputElement>) => update('locationVisited', e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Family Members Present</Label>
              <Input value={form.familyMembersPresent} onChange={(e: ChangeEvent<HTMLInputElement>) => update('familyMembersPresent', e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Purpose</Label>
              <Textarea value={form.purpose} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('purpose', e.target.value)} className="mt-1 min-h-[80px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Observations</Label>
              <Textarea value={form.observations} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('observations', e.target.value)} className="mt-1 min-h-[110px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Family Cooperation</Label>
              <Input value={form.familyCooperation} onChange={(e: ChangeEvent<HTMLInputElement>) => update('familyCooperation', e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Visit Outcome</Label>
              <Textarea value={form.visitOutcome} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('visitOutcome', e.target.value)} className="mt-1 min-h-[80px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Follow-up</Label>
              <Textarea value={form.followUpNotes} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('followUpNotes', e.target.value)} className="mt-1 min-h-[80px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={form.safetyConcernsNoted} onCheckedChange={(checked: boolean | 'indeterminate') => update('safetyConcernsNoted', checked === true)} />
                <span className="font-body text-sm">Safety concerns noted</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={form.followUpNeeded} onCheckedChange={(checked: boolean | 'indeterminate') => update('followUpNeeded', checked === true)} />
                <span className="font-body text-sm">Follow-up needed</span>
              </label>
            </div>

            <Button onClick={handleSubmit} className="font-body w-full mt-4 bg-primary text-primary-foreground">
              {editingVisitation ? 'Save Changes' : 'Record Visitation'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Visitation"
        description={`Are you sure you want to delete the visitation record for ${deleteTarget?.residentName} on ${deleteTarget ? new Date(deleteTarget.visitAt).toLocaleDateString() : ''}? This cannot be undone.`}
      />
    </div>
  );
}
