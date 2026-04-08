import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

const steps = ["Core Info", "Case Assessment", "Assignment"];

const safehouses = ["Hopi Haven", "Desert Bloom", "Eagle Ridge", "Sunrise Center"];
const categories = ["Substance Abuse", "Family Crisis", "Homelessness", "Mental Health", "Trafficking", "General Support"];
const riskLevels = ["Low", "Medium", "High", "Critical"];
const statuses = ["Active", "Discharged", "Transitioning", "Waitlisted"];

interface ResidentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: any;
  onSave: () => void;
}

export default function ResidentDrawer({ open, onOpenChange, resident, onSave }: ResidentDrawerProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    CodeName: '', 
    Safehouse: '', 
    CaseCategory: '',
    RiskLevel: 'Low', 
    Status: 'Active', 
    AssignedStaff: '', 
    ProgressPercent: 0,
    NextReviewAt: ''
  });

  useEffect(() => {
    if (resident) {
      setForm({
        CodeName: resident.CodeName || '',
        Safehouse: resident.Safehouse || '',
        CaseCategory: resident.CaseCategory || '',
        RiskLevel: resident.RiskLevel || 'Low',
        Status: resident.Status || 'Active',
        AssignedStaff: resident.AssignedStaff || '',
        ProgressPercent: resident.ProgressPercent || 0,
        NextReviewAt: resident.NextReviewAt ? new Date(resident.NextReviewAt).toISOString().split('T')[0] : '',
      });
    } else {
      setForm({
        CodeName: '', 
        Safehouse: safehouses[0], 
        CaseCategory: categories[0],
        RiskLevel: 'Low', 
        Status: 'Active', 
        AssignedStaff: '', 
        ProgressPercent: 0,
        NextReviewAt: ''
      });
    }
    setStep(0);
  }, [resident, open]);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    try {
      const url = resident ? `/api/admin/portal/residents/${resident.Id}` : '/api/admin/portal/residents';
      const method = resident ? 'PUT' : 'POST';
      
      const payload = {
        ...form,
        NextReviewAt: form.NextReviewAt ? new Date(form.NextReviewAt).toISOString() : null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(resident ? "Resident record updated" : "New resident added");
        onSave();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to save record");
      }
    } catch (error) {
      console.error("Save resident error:", error);
      toast.error("An error occurred while saving.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            {resident ? 'Edit Resident Record' : 'Enroll New Resident'}
          </SheetTitle>
        </SheetHeader>

        {/* Progress */}
        <div className="flex gap-2 my-6">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-body font-bold rounded transition-colors ${i === step ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="p-4 bg-muted/20 border border-border rounded-lg mb-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">IS414 Privacy Notice</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only use Code Names or anonymized identifiers. Never enter legal names or identifiers that could compromise resident safety on this platform.
                </p>
              </div>
              <div>
                <Label className="font-body text-sm">Resident Code Name</Label>
                <Input value={form.CodeName} onChange={e => update('CodeName', e.target.value)} className="font-body mt-1" placeholder="e.g., Eagle-01" />
              </div>
              <div>
                <Label className="font-body text-sm">Assigned Safehouse</Label>
                <Select value={form.Safehouse} onValueChange={v => update('Safehouse', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select safehouse" /></SelectTrigger>
                  <SelectContent>
                    {safehouses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label className="font-body text-sm">Case Category</Label>
                <Select value={form.CaseCategory} onValueChange={v => update('CaseCategory', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Initial Risk Level</Label>
                <Select value={form.RiskLevel} onValueChange={v => update('RiskLevel', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select risk level" /></SelectTrigger>
                  <SelectContent>
                    {riskLevels.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Care Progress ({form.ProgressPercent}%)</Label>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={form.ProgressPercent} 
                  onChange={e => update('ProgressPercent', parseInt(e.target.value))} 
                  className="mt-1" 
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label className="font-body text-sm">Enrollment Status</Label>
                <Select value={form.Status} onValueChange={v => update('Status', v)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Assigned Case Manager</Label>
                <Input value={form.AssignedStaff} onChange={e => update('AssignedStaff', e.target.value)} className="font-body mt-1" placeholder="Staff Name" />
              </div>
              <div>
                <Label className="font-body text-sm">Next Case Review Date</Label>
                <Input type="date" value={form.NextReviewAt} onChange={e => update('NextReviewAt', e.target.value)} className="font-body mt-1" />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="font-body">
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} className="font-body ml-auto">
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="font-body ml-auto">
              {resident ? 'Commit Updates' : 'Confirm Enrollment'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}