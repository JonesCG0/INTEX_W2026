import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '@/lib/api-base';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPlus, IconSearch, IconPencil, IconTrash, IconCashBanknote } from '@tabler/icons-react';
import { toast } from "react-hot-toast";
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { motion } from 'framer-motion';

const types = ["Individual", "Foundation", "Corporate", "Government", "Tribal Organization"];
const statuses = ["Active", "Inactive", "Prospect", "Lapsed"];
const channels = ["Website", "Event", "Referral", "Social Media", "Direct Mail", "Grant Portal"];
const contributionTypes = ["Monetary", "In-Kind", "Grant", "Time"];
const programAreas = ["General Support", "Safehouse Ops", "Education Funds", "Health & Medical", "Emergency Response"];

interface Donor {
  id: number;
  displayName: string;
  linkedEmail: string | null;
  donorType: string;
  status: string;
  totalGivenPhp: number;
  lastDonationAt: string | null;
  preferredChannel: string;
  stewardshipLead: string;
}

interface Contribution {
  id: number;
  donorId: number;
  donorName: string;
  contributionType: string;
  amountPhp: number | null;
  estimatedValuePhp: number | null;
  programArea: string;
  description: string;
  contributionAt: string;
}

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [donorDrawerOpen, setDonorDrawerOpen] = useState(false);
  const [contributionDrawerOpen, setContributionDrawerOpen] = useState(false);
  const [deleteTargetDonor, setDeleteTargetDonor] = useState<Donor | null>(null);
  const [deleteTargetContribution, setDeleteTargetContribution] = useState<Contribution | null>(null);

  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);

  const [donorForm, setDonorForm] = useState({
    displayName: '',
    linkedEmail: '',
    donorType: 'Individual',
    status: 'Active',
    preferredChannel: 'Website',
    stewardshipLead: '',
  });

  const [contributionForm, setContributionForm] = useState({
    donorId: 0,
    contributionType: 'Monetary',
    amountPhp: '',
    estimatedValuePhp: '',
    programArea: 'General Support',
    description: '',
    contributionAt: new Date().toISOString().split('T')[0],
  });

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/portal`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
        setContributions(data.contributions || []);
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
    d.stewardshipLead?.toLowerCase().includes(search.toLowerCase()) ||
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
      donorType: 'Individual',
      status: 'Active',
      preferredChannel: 'Website',
      stewardshipLead: '',
    });
    setDonorDrawerOpen(true);
  }

  function openEditDonor(donor: Donor) {
    setEditingDonor(donor);
    setDonorForm({
      displayName: donor.displayName,
      linkedEmail: donor.linkedEmail || '',
      donorType: donor.donorType,
      status: donor.status,
      preferredChannel: donor.preferredChannel,
      stewardshipLead: donor.stewardshipLead,
    });
    setDonorDrawerOpen(true);
  }

  function openCreateContribution(donorId?: number) {
    setEditingContribution(null);
    setContributionForm({
      donorId: donorId || donors[0]?.id || 0,
      contributionType: 'Monetary',
      amountPhp: '',
      estimatedValuePhp: '',
      programArea: 'General Support',
      description: '',
      contributionAt: new Date().toISOString().split('T')[0],
    });
    setContributionDrawerOpen(true);
  }

  function openEditContribution(contribution: Contribution) {
    setEditingContribution(contribution);
    setContributionForm({
      donorId: contribution.donorId,
      contributionType: contribution.contributionType,
      amountPhp: contribution.amountPhp?.toString() || '',
      estimatedValuePhp: contribution.estimatedValuePhp?.toString() || '',
      programArea: contribution.programArea,
      description: contribution.description,
      contributionAt: new Date(contribution.contributionAt).toISOString().split('T')[0],
    });
    setContributionDrawerOpen(true);
  }

  async function saveDonor() {
    try {
      const response = await fetch(
        editingDonor ? `${API_BASE}/api/admin/portal/donors/${editingDonor.id}` : `${API_BASE}/api/admin/portal/donors`,
        {
          method: editingDonor ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            DisplayName: donorForm.displayName,
            LinkedEmail: donorForm.linkedEmail || null,
            DonorType: donorForm.donorType,
            Status: donorForm.status,
            PreferredChannel: donorForm.preferredChannel,
            StewardshipLead: donorForm.stewardshipLead,
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
      const response = await fetch(`${API_BASE}/api/admin/portal/donors/${deleteTargetDonor.id}`, {
        method: 'DELETE',
        credentials: 'include',
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
        DonorId: contributionForm.donorId,
        ContributionType: contributionForm.contributionType,
        AmountPhp: contributionForm.contributionType === 'Monetary' ? monetaryAmount : null,
        EstimatedValuePhp: contributionForm.contributionType === 'Monetary' ? null : estimatedValue,
        ProgramArea: contributionForm.programArea,
        Description: contributionForm.description,
        ContributionAt: new Date(contributionForm.contributionAt).toISOString(),
      };

      const response = await fetch(
        editingContribution ? `${API_BASE}/api/admin/portal/contributions/${editingContribution.id}` : `${API_BASE}/api/admin/portal/donors/${contributionForm.donorId}/contributions`,
        {
          method: editingContribution ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
      const response = await fetch(`${API_BASE}/api/admin/portal/contributions/${deleteTargetContribution.id}`, {
        method: 'DELETE',
        credentials: 'include',
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
          <h1 className="font-display text-2xl text-foreground">Donor Stewardship</h1>
          <p className="font-body text-sm text-muted-foreground">Create, update, and remove donor and contribution records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateContribution} variant="outline" className="font-body gap-2">
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
          <Input placeholder="Search donors, leads, or contributions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 font-body" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground">Donors</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-body text-xs uppercase tracking-wider">Donor / Organization</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider hidden md:table-cell">Type</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider hidden lg:table-cell">Stewardship Lead</TableHead>
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
                <TableRow key={donor.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell className="font-body font-medium">
                    <div className="flex flex-col">
                      <span>{donor.displayName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                        {donor.linkedEmail || 'No linked login'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                        Last gift: {donor.lastDonationAt ? new Date(donor.lastDonationAt).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden md:table-cell">{donor.donorType}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${donor.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {donor.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden lg:table-cell">{donor.stewardshipLead}</TableCell>
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground">Contributions</h2>
        </div>
        <Table>
          <TableHeader>
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
                <TableRow key={contribution.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-body font-medium">{contribution.donorName}</TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">{contribution.contributionType}</TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">{contribution.programArea}</TableCell>
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
      </motion.div>

      <Sheet open={donorDrawerOpen} onOpenChange={setDonorDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl tracking-tight">{editingDonor ? 'Edit Donor Profile' : 'Create Donor Profile'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
              <Input value={donorForm.displayName} onChange={e => setDonorForm(prev => ({ ...prev, displayName: e.target.value }))} className="font-body mt-1" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Linked Email</Label>
              <Input value={donorForm.linkedEmail} onChange={e => setDonorForm(prev => ({ ...prev, linkedEmail: e.target.value }))} className="font-body mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Donor Type</Label>
                <Select value={donorForm.donorType} onValueChange={v => setDonorForm(prev => ({ ...prev, donorType: v }))}>
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
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Preferred Channel</Label>
              <Select value={donorForm.preferredChannel} onValueChange={v => setDonorForm(prev => ({ ...prev, preferredChannel: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Stewardship Lead</Label>
              <Input value={donorForm.stewardshipLead} onChange={e => setDonorForm(prev => ({ ...prev, stewardshipLead: e.target.value }))} className="font-body mt-1" />
            </div>
            <Button onClick={saveDonor} className="font-body w-full mt-4">{editingDonor ? 'Save Donor' : 'Create Donor'}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={contributionDrawerOpen} onOpenChange={setContributionDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl tracking-tight">{editingContribution ? 'Edit Contribution' : 'Record Contribution'}</SheetTitle>
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
                <Select value={contributionForm.contributionType} onValueChange={v => setContributionForm(prev => ({ ...prev, contributionType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{contributionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input type="date" value={contributionForm.contributionAt} onChange={e => setContributionForm(prev => ({ ...prev, contributionAt: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {contributionForm.contributionType === 'Monetary' ? (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Amount (PHP)</Label>
                <Input type="number" value={contributionForm.amountPhp} onChange={e => setContributionForm(prev => ({ ...prev, amountPhp: e.target.value }))} className="mt-1" />
              </div>
            ) : (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Estimated Value (PHP)</Label>
                <Input type="number" value={contributionForm.estimatedValuePhp} onChange={e => setContributionForm(prev => ({ ...prev, estimatedValuePhp: e.target.value }))} className="mt-1" />
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
              <Input value={contributionForm.description} onChange={e => setContributionForm(prev => ({ ...prev, description: e.target.value }))} className="mt-1" placeholder="e.g. Annual gala donation" />
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
