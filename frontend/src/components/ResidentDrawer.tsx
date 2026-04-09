import { useState, useEffect, type ChangeEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import type { ResidentRecord, SafehouseComparisonRecord } from '@/types/admin';

const categories = ["Abandoned", "Foundling", "Surrendered", "Neglected", "Trafficking recovery", "Physical abuse", "Family reunification", "Medical recovery"];
const riskLevels = ["Low", "Medium", "High", "Critical"];
const statuses = ["Active", "Closed", "Transferred", "Review", "Stabilizing"];
const reintegrationTypes = ["Family Reunification", "Foster Care", "Adoption (Domestic)", "Adoption (Inter-Country)", "Independent Living", "None"];
const reintegrationStatuses = ["Not Started", "In Progress", "Completed", "On Hold"];
const birthStatuses = ["Marital", "Non-Marital"];

const residentFlagFields = [
  ["subCatOrphaned", "Orphaned"],
  ["subCatTrafficked", "Trafficked"],
  ["subCatChildLabor", "Child labor"],
  ["subCatPhysicalAbuse", "Physical abuse"],
  ["subCatSexualAbuse", "Sexual abuse"],
  ["subCatOsaec", "OSAEC / CSAEM"],
  ["subCatCicl", "CICL"],
  ["subCatAtRisk", "Child at risk"],
  ["subCatStreetChild", "Street child"],
  ["subCatChildWithHiv", "Child with HIV"],
  ["isPwd", "PWD"],
  ["hasSpecialNeeds", "Special needs"],
  ["familyIs4Ps", "Family is 4Ps"],
  ["familySoloParent", "Solo parent family"],
  ["familyIndigenous", "Indigenous family"],
  ["familyParentPwd", "Parent is PWD"],
  ["familyInformalSettler", "Informal settler"],
] as const;

type ResidentFlagKey = (typeof residentFlagFields)[number][0];

interface ResidentFormState {
  caseControlNo: string;
  codeName: string;
  safehouseId: string;
  caseStatus: string;
  sex: string;
  dateOfBirth: string;
  birthStatus: string;
  placeOfBirth: string;
  religion: string;
  caseCategory: string;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  isPwd: boolean;
  pwdType: string;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis: string;
  familyIs4Ps: boolean;
  familySoloParent: boolean;
  familyIndigenous: boolean;
  familyParentPwd: boolean;
  familyInformalSettler: boolean;
  dateOfAdmission: string;
  ageUponAdmission: string;
  presentAge: string;
  lengthOfStay: string;
  referralSource: string;
  referringAgencyPerson: string;
  dateColbRegistered: string;
  dateColbObtained: string;
  assignedStaff: string;
  initialCaseAssessment: string;
  dateCaseStudyPrepared: string;
  reintegrationType: string;
  reintegrationStatus: string;
  initialRiskLevel: string;
  riskLevel: string;
  dateEnrolled: string;
  dateClosed: string;
  notesRestricted: string;
}

interface ResidentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: ResidentRecord | null;
  safehouses: SafehouseComparisonRecord[];
  onSave: () => void;
}

const createEmptyForm = (safehouseId: string): ResidentFormState => ({
  caseControlNo: '',
  codeName: '',
  safehouseId,
  caseStatus: 'Active',
  sex: 'F',
  dateOfBirth: '',
  birthStatus: '',
  placeOfBirth: '',
  religion: '',
  caseCategory: categories[0],
  subCatOrphaned: false,
  subCatTrafficked: false,
  subCatChildLabor: false,
  subCatPhysicalAbuse: false,
  subCatSexualAbuse: false,
  subCatOsaec: false,
  subCatCicl: false,
  subCatAtRisk: false,
  subCatStreetChild: false,
  subCatChildWithHiv: false,
  isPwd: false,
  pwdType: '',
  hasSpecialNeeds: false,
  specialNeedsDiagnosis: '',
  familyIs4Ps: false,
  familySoloParent: false,
  familyIndigenous: false,
  familyParentPwd: false,
  familyInformalSettler: false,
  dateOfAdmission: '',
  ageUponAdmission: '',
  presentAge: '',
  lengthOfStay: '',
  referralSource: '',
  referringAgencyPerson: '',
  dateColbRegistered: '',
  dateColbObtained: '',
  assignedStaff: '',
  initialCaseAssessment: '',
  dateCaseStudyPrepared: '',
  reintegrationType: '',
  reintegrationStatus: '',
  initialRiskLevel: 'Low',
  riskLevel: 'Low',
  dateEnrolled: '',
  dateClosed: '',
  notesRestricted: '',
});

const toDateInput = (value: string | null) => (value ? new Date(value).toISOString().split('T')[0] : '');

export default function ResidentDrawer({ open, onOpenChange, resident, safehouses, onSave }: ResidentDrawerProps) {
  const [form, setForm] = useState<ResidentFormState>(createEmptyForm(safehouses[0]?.safehouseId?.toString() ?? ''));

  useEffect(() => {
    if (resident) {
      setForm({
        caseControlNo: resident.caseControlNo || '',
        codeName: resident.codeName || '',
        safehouseId: resident.safehouseId.toString(),
        caseStatus: resident.caseStatus || 'Active',
        sex: resident.sex || 'F',
        dateOfBirth: toDateInput(resident.dateOfBirth),
        birthStatus: resident.birthStatus || '',
        placeOfBirth: resident.placeOfBirth || '',
        religion: resident.religion || '',
        caseCategory: resident.caseCategory || categories[0],
        subCatOrphaned: resident.subCatOrphaned,
        subCatTrafficked: resident.subCatTrafficked,
        subCatChildLabor: resident.subCatChildLabor,
        subCatPhysicalAbuse: resident.subCatPhysicalAbuse,
        subCatSexualAbuse: resident.subCatSexualAbuse,
        subCatOsaec: resident.subCatOsaec,
        subCatCicl: resident.subCatCicl,
        subCatAtRisk: resident.subCatAtRisk,
        subCatStreetChild: resident.subCatStreetChild,
        subCatChildWithHiv: resident.subCatChildWithHiv,
        isPwd: resident.isPwd,
        pwdType: resident.pwdType || '',
        hasSpecialNeeds: resident.hasSpecialNeeds,
        specialNeedsDiagnosis: resident.specialNeedsDiagnosis || '',
        familyIs4Ps: resident.familyIs4Ps,
        familySoloParent: resident.familySoloParent,
        familyIndigenous: resident.familyIndigenous,
        familyParentPwd: resident.familyParentPwd,
        familyInformalSettler: resident.familyInformalSettler,
        dateOfAdmission: toDateInput(resident.dateOfAdmission),
        ageUponAdmission: resident.ageUponAdmission || '',
        presentAge: resident.presentAge || '',
        lengthOfStay: resident.lengthOfStay || '',
        referralSource: resident.referralSource || '',
        referringAgencyPerson: resident.referringAgencyPerson || '',
        dateColbRegistered: toDateInput(resident.dateColbRegistered),
        dateColbObtained: toDateInput(resident.dateColbObtained),
        assignedStaff: resident.assignedStaff || '',
        initialCaseAssessment: resident.initialCaseAssessment || '',
        dateCaseStudyPrepared: toDateInput(resident.dateCaseStudyPrepared),
        reintegrationType: resident.reintegrationType || '',
        reintegrationStatus: resident.reintegrationStatus || '',
        initialRiskLevel: resident.initialRiskLevel || resident.riskLevel || 'Low',
        riskLevel: resident.riskLevel || 'Low',
        dateEnrolled: toDateInput(resident.dateEnrolled),
        dateClosed: toDateInput(resident.dateClosed),
        notesRestricted: resident.notesRestricted || '',
      });
    } else {
      setForm(createEmptyForm(safehouses[0]?.safehouseId?.toString() ?? ''));
    }
  }, [resident, open, safehouses]);

  const update = <K extends keyof ResidentFormState>(key: K, value: ResidentFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleFlag = (key: ResidentFlagKey) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleSubmit() {
    try {
      const url = resident
        ? `${API_BASE}/api/admin/portal/residents/${resident.id}`
        : `${API_BASE}/api/admin/portal/residents`;
      const method = resident ? 'PUT' : 'POST';

      const payload = {
        ...form,
        safehouseId: Number(form.safehouseId),
        dateOfBirth: form.dateOfBirth || null,
        dateOfAdmission: form.dateOfAdmission || null,
        dateColbRegistered: form.dateColbRegistered || null,
        dateColbObtained: form.dateColbObtained || null,
        dateCaseStudyPrepared: form.dateCaseStudyPrepared || null,
        dateEnrolled: form.dateEnrolled || null,
        dateClosed: form.dateClosed || null,
      };

      const response = await apiFetch(url, {
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
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-body text-xl">
            {resident ? 'Edit Resident Record' : 'Enroll New Resident'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="grid gap-2 sm:grid-cols-3">
            {['Identity & Intake', 'Case Management', 'Reintegration & Notes'].map((step, index) => (
              <div key={step} className="rounded-xl border border-border/60 bg-card px-3 py-2">
                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Step {index + 1}</p>
                <p className="mt-1 font-body text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted/20 border border-border rounded-lg">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">IS414 Privacy Notice</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use anonymized case-control numbers and internal codes only. Restricted notes remain visible only to authorized staff and should never contain legal names unless policy requires it.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="font-body text-xs uppercase tracking-widest text-muted-foreground">Identity & Intake</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="font-body text-sm">Case Control Number</Label>
                <Input value={form.caseControlNo} onChange={(e: ChangeEvent<HTMLInputElement>) => update('caseControlNo', e.target.value)} className="font-body mt-1" placeholder="e.g. C0073" />
              </div>
              <div>
                <Label className="font-body text-sm">Internal Code</Label>
                <Input value={form.codeName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('codeName', e.target.value)} className="font-body mt-1" placeholder="e.g. LS-0042" />
              </div>
              <div>
                <Label className="font-body text-sm">Assigned Safehouse</Label>
                <Select value={form.safehouseId} onValueChange={value => update('safehouseId', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select safehouse" /></SelectTrigger>
                  <SelectContent>
                    {safehouses.map((safehouse) => (
                      <SelectItem key={safehouse.safehouseId} value={safehouse.safehouseId.toString()}>
                        {safehouse.safehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Case Status</Label>
                <Select value={form.caseStatus} onValueChange={value => update('caseStatus', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Date of Birth</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e: ChangeEvent<HTMLInputElement>) => update('dateOfBirth', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Birth Status</Label>
                <Select value={form.birthStatus || undefined} onValueChange={value => update('birthStatus', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select birth status" /></SelectTrigger>
                  <SelectContent>
                    {birthStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Place of Birth</Label>
                <Input value={form.placeOfBirth} onChange={(e: ChangeEvent<HTMLInputElement>) => update('placeOfBirth', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Religion</Label>
                <Input value={form.religion} onChange={(e: ChangeEvent<HTMLInputElement>) => update('religion', e.target.value)} className="font-body mt-1" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-body text-xs uppercase tracking-widest text-muted-foreground">Case Management</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="font-body text-sm">Case Category</Label>
                <Select value={form.caseCategory} onValueChange={value => update('caseCategory', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Assigned Social Worker</Label>
                <Input value={form.assignedStaff} onChange={(e: ChangeEvent<HTMLInputElement>) => update('assignedStaff', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Initial Risk Level</Label>
                <Select value={form.initialRiskLevel} onValueChange={value => update('initialRiskLevel', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {riskLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Current Risk Level</Label>
                <Select value={form.riskLevel} onValueChange={value => update('riskLevel', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {riskLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Admission Date</Label>
                <Input type="date" value={form.dateOfAdmission} onChange={(e: ChangeEvent<HTMLInputElement>) => update('dateOfAdmission', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Case Study Prepared</Label>
                <Input type="date" value={form.dateCaseStudyPrepared} onChange={(e: ChangeEvent<HTMLInputElement>) => update('dateCaseStudyPrepared', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Referral Source</Label>
                <Input value={form.referralSource} onChange={(e: ChangeEvent<HTMLInputElement>) => update('referralSource', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Referring Agency / Person</Label>
                <Input value={form.referringAgencyPerson} onChange={(e: ChangeEvent<HTMLInputElement>) => update('referringAgencyPerson', e.target.value)} className="font-body mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label className="font-body text-sm">Initial Case Assessment</Label>
                <Textarea value={form.initialCaseAssessment} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('initialCaseAssessment', e.target.value)} className="font-body mt-1 min-h-[100px]" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-body text-xs uppercase tracking-widest text-muted-foreground">Reintegration & Restricted Notes</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="font-body text-sm">Reintegration Type</Label>
                <Select value={form.reintegrationType || undefined} onValueChange={value => update('reintegrationType', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {reintegrationTypes.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Reintegration Status</Label>
                <Select value={form.reintegrationStatus || undefined} onValueChange={value => update('reintegrationStatus', value)}>
                  <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {reintegrationStatuses.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Date Enrolled</Label>
                <Input type="date" value={form.dateEnrolled} onChange={(e: ChangeEvent<HTMLInputElement>) => update('dateEnrolled', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Date Closed</Label>
                <Input type="date" value={form.dateClosed} onChange={(e: ChangeEvent<HTMLInputElement>) => update('dateClosed', e.target.value)} className="font-body mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label className="font-body text-sm">Restricted Notes</Label>
                <Textarea value={form.notesRestricted} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('notesRestricted', e.target.value)} className="font-body mt-1 min-h-[120px]" placeholder="Restricted-access notes only." />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-body text-xs uppercase tracking-widest text-muted-foreground">Flags & Family Context</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {residentFlagFields.map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                  <Checkbox checked={form[key]} onCheckedChange={() => toggleFlag(key)} />
                  <span className="font-body text-sm">{label}</span>
                </label>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="font-body text-sm">PWD Type</Label>
                <Input value={form.pwdType} onChange={(e: ChangeEvent<HTMLInputElement>) => update('pwdType', e.target.value)} className="font-body mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Special Needs Diagnosis</Label>
                <Input value={form.specialNeedsDiagnosis} onChange={(e: ChangeEvent<HTMLInputElement>) => update('specialNeedsDiagnosis', e.target.value)} className="font-body mt-1" />
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-background/95 px-1 pt-4 backdrop-blur">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="font-body">
              {resident ? 'Save Canonical Record' : 'Create Canonical Record'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
