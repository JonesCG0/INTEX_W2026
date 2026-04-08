import { useState, useEffect } from 'react';
import PublicNav from '../components/PublicNav';
import HeroScrollSequence from '../components/HeroScrollSequence';
import MobileHero from '../components/MobileHero';
import StorySection from '../components/StorySection';
import ImpactStatCard from '../components/ImpactStatCard';
import DonateSection from '../components/DonateSection';
import PublicFooter from '../components/PublicFooter';
import CulturalDivider from '../components/CulturalDivider';
import { motion } from 'framer-motion';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      
      {/* Hero */}
      {isMobile ? <MobileHero /> : <HeroScrollSequence />}
      
      {/* Impact Stats Preview */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Our Impact by the Numbers
            </h2>
            <p className="font-body text-lg text-muted-foreground">
              Together, we're building something that lasts
            </p>
          </motion.div>
          <CulturalDivider variant="hopi" className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ImpactStatCard value={247} label="Youth Served" delay={0} />
            <ImpactStatCard value={4} label="Active Safehouses" delay={0.1} />
            <ImpactStatCard value={89} label="Reintegrations" suffix="%" delay={0.2} />
            <ImpactStatCard value={1200000} label="Funds Raised" prefix="$" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Story */}
      <StorySection />

      {/* Donate */}
      <DonateSection />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}