import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconCalendarPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import type { AdminPortalOverview, ConferenceRecord, ResidentRecord } from '@/types/admin';

const planCategories = ["Psychosocial", "Education", "Medical", "Legal", "Family Reintegration"];
const conferenceStatuses = ["Planned", "In Progress", "Completed", "On Hold", "Closed"];

export default function Conferences() {
  const [conferences, setConferences] = useState<ConferenceRecord[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<ConferenceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConferenceRecord | null>(null);

  const [form, setForm] = useState({
    residentId: 0,
    planCategory: 'Psychosocial',
    status: 'Planned',
    conferenceDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    planDescription: '',
    servicesProvided: 'Case Management',
  });

  async function load() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal`);
      if (response.ok) {
        const data: AdminPortalOverview = await response.json();
        setConferences(data.reports.conferenceSchedule || []);
        setResidents(data.residents || []);
      } else {
        toast.error('Failed to load conferences');
      }
    } catch (error) {
      console.error("Load conferences error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const residentOptions = useMemo(() => residents.map((resident) => ({
    id: resident.id,
    label: `${resident.codeName} • ${resident.safehouse}`,
  })), [residents]);

  function resetForm(residentId?: number) {
    setForm({
      residentId: residentId ?? residentOptions[0]?.id ?? 0,
      planCategory: 'Psychosocial',
      status: 'Planned',
      conferenceDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      planDescription: '',
      servicesProvided: 'Case Management',
    });
  }

  function openCreate() {
    setEditingConference(null);
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(conference: ConferenceRecord) {
    setEditingConference(conference);
    setForm({
      residentId: conference.residentId,
      planCategory: conference.planCategory,
      status: conference.status,
      conferenceDate: new Date(conference.conferenceDate).toISOString().split('T')[0],
      targetDate: conference.targetDate ? new Date(conference.targetDate).toISOString().split('T')[0] : '',
      planDescription: conference.planDescription,
      servicesProvided: conference.servicesProvided || 'Case Management',
    });
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    try {
      const response = await apiFetch(
        editingConference ? `${API_BASE}/api/admin/portal/conferences/${editingConference.planId}` : `${API_BASE}/api/admin/portal/conferences`,
        {
          method: editingConference ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentId: form.residentId,
            planCategory: form.planCategory,
            status: form.status,
            conferenceDate: new Date(form.conferenceDate).toISOString(),
            targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
            planDescription: form.planDescription,
            servicesProvided: form.servicesProvided || null,
          }),
        }
      );

      if (response.ok) {
        toast.success(editingConference ? 'Conference updated' : 'Conference scheduled');
        setDrawerOpen(false);
        setEditingConference(null);
        await load();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.error || 'Failed to save conference');
      }
    } catch (error) {
      toast.error('Failed to save conference');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/conferences/${deleteTarget.planId}`, {
        method: 'DELETE',
        confirmDelete: true,
      });

      if (response.ok) {
        toast.success('Conference removed');
        setDeleteTarget(null);
        await load();
      } else {
        toast.error('Failed to delete conference');
      }
    } catch (error) {
      toast.error('Failed to delete conference');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-28 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Case Conferences</h1>
          <p className="font-body text-sm text-muted-foreground">Manage intervention-plan conference dates, targets, and follow-up scope.</p>
        </div>
        <Button onClick={openCreate} className="font-body gap-2">
          <IconCalendarPlus className="h-4 w-4" />
          Schedule Conference
        </Button>
      </div>

      <div className="space-y-4">
        {conferences.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card">
            <p className="text-muted-foreground font-body">No case conferences are scheduled yet.</p>
          </div>
        ) : (
          conferences.map((conference, index) => (
            <motion.div
              key={conference.planId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Card className="border-none shadow-md bg-card/60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded">{conference.planCategory}</span>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">{new Date(conference.conferenceDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-body text-xl text-foreground">{conference.residentCode}</h3>
                      <p className="text-sm text-muted-foreground">{conference.safehouse} • {conference.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(conference)} aria-label={`Edit conference for ${conference.residentCode}`} title={`Edit conference for ${conference.residentCode}`} type="button">
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(conference)} aria-label={`Delete conference for ${conference.residentCode}`} title={`Delete conference for ${conference.residentCode}`} type="button">
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Plan Description</p>
                      <p className="text-sm">{conference.planDescription}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Services Provided</p>
                      <p className="text-sm">{conference.servicesProvided || 'Case Management'}</p>
                    </div>
                  </div>

                  {conference.targetDate && (
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Target date: {new Date(conference.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-body text-2xl tracking-tight">
              {editingConference ? 'Edit Conference Plan' : 'Schedule Conference'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-8">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Resident</Label>
              <Select value={form.residentId ? form.residentId.toString() : ''} onValueChange={(value) => setForm((prev) => ({ ...prev, residentId: Number(value) }))}>
                <SelectTrigger className="font-body mt-1">
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
                <SelectContent>
                  {residentOptions.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id.toString()}>
                      {resident.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Plan Category</Label>
                <Select value={form.planCategory} onValueChange={(value) => setForm((prev) => ({ ...prev, planCategory: value }))}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{planCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{conferenceStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Conference Date</Label>
                <Input type="date" value={form.conferenceDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, conferenceDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Target Date</Label>
                <Input type="date" value={form.targetDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, targetDate: e.target.value }))} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Plan Description</Label>
              <Textarea value={form.planDescription} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, planDescription: e.target.value }))} className="mt-1 min-h-[100px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Services Provided</Label>
              <Input value={form.servicesProvided} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, servicesProvided: e.target.value }))} className="mt-1" />
            </div>

            <Button onClick={handleSubmit} className="font-body w-full mt-4 bg-primary text-primary-foreground">
              {editingConference ? 'Save Conference Plan' : 'Create Conference Plan'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Conference Plan"
        description={`Are you sure you want to delete the conference plan for ${deleteTarget?.residentCode}? This cannot be undone.`}
      />
    </div>
  );
}
