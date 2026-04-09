import { useState, useEffect, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconPlus, IconSearch, IconPencil, IconTrash, IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { toast } from "sonner";
import ResidentDrawer from '../../components/ResidentDrawer';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { AdminPortalOverview, ResidentRecord, SafehouseComparisonRecord } from '@/types/admin';

const riskColors = {
  Low: 'bg-emerald-200 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
  Medium: 'bg-amber-200 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100',
  High: 'bg-orange-200 text-orange-950 dark:bg-orange-900/40 dark:text-orange-100',
  Critical: 'bg-red-200 text-red-950 dark:bg-red-900/40 dark:text-red-100',
};

const statusColors = {
  Active: 'bg-blue-200 text-blue-950 dark:bg-blue-900/40 dark:text-blue-100',
  Closed: 'bg-slate-200 text-slate-950 dark:bg-slate-900/40 dark:text-slate-100',
  Transferred: 'bg-amber-200 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100',
  Review: 'bg-violet-200 text-violet-950 dark:bg-violet-900/40 dark:text-violet-100',
  Stabilizing: 'bg-emerald-200 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
};

export default function Residents() {
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [safehouses, setSafehouses] = useState<SafehouseComparisonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editResident, setEditResident] = useState<ResidentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResidentRecord | null>(null);

  async function loadResidents() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal`);
      if (response.ok) {
        const data: AdminPortalOverview = await response.json();
        setResidents(data.residents || []);
        setSafehouses(data.reports.safehouseComparison || []);
      }
    } catch (error) {
      console.error("Load residents error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadResidents(); }, []);

  const filtered = residents.filter(r =>
    r.codeName?.toLowerCase().includes(search.toLowerCase()) ||
    r.caseControlNo?.toLowerCase().includes(search.toLowerCase()) ||
    r.safehouse?.toLowerCase().includes(search.toLowerCase()) ||
    r.caseCategory?.toLowerCase().includes(search.toLowerCase()) ||
    r.assignedStaff?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/residents/${deleteTarget.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });
      if (response.ok) {
        toast.success("Resident record removed");
        loadResidents();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleEdit(resident: ResidentRecord) {
    setEditResident(resident);
    setDrawerOpen(true);
  }

  function handleAdd() {
    setEditResident(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setDrawerOpen(false);
    setEditResident(null);
    await loadResidents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Resident Care Management</h1>
          <p className="font-body text-sm text-muted-foreground">Privacy-first tracking of safehouse residents (IS414 Compliant)</p>
        </div>
        <Button onClick={handleAdd} className="font-body gap-2">
          <IconPlus className="h-4 w-4" />
          Enroll Resident
        </Button>
      </div>

      <div className="relative max-w-sm">
        <label htmlFor="resident-search" className="sr-only">Search residents</label>
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="resident-search"
          placeholder="Search code, case control, safehouse..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-9 font-body"
          aria-label="Search residents"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="bg-muted/30">
              <TableHead className="font-body text-xs uppercase tracking-wider">Resident Identity</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider hidden md:table-cell">Safehouse</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider hidden sm:table-cell">Risk Level</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider hidden lg:table-cell">Progress / Conference</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted/30 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-body">
                  No resident records found matches.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(r => (
                <TableRow key={r.id} className="group transition-colors odd:bg-card even:bg-muted/10 hover:bg-primary/5">
                  <TableCell className="font-body font-medium">
                    <Link to={`/admin/residents/${r.id}/recordings`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {r.codeName?.slice(0, 2).toUpperCase() || ''}
                      </div>
                      <div className="flex flex-col">
                        <span>{r.codeName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                          {r.caseControlNo || 'No case control'} • {r.caseCategory}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden md:table-cell">{r.safehouse}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusColors[r.caseStatus as keyof typeof statusColors] || ''}`}>
                      {r.caseStatus}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${riskColors[r.riskLevel as keyof typeof riskColors] || ''}`}>
                      {r.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: `${r.progressPercent}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {r.progressPercent}% completion
                      {r.nextConferenceAt ? ` • conference ${new Date(r.nextConferenceAt).toLocaleDateString()}` : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(r)} aria-label={`Edit resident ${r.codeName}`} title={`Edit resident ${r.codeName}`}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(r)} aria-label={`Delete resident ${r.codeName}`} title={`Delete resident ${r.codeName}`}>
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/admin/residents/${r.id}/recordings`} aria-label={`Open recordings for ${r.codeName}`} title={`Open recordings for ${r.codeName}`}>
                          <IconArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Visitations">
                        <Link to={`/admin/residents/${r.id}/visitations`} aria-label={`Open visitations for ${r.codeName}`} title={`Open visitations for ${r.codeName}`}>
                          <IconCalendar className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </motion.div>

      <ResidentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        resident={editResident}
        safehouses={safehouses}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Archive Resident Record"
        description={`Are you sure you want to permanently remove all operational data for ${deleteTarget?.codeName}? This action is compliant with IS414 Purge standards but cannot be undone.`}
      />
    </div>
  );
}
