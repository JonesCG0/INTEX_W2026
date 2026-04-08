import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { IconArrowRight } from '@tabler/icons-react';

const HERO_IMAGE = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80";

export default function MobileHero() {
  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Arizona desert landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 min-h-screen flex flex-col justify-end p-6 pb-16"
      >
        <h1 className="font-display text-4xl text-white leading-tight mb-4">
          A Safe Place<br />to Heal
        </h1>
        <p className="font-body text-base text-white/80 mb-6 max-w-sm">
          Empowering Native American youth through culturally grounded safehouse programs.
        </p>
        <Link to="/impact">
          <Button size="lg" className="font-body bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
            See Our Impact
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}