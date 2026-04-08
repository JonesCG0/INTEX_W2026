import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '@/lib/api-base';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconPlus, IconCalendar, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

interface Resident {
  id: number;
  codeName: string;
  safehouse: string;
}

interface Visitation {
  id: number;
  residentId: number;
  residentName: string;
  visitAt: string;
  visitType: string;
  observations: string;
  familyCooperation: string;
  safetyConcerns: string;
  followUp: string;
}

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

  const [visitations, setVisitations] = useState<Visitation[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVisitation, setEditingVisitation] = useState<Visitation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Visitation | null>(null);
  const [residentFilter, setResidentFilter] = useState(residentIdParam || 'all');

  const [form, setForm] = useState({
    residentId: residentIdParam ? Number(residentIdParam) : 0,
    visitAt: new Date().toISOString().split('T')[0],
    visitType: 'Routine follow-up',
    observations: '',
    familyCooperation: 'Moderate',
    safetyConcerns: '',
    followUp: '',
  });

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/portal`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
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
      observations: '',
      familyCooperation: 'Moderate',
      safetyConcerns: '',
      followUp: '',
    });
    setDrawerOpen(true);
  }

  function openEdit(visitation: Visitation) {
    setEditingVisitation(visitation);
    setForm({
      residentId: visitation.residentId,
      visitAt: new Date(visitation.visitAt).toISOString().split('T')[0],
      visitType: visitation.visitType,
      observations: visitation.observations,
      familyCooperation: visitation.familyCooperation,
      safetyConcerns: visitation.safetyConcerns,
      followUp: visitation.followUp,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    try {
      const url = editingVisitation
        ? `${API_BASE}/api/admin/portal/visitations/${editingVisitation.id}`
        : `${API_BASE}/api/admin/portal/visitations`;
      const method = editingVisitation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ResidentId: form.residentId,
          VisitAt: new Date(form.visitAt).toISOString(),
          VisitType: form.visitType,
          Observations: form.observations,
          FamilyCooperation: form.familyCooperation,
          SafetyConcerns: form.safetyConcerns,
          FollowUp: form.followUp,
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
      const response = await fetch(`${API_BASE}/api/admin/portal/visitations/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include'
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
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted/20 rounded-lg animate-pulse" />)}
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
                      <h3 className="font-display text-xl text-foreground">{visitation.residentName}</h3>
                      <p className="text-sm text-muted-foreground">{visitation.visitType}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(visitation)}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(visitation)}>
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
                      <p className="text-sm">{visitation.followUp}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Family Cooperation</p>
                      <p className="text-sm">{visitation.familyCooperation}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Safety Concerns</p>
                      <p className="text-sm">{visitation.safetyConcerns}</p>
                    </div>
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
            <SheetTitle className="font-display text-2xl tracking-tight">
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
                <Input type="date" value={form.visitAt} onChange={e => update('visitAt', e.target.value)} className="mt-1" />
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

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Observations</Label>
              <Textarea value={form.observations} onChange={e => update('observations', e.target.value)} className="mt-1 min-h-[110px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Family Cooperation</Label>
              <Input value={form.familyCooperation} onChange={e => update('familyCooperation', e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Safety Concerns</Label>
              <Textarea value={form.safetyConcerns} onChange={e => update('safetyConcerns', e.target.value)} className="mt-1 min-h-[80px]" />
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Follow-up</Label>
              <Textarea value={form.followUp} onChange={e => update('followUp', e.target.value)} className="mt-1 min-h-[80px]" />
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
