import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IconHeart } from '@tabler/icons-react';

import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
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
} from "@/components/ui/dialog";

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: string;
}

export default function DonateDialog({ open, onOpenChange, defaultAmount = '100' }: DonateDialogProps) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(defaultAmount);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
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
      onOpenChange(false);
      setNotes('');
      navigate('/donor');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to record donation.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              placeholder="Optional note for stewardship"
              className="mt-1 font-body"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">
            Cancel
          </Button>
          <Button onClick={handleDonate} disabled={isSubmitting} className="font-body bg-secondary hover:bg-secondary/90 gap-2">
            <IconHeart className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Recording...' : 'Donate Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
