import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { IconHeart } from '@tabler/icons-react';

import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CulturalDivider from './CulturalDivider';

const quickAmounts = [25, 50, 100, 250];

export default function DonateSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('100');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDonor = user?.role === 'Donor';

  const handleDonate = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a donation amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/DonorPortal/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPhp: parsedAmount,
          programArea: 'General Support',
          notes,
          contributionAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Unable to record donation.');
      }

      toast.success('Your donation was recorded.');
      setOpen(false);
      setNotes('');
      navigate('/donor');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to record donation.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const DonateButton = (
    <Button
      size="lg"
      className="mt-6 font-body bg-secondary hover:bg-secondary/90 gap-2 text-lg px-8"
      onClick={() => setOpen(true)}
    >
      <IconHeart className="h-5 w-5" />
      Donate Now
    </Button>
  );

  return (
    <section id="donate" className="py-24 md:py-32 px-6 bg-primary/5">
      <CulturalDivider variant="wave" className="mb-16 max-w-4xl mx-auto" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
          Partner With Us
        </h2>
        <p className="font-body text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Your support helps us keep our safehouses open, our programs running,
          and our youth connected to culture and community. Every contribution matters.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="lg"
              className="font-body text-lg border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => {
                setAmount(String(quickAmount));
                if (isDonor) {
                  setOpen(true);
                }
              }}
            >
              ${quickAmount}
            </Button>
          ))}
        </div>

        {isDonor ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{DonateButton}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Record a Donation</DialogTitle>
                <DialogDescription className="font-body">
                  Your donation will be added to your donor profile and reflected in the donor, admin, and public impact dashboards.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="donationAmount" className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Donation Amount (PHP)
                  </Label>
                  <Input
                    id="donationAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setAmount(event.target.value)}
                    className="mt-1 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="donationNotes" className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Notes
                  </Label>
                  <Input
                    id="donationNotes"
                    value={notes}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setNotes(event.target.value)}
                    placeholder="Optional note for stewardship"
                    className="mt-1 font-body"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="font-body">
                  Cancel
                </Button>
                <Button onClick={handleDonate} disabled={isSubmitting} className="font-body bg-secondary hover:bg-secondary/90">
                  {isSubmitting ? 'Recording...' : 'Donate Now'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button asChild size="lg" className="mt-6 font-body bg-secondary hover:bg-secondary/90 gap-2 text-lg px-8">
            <Link to="/signup">
              <IconHeart className="h-5 w-5" />
              Donate Now
            </Link>
          </Button>
        )}
      </motion.div>
    </section>
  );
}
