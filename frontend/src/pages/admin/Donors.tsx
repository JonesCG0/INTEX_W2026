import { useState, useEffect } from 'react';
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

interface Donor {
  id: number;
  displayName: string;
  donorType: string;
  status: string;
  totalGivenPhp: number;
  lastDonationAt: string | null;
  preferredChannel: string;
  stewardshipLead: string;
}

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  const [form, setForm] = useState({
    displayName: '', donorType: 'Individual', status: 'Active',
    preferredChannel: 'Website', stewardshipLead: ''
  });

  const [contributionForm, setContributionForm] = useState({
    contributionType: 'Monetary',
    amountPhp: 0,
    estimatedValuePhp: 0,
    programArea: 'General Support',
    description: '',
    contributionAt: new Date().toISOString().split('T')[0]
  });

  async function load() {
    try {
      const response = await fetch('/api/admin/portal');
      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
      }
    } catch (error) {
      console.error("Load donors error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = donors.filter(s =>
    s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    s.stewardshipLead?.toLowerCase().includes(search.toLowerCase())
  );

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContrib = (key: string, value: any) => setContributionForm(prev => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    if (!selectedDonor) return;
    try {
      const response = await fetch(`/api/admin/portal/donors/${selectedDonor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        toast.success("Donor profile updated");
        setDrawerOpen(false);
        load();
      }
    } catch (error) {
      toast.error("Failed to update donor");
    }
  }

  async function handleAddContribution() {
    if (!selectedDonor) return;
    try {
      const payload = {
        ...contributionForm,
        ContributionAt: new Date(contributionForm.contributionAt).toISOString()
      };
      const response = await fetch(`/api/admin/portal/donors/${selectedDonor.id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ContributionType: payload.contributionType,
          AmountPhp: payload.amountPhp,
          EstimatedValuePhp: payload.estimatedValuePhp,
          ProgramArea: payload.programArea,
          Description: payload.description,
          ContributionAt: payload.ContributionAt
        })
      });

      if (response.ok) {
        toast.success("Contribution recorded");
        setContributionModalOpen(false);
        setContributionForm({
          contributionType: 'Monetary',
          amountPhp: 0,
          estimatedValuePhp: 0,
          programArea: 'General Support',
          description: '',
          contributionAt: new Date().toISOString().split('T')[0]
        });
        load();
      }
    } catch (error) {
      toast.error("Failed to record contribution");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Donor Stewardship</h1>
          <p className="font-body text-sm text-muted-foreground">Manage relationships and contribution history</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search donors or leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 font-body" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
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
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted/30 rounded animate-pulse" /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-body">No donors found matches</TableCell>
              </TableRow>
            ) : (
              filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell className="font-body font-medium">
                    <div className="flex flex-col">
                      <span>{s.displayName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Last gift: {s.lastDonationAt ? new Date(s.lastDonationAt).toLocaleDateString() : 'None'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden md:table-cell">{s.donorType}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground hidden lg:table-cell">{s.stewardshipLead}</TableCell>
                  <TableCell className="text-right font-body font-bold text-primary">₱{s.totalGivenPhp?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-8 px-2 font-body gap-1" onClick={() => { setSelectedDonor(s); setContributionModalOpen(true); }}>
                        <IconCashBanknote className="h-3.5 w-3.5" />
                        Record
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { 
                        setSelectedDonor(s); 
                        setForm({
                          displayName: s.displayName,
                          donorType: s.donorType,
                          status: s.status,
                          preferredChannel: s.preferredChannel,
                          stewardshipLead: s.stewardshipLead
                        });
                        setDrawerOpen(true); 
                      }}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Edit Donor Profile Sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl tracking-tight">Stewardship Profile</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
              <Input value={form.displayName} onChange={e => update('displayName', e.target.value)} className="font-body mt-1" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Stewardship Lead (Staff)</Label>
              <Input value={form.stewardshipLead} onChange={e => update('stewardshipLead', e.target.value)} className="font-body mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Donor Type</Label>
                <Select value={form.donorType} onValueChange={v => update('donorType', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Lifecycle Status</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Preferred Channel</Label>
              <Select value={form.preferredChannel} onValueChange={v => update('preferredChannel', v)}>
                <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select channel" /></SelectTrigger>
                <SelectContent>{channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} className="font-body w-full mt-4">Save Profile Changes</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Record Contribution Sheet */}
      <Sheet open={contributionModalOpen} onOpenChange={setContributionModalOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl tracking-tight text-primary">Record Contribution</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[10px] uppercase font-bold text-primary mb-1">Target Account</p>
              <p className="text-sm font-semibold">{selectedDonor?.displayName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
                <Select value={contributionForm.contributionType} onValueChange={v => updateContrib('contributionType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monetary">Monetary</SelectItem>
                    <SelectItem value="InKind">In-Kind</SelectItem>
                    <SelectItem value="Grant">Grant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input type="date" value={contributionForm.contributionAt} onChange={e => updateContrib('contributionAt', e.target.value)} className="mt-1" />
              </div>
            </div>

            {contributionForm.contributionType === 'Monetary' ? (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Amount (PHP)</Label>
                <Input type="number" value={contributionForm.amountPhp} onChange={e => updateContrib('amountPhp', parseFloat(e.target.value))} className="mt-1" />
              </div>
            ) : (
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Estimated Value (PHP)</Label>
                <Input type="number" value={contributionForm.estimatedValuePhp} onChange={e => updateContrib('estimatedValuePhp', parseFloat(e.target.value))} className="mt-1" />
              </div>
            )}

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Program Area</Label>
              <Select value={contributionForm.programArea} onValueChange={v => updateContrib('programArea', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Support">General Support</SelectItem>
                  <SelectItem value="Safehouse Ops">Safehouse Operations</SelectItem>
                  <SelectItem value="Education Funds">Education Funds</SelectItem>
                  <SelectItem value="Health & Medical">Health & Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Memo / Description</Label>
              <Input value={contributionForm.description} onChange={e => updateContrib('description', e.target.value)} className="mt-1" placeholder="e.g. Annual gala donation" />
            </div>

            <Button onClick={handleAddContribution} className="font-body w-full mt-4 bg-primary text-primary-foreground">Confirm & Record Contribution</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}