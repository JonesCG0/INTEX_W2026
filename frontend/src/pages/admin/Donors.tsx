import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPlus, IconSearch, IconPencil, IconTrash, IconCashBanknote } from '@tabler/icons-react';
import { toast } from "sonner";
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { motion } from 'framer-motion';
import type { AdminPortalOverview, ContributionRecord, DonorRecord, SafehouseComparisonRecord } from '@/types/admin';

const types = ["Individual", "Foundation", "Corporate", "Government", "Tribal Organization"];
const statuses = ["Active", "Inactive", "Prospect", "Lapsed"];
const channels = ["Website", "Event", "Referral", "Social Media", "Direct Mail", "Grant Portal"];
const contributionTypes = ["Monetary", "In-Kind", "Grant", "Time"];
const programAreas = ["General Support", "Safehouse Ops", "Education Funds", "Health & Medical", "Emergency Response"];

interface AllocationDraft {
  safehouseId: string;
  programArea: string;
  amountAllocated: string;
  allocationDate: string;
  allocationNotes: string;
}

export default function Donors() {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [safehouses, setSafehouses] = useState<SafehouseComparisonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [donorDrawerOpen, setDonorDrawerOpen] = useState(false);
  const [contributionDrawerOpen, setContributionDrawerOpen] = useState(false);
  const [deleteTargetDonor, setDeleteTargetDonor] = useState<DonorRecord | null>(null);
  const [deleteTargetContribution, setDeleteTargetContribution] = useState<ContributionRecord | null>(null);

  const [editingDonor, setEditingDonor] = useState<DonorRecord | null>(null);
  const [editingContribution, setEditingContribution] = useState<ContributionRecord | null>(null);

  const [donorForm, setDonorForm] = useState({
    displayName: '',
    linkedEmail: '',
    supporterType: 'Individual',
    organizationName: '',
    firstName: '',
    lastName: '',
    relationshipType: '',
    region: '',
    country: '',
    phone: '',
    status: 'Active',
    acquisitionChannel: 'Website',
  });

  const [contributionForm, setContributionForm] = useState({
    donorId: 0,
    donationType: 'Monetary',
    amountPhp: '',
    estimatedValuePhp: '',
    programArea: 'General Support',
    description: '',
    channelSource: '',
    campaignName: '',
    contributionAt: new Date().toISOString().split('T')[0],
  });
  const [allocationRows, setAllocationRows] = useState<AllocationDraft[]>([]);

  const createAllocationRow = (overrides?: Partial<AllocationDraft>): AllocationDraft => ({
    safehouseId: '',
    programArea: 'General Support',
    amountAllocated: '',
    allocationDate: new Date().toISOString().split('T')[0],
    allocationNotes: '',
    ...overrides,
  });

  async function load() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal`);
      if (response.ok) {
        const data: AdminPortalOverview = await response.json();
        setDonors(data.donors || []);
        setContributions(data.contributions || []);
        setSafehouses(data.reports.safehouseComparison || []);
      }
    } catch (error) {
      console.error("Load donors error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredDonors = donors.filter(d =>
    d.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    d.acquisitionChannel?.toLowerCase().includes(search.toLowerCase()) ||
    d.linkedEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredContributions = useMemo(() => {
    if (!search) return contributions;
    return contributions.filter(contribution =>
      contribution.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      contribution.programArea?.toLowerCase().includes(search.toLowerCase()) ||
      contribution.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [contributions, search]);

  function openCreateDonor() {
    setEditingDonor(null);
    setDonorForm({
      displayName: '',
      linkedEmail: '',
      supporterType: 'Individual',
      organizationName: '',
      firstName: '',
      lastName: '',
      relationshipType: '',
      region: '',
      country: '',
      phone: '',
      status: 'Active',
      acquisitionChannel: 'Website',
    });
    setDonorDrawerOpen(true);
  }

  function openEditDonor(donor: DonorRecord) {
    setEditingDonor(donor);
    setDonorForm({
      displayName: donor.displayName,
      linkedEmail: donor.linkedEmail || '',
      supporterType: donor.supporterType,
      organizationName: donor.organizationName || '',
      firstName: donor.firstName || '',
      lastName: donor.lastName || '',
      relationshipType: donor.relationshipType || '',
      region: donor.region || '',
      country: donor.country || '',
      phone: donor.phone || '',
      status: donor.status,
      acquisitionChannel: donor.acquisitionChannel || 'Website',
    });
    setDonorDrawerOpen(true);
  }

  function openCreateContribution(donorId?: number) {
    setEditingContribution(null);
    setContributionForm({
      donorId: donorId || donors[0]?.id || 0,
      donationType: 'Monetary',
      amountPhp: '',
      estimatedValuePhp: '',
      programArea: 'General Support',
      description: '',
      channelSource: '',
      campaignName: '',
      contributionAt: new Date().toISOString().split('T')[0],
    });
    setAllocationRows([createAllocationRow({ programArea: 'General Support' })]);
    setContributionDrawerOpen(true);
  }

  function openEditContribution(contribution: ContributionRecord) {
    setEditingContribution(contribution);
    setContributionForm({
      donorId: contribution.donorId,
      donationType: contribution.donationType,
      amountPhp: contribution.amountPhp?.toString() || '',
      estimatedValuePhp: contribution.estimatedValuePhp?.toString() || '',
      programArea: contribution.programArea,
      description: contribution.description,
      channelSource: contribution.channelSource || '',
      campaignName: contribution.campaignName || '',
      contributionAt: new Date(contribution.contributionAt).toISOString().split('T')[0],
    });
    setAllocationRows(
      contribution.allocations.length > 0
        ? contribution.allocations.map((allocation) => createAllocationRow({
            safehouseId: allocation.safehouseId?.toString() || '',
            programArea: allocation.programArea,
            amountAllocated: allocation.amountAllocated.toString(),
            allocationDate: new Date(allocation.allocationDate).toISOString().split('T')[0],
            allocationNotes: allocation.allocationNotes || '',
          }))
        : [createAllocationRow({ programArea: contribution.programArea })]
    );
    setContributionDrawerOpen(true);
  }

  async function saveDonor() {
    try {
      const response = await apiFetch(
        editingDonor ? `${API_BASE}/api/admin/portal/donors/${editingDonor.id}` : `${API_BASE}/api/admin/portal/donors`,
        {
          method: editingDonor ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: donorForm.displayName,
            linkedEmail: donorForm.linkedEmail || null,
            supporterType: donorForm.supporterType,
            organizationName: donorForm.organizationName || null,
            firstName: donorForm.firstName || null,
            lastName: donorForm.lastName || null,
            relationshipType: donorForm.relationshipType || null,
            region: donorForm.region || null,
            country: donorForm.country || null,
            phone: donorForm.phone || null,
            status: donorForm.status,
            acquisitionChannel: donorForm.acquisitionChannel || null,
          }),
        }
      );

      if (response.ok) {
        toast.success(editingDonor ? "Donor profile updated" : "Donor created");
        setDonorDrawerOpen(false);
        setEditingDonor(null);
        await load();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.error || "Failed to save donor");
      }
    } catch (error) {
      toast.error("Failed to save donor");
    }
  }

  async function deleteDonor() {
    if (!deleteTargetDonor) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/donors/${deleteTargetDonor.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });
      if (response.ok) {
        toast.success("Donor deleted");
        setDeleteTargetDonor(null);
        await load();
      } else {
        toast.error("Failed to delete donor");
      }
    } catch (error) {
      toast.error("Failed to delete donor");
    }
  }

  async function saveContribution() {
    try {
      const monetaryAmount = contributionForm.amountPhp ? Number(contributionForm.amountPhp) : null;
      const estimatedValue = contributionForm.estimatedValuePhp ? Number(contributionForm.estimatedValuePhp) : null;
      const payload = {
        donorId: contributionForm.donorId,
        donationType: contributionForm.donationType,
        amountPhp: contributionForm.donationType === 'Monetary' ? monetaryAmount : null,
        estimatedValuePhp: contributionForm.donationType === 'Monetary' ? null : estimatedValue,
        programArea: contributionForm.programArea,
        description: contributionForm.description,
        channelSource: contributionForm.channelSource || null,
        campaignName: contributionForm.campaignName || null,
        contributionAt: new Date(contributionForm.contributionAt).toISOString(),
        allocations: allocationRows
          .filter((allocation) => Number(allocation.amountAllocated) > 0)
          .map((allocation) => ({
            safehouseId: allocation.safehouseId ? Number(allocation.safehouseId) : null,
            programArea: allocation.programArea,
            amountAllocated: Number(allocation.amountAllocated),
            allocationDate: allocation.allocationDate ? new Date(allocation.allocationDate).toISOString() : null,
            allocationNotes: allocation.allocationNotes || null,
          })),
      };

      const response = await apiFetch(
        editingContribution ? `${API_BASE}/api/admin/portal/contributions/${editingContribution.id}` : `${API_BASE}/api/admin/portal/donors/${contributionForm.donorId}/contributions`,
        {
          method: editingContribution ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success(editingContribution ? "Contribution updated" : "Contribution recorded");
        setContributionDrawerOpen(false);
        setEditingContribution(null);
        await load();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.error || "Failed to save contribution");
      }
    } catch (error) {
      toast.error("Failed to save contribution");
    }
  }

  async function deleteContribution() {
    if (!deleteTargetContribution) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/portal/contributions/${deleteTargetContribution.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });
      if (response.ok) {
        toast.success("Contribution deleted");
        setDeleteTargetContribution(null);
        await load();
      } else {
        toast.error("Failed to delete contribution");
      }
    } catch (error) {
      toast.error("Failed to delete contribution");
    }
  }

  function updateAllocationRow(index: number, key: keyof AllocationDraft, value: string) {
    setAllocationRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  function addAllocationRow() {
    setAllocationRows((prev) => [...prev, createAllocationRow({ programArea: contributionForm.programArea })]);
  }

  function removeAllocationRow(index: number) {
    setAllocationRows((prev) => prev.length === 1 ? [createAllocationRow({ programArea: contributionForm.programArea })] : prev.filter((_, rowIndex) => rowIndex !== index));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-2xl text-foreground">Donor Stewardship</h1>
          <p className="font-body text-sm text-muted-foreground">Create, update, and remove donor and contribution records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreateContribution()} variant="outline" className="font-body gap-2">
            <IconCashBanknote className="h-4 w-4" />
            New Contribution
          </Button>
          <Button onClick={openCreateDonor} className="font-body gap-2">
            <IconPlus className="h-4 w-4" />
            New Donor
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search donors, leads, or contributions..." value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9 font-body" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-body text-lg text-foreground">Donors</h2>
        </div>
        <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="bg-muted/30">
              <TableHead className="font-body text-xs uppercase tracking-wider">Donor / Organization</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider hidden md:table-cell">Type</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider hidden lg:table-cell">Channel / Region</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Lifetime Giving</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-body">No donors found</TableCell>
              </TableRow>
            ) : (
              filteredDonors.map(donor => (
                <TableRow key={donor.id} className="group transition-colors odd:bg-card even:bg-muted/10 hover:bg-primary/5">
                  <TableCell className="font-body font-medium">
                    <div className="flex flex-col">
                      <span>{donor.displayName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                        {donor.linkedEmail || 'No linked login'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                        First gift: {donor.firstDonationAt ? new Date(donor.firstDonationAt).toLocaleDateString() : 'None'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                        Last gift: {donor.lastDonationAt ? new Date(donor.lastDonationAt).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden md:table-cell">{donor.supporterType}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${donor.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {donor.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden lg:table-cell">{donor.acquisitionChannel || donor.region || 'Unspecified'}</TableCell>
                  <TableCell className="text-right font-body font-bold text-primary">₱{donor.totalGivenPhp?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-8 px-2 font-body gap-1" onClick={() => openCreateContribution(donor.id)}>
                        <IconCashBanknote className="h-3.5 w-3.5" />
                        Record
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDonor(donor)}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTargetDonor(donor)}>
                        <IconTrash className="h-3.5 w-3.5" />
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-body text-lg text-foreground">Contributions</h2>
        </div>
        <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="bg-muted/30">
              <TableHead className="font-body text-xs uppercase tracking-wider">Donor</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Program</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Value</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContributions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-body">No contributions found</TableCell>
              </TableRow>
            ) : (
              filteredContributions.map(contribution => (
                <TableRow key={contribution.id} className="transition-colors odd:bg-card even:bg-muted/10 hover:bg-primary/5">
                  <TableCell className="font-body font-medium">{contribution.donorName}</TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">{contribution.donationType}</TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{contribution.programArea}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {contribution.allocations.length} allocation{contribution.allocations.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">{new Date(contribution.contributionAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-body font-bold text-primary">
                    ₱{(contribution.amountPhp ?? contribution.estimatedValuePhp ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditContribution(contribution)}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTargetContribution(contribution)}>
                        <IconTrash className="h-3.5 w-3.5" />
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

      <Sheet open={donorDrawerOpen} onOpenChange={setDonorDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-body text-xl tracking-tight">{editingDonor ? 'Edit Donor Profile' : 'Create Donor Profile'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
              <Input value={donorForm.displayName} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, displayName: e.target.value }))} className="font-body mt-1" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Linked Email</Label>
              <Input value={donorForm.linkedEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, linkedEmail: e.target.value }))} className="font-body mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Supporter Type</Label>
                <Select value={donorForm.supporterType} onValueChange={v => setDonorForm(prev => ({ ...prev, supporterType: v }))}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={donorForm.status} onValueChange={v => setDonorForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Acquisition Channel</Label>
              <Select value={donorForm.acquisitionChannel} onValueChange={v => setDonorForm(prev => ({ ...prev, acquisitionChannel: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Organization</Label>
                <Input value={donorForm.organizationName} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, organizationName: e.target.value }))} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Relationship Type</Label>
                <Input value={donorForm.relationshipType} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, relationshipType: e.target.value }))} className="font-body mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input value={donorForm.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, firstName: e.target.value }))} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input value={donorForm.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, lastName: e.target.value }))} className="font-body mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Region</Label>
                <Input value={donorForm.region} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, region: e.target.value }))} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Country</Label>
                <Input value={donorForm.country} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, country: e.target.value }))} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Phone</Label>
                <Input value={donorForm.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setDonorForm(prev => ({ ...prev, phone: e.target.value }))} className="font-body mt-1" />
              </div>
            </div>
            <Button onClick={saveDonor} className="font-body w-full mt-4">{editingDonor ? 'Save Donor' : 'Create Donor'}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={contributionDrawerOpen} onOpenChange={setContributionDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-body text-xl tracking-tight">{editingContribution ? 'Edit Contribution' : 'Record Contribution'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[10px] uppercase font-bold text-primary mb-1">Target Account</p>
              <Select value={contributionForm.donorId ? contributionForm.donorId.toString() : ''} onValueChange={v => setContributionForm(prev => ({ ...prev, donorId: Number(v) }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map(donor => <SelectItem key={donor.id} value={donor.id.toString()}>{donor.displayName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
                <Select value={contributionForm.donationType} onValueChange={v => setContributionForm(prev => ({ ...prev, donationType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{contributionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input type="date" value={contributionForm.contributionAt} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, contributionAt: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {contributionForm.donationType === 'Monetary' ? (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Amount (PHP)</Label>
                <Input type="number" value={contributionForm.amountPhp} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, amountPhp: e.target.value }))} className="mt-1" />
              </div>
            ) : (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Estimated Value (PHP)</Label>
                <Input type="number" value={contributionForm.estimatedValuePhp} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, estimatedValuePhp: e.target.value }))} className="mt-1" />
              </div>
            )}

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Program Area</Label>
              <Select value={contributionForm.programArea} onValueChange={v => setContributionForm(prev => ({ ...prev, programArea: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {programAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Memo / Description</Label>
              <Input value={contributionForm.description} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, description: e.target.value }))} className="mt-1" placeholder="e.g. Annual gala donation" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Channel Source</Label>
                <Input value={contributionForm.channelSource} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, channelSource: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Campaign</Label>
                <Input value={contributionForm.campaignName} onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionForm(prev => ({ ...prev, campaignName: e.target.value }))} className="mt-1" />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Allocation Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">Split this contribution across canonical safehouse allocations.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="font-body" onClick={addAllocationRow}>
                  Add Allocation
                </Button>
              </div>

              {allocationRows.map((allocation, index) => (
                <div key={`${index}-${allocation.safehouseId}-${allocation.programArea}`} className="space-y-3 rounded-lg bg-muted/20 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Safehouse</Label>
                      <Select value={allocation.safehouseId || "none"} onValueChange={(value) => updateAllocationRow(index, 'safehouseId', value === 'none' ? '' : value)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned / general</SelectItem>
                          {safehouses.map((safehouse) => (
                            <SelectItem key={safehouse.safehouseId} value={safehouse.safehouseId.toString()}>
                              {safehouse.safehouse}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Program Area</Label>
                      <Select value={allocation.programArea} onValueChange={(value) => updateAllocationRow(index, 'programArea', value)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {programAreas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Amount Allocated</Label>
                      <Input type="number" value={allocation.amountAllocated} onChange={(e: ChangeEvent<HTMLInputElement>) => updateAllocationRow(index, 'amountAllocated', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Allocation Date</Label>
                      <Input type="date" value={allocation.allocationDate} onChange={(e: ChangeEvent<HTMLInputElement>) => updateAllocationRow(index, 'allocationDate', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Allocation Notes</Label>
                    <Input value={allocation.allocationNotes} onChange={(e: ChangeEvent<HTMLInputElement>) => updateAllocationRow(index, 'allocationNotes', e.target.value)} className="mt-1" />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" className="text-destructive font-body" onClick={() => removeAllocationRow(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={saveContribution} className="font-body w-full mt-4 bg-primary text-primary-foreground">
              {editingContribution ? 'Save Contribution' : 'Confirm & Record Contribution'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteTargetDonor}
        onOpenChange={(open) => !open && setDeleteTargetDonor(null)}
        onConfirm={deleteDonor}
        title="Delete Donor"
        description={`Are you sure you want to delete ${deleteTargetDonor?.displayName}? This will also remove their linked contributions and cannot be undone.`}
      />

      <DeleteConfirmDialog
        open={!!deleteTargetContribution}
        onOpenChange={(open) => !open && setDeleteTargetContribution(null)}
        onConfirm={deleteContribution}
        title="Delete Contribution"
        description={`Are you sure you want to delete the contribution for ${deleteTargetContribution?.donorName}? This cannot be undone.`}
      />
    </div>
  );
}
