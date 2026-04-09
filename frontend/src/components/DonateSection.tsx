import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconHeart } from '@tabler/icons-react';

import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import CulturalDivider from './CulturalDivider';
import DonateDialog from './DonateDialog';

const quickAmounts = [25, 50, 100, 250];

export default function DonateSection() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('100');

  const isDonor = user?.role === 'Donor';

  const DonateButton = (
    <Button
      size="lg"
      className="mt-6 font-body bg-secondary hover:bg-secondary/90 gap-2 text-lg px-8"
      onClick={() => setOpen(true)}
    >
      <IconHeart className="h-5 w-5" aria-hidden="true" />
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
          <>
            {DonateButton}
            <DonateDialog open={open} onOpenChange={setOpen} defaultAmount={amount} />
          </>
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
