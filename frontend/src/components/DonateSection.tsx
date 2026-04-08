import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { IconHeart } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import CulturalDivider from './CulturalDivider';

export default function DonateSection() {
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
          {[25, 50, 100, 250].map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="lg"
              className="font-body text-lg border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              ${amount}
            </Button>
          ))}
        </div>
        <Button asChild size="lg" className="mt-6 font-body bg-secondary hover:bg-secondary/90 gap-2 text-lg px-8">
          <Link to="/signup">
            <IconHeart className="h-5 w-5" />
            Donate Now
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
