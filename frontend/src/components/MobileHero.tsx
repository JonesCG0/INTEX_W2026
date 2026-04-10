import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconHeartHandshake } from '@tabler/icons-react';
import HeroSignatureAccent from './HeroSignatureAccent';

const HERO_IMAGE = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80";

export default function MobileHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="Arizona desert landscape" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.8 }}
        className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-end px-6 pb-16 pt-24"
      >
        <span className="mb-4 font-body text-xs uppercase tracking-[0.32em] text-primary-foreground/80">
          Hopi-first expansion
        </span>
        <h1 className="mb-4 font-display text-4xl leading-tight text-white">
          A safe place to heal, belong, and begin again.
        </h1>
        <p className="mb-6 max-w-sm font-body text-base leading-7 text-white/80">
          Project Haven starts with Hopi-serving safehouse care in Arizona and grows outward with culturally grounded healing, community trust, and transparent stewardship.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/impact">
            <Button size="lg" className="w-full font-body gap-2 bg-primary hover:bg-primary/90 sm:w-auto">
              See Our Impact
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="outline" className="w-full font-body gap-2 border-white/30 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
              Join the Circle
              <IconHeartHandshake className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <HeroSignatureAccent className="mt-10 w-full opacity-90" />
      </motion.div>
    </section>
  );
}