import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconArrowLeft, IconPlus, IconCalendar, IconUser, IconHeartRateMonitor } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';

const sessionTypes = ["Intake", "Individual Counseling", "Group Session", "Family Meeting", "Crisis Intervention", "Discharge Planning"];
const emotionalStates = ["Calm", "Anxious", "Distressed", "Hopeful", "Withdrawn", "Agitated"];

interface Recording {
  id: number;
  recordedAt: string;
  recordedBy: string;
  sessionType: string;
  emotionalState: string;
  summary: string;
  interventions: string;
  followUp: string;
}

interface Resident {
  id: number;
  codeName: string;
  safehouse: string;
}

export default function Recordings() {
  const { id: residentId } = useParams();
  
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [form, setForm] = useState({
    recordedAt: new Date().toISOString().split('T')[0], 
    sessionType: 'Individual Counseling', 
    emotionalState: 'Calm',
    summary: '', 
    interventions: '', 
    followUp: '',
  });

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/portal/residents/${residentId}/recordings`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
        // We'll mock the resident header for now or fetch admin portal and find them
        const portalResp = await fetch(`${API_BASE}/api/admin/portal`, { credentials: 'include' });
        if (portalResp.ok) {
          const portalData = await portalResp.json();
          const r = portalData.residents?.find((res: any) => res.id?.toString() === residentId);
          setResident(r || null);
        }
      }
    } catch (error) {
      console.error("Load recordings error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [residentId]);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    try {
      const payload = {
        ...form,
        RecordedAt: new Date(form.recordedAt).toISOString()
      };
      const response = await fetch(`${API_BASE}/api/admin/portal/residents/${residentId}/recordings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RecordedAt: payload.RecordedAt,
          SessionType: form.sessionType,
          EmotionalState: form.emotionalState,
          Summary: form.summary,
          Interventions: form.interventions,
          FollowUp: form.followUp
        })
      });

      if (response.ok) {
        toast.success("Case session recorded");
        setDrawerOpen(false);
        setForm({ 
          recordedAt: new Date().toISOString().split('T')[0], 
          sessionType: 'Individual Counseling', 
          emotionalState: 'Calm', 
          summary: '', 
          interventions: '', 
          followUp: '' 
        });
        load();
      }
    } catch (error) {
      toast.error("Failed to save recording");
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
            Safehouse: <span className="font-semibold text-foreground">{resident?.safehouse}</span>
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="font-body gap-2 ml-auto shadow-sm">
          <IconPlus className="h-4 w-4" />
          Document Session
        </Button>
      </div>

      {/* Timeline Section */}
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
                      {new Date(rec.recordedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className="h-1 w-1 rounded-full bg-primary/30" />
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <IconUser className="h-3.5 w-3.5" />
                      {rec.recordedBy}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-primary text-primary-foreground">{rec.sessionType}</span>
                    {rec.emotionalState && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-accent/20 text-accent-foreground">{rec.emotionalState}</span>
                    )}
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Recording Sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl tracking-tight">Clinical Process Recording</SheetTitle>
          </SheetHeader>
            <div className="space-y-6 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Session Date</Label>
                <Input type="date" value={form.recordedAt} onChange={e => update('recordedAt', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Session Modality</Label>
                <Select value={form.sessionType} onValueChange={v => update('sessionType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{sessionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
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

            <div className="space-y-4">
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Clinical Narrative / Summary</Label>
                <Textarea 
                  value={form.summary} 
                  onChange={e => update('summary', e.target.value)} 
                  className="font-body mt-1 min-h-[120px]" 
                  placeholder="Detailed neutral narrative of the interaction..."
                />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Therapeutic Interventions</Label>
                <Textarea 
                  value={form.interventions} 
                  onChange={e => update('interventions', e.target.value)} 
                  className="font-body mt-1 min-h-[80px]" 
                  placeholder="Techniques used (e.g. CBT, active listening, de-escalation)..."
                />
              </div>
              <div>
                <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Follow-up / Action Items</Label>
                <Textarea 
                  value={form.followUp} 
                  onChange={e => update('followUp', e.target.value)} 
                  className="font-body mt-1 min-h-[80px]" 
                  placeholder="Plan for the next interaction or internal referral..."
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSubmit} className="w-full h-12 font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                Commit to Permanent Clinical Record
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 italic uppercase tracking-wider">
                This entry will be cryptographically linked to your staff identity.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}