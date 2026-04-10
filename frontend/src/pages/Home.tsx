import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api-base';
import HeroScrollSequence from '../components/HeroScrollSequence';
import MobileHero from '../components/MobileHero';
import StorySection from '../components/StorySection';
import ImpactStatCard from '../components/ImpactStatCard';
import DonateSection from '../components/DonateSection';
import CulturalDivider from '../components/CulturalDivider';
import { motion } from 'framer-motion';

interface HomeImpactMetric {
  label: string;
  valueDisplay: string;
}

interface HomeImpactData {
  metrics: HomeImpactMetric[];
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [impactData, setImpactData] = useState<HomeImpactData | null>(null);

  useEffect(() => {
    // Switch to the mobile hero on small screens.
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    // Jump to the donate section when the page opens with #donate in the URL.
    if (window.location.hash === '#donate') {
      const el = document.getElementById('donate');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Element not rendered yet — wait a tick for the DOM to settle
        const timer = setTimeout(() => {
          document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadImpactPreview() {
      // Load a small set of public impact metrics for the home page preview.
      try {
        const response = await fetch(`${API_BASE}/api/public/impact`);
        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (isMounted) {
          setImpactData(result);
        }
      } catch {
        // Leave the preview section empty if the public impact API is unavailable.
      }
    }

    loadImpactPreview();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewMetrics = (impactData?.metrics ?? []).slice(0, 4).map((metric, index) => ({
    ...metric,
    // Keep the card animation and number formatting simple.
    numericValue: parseInt(metric.valueDisplay.replace(/[^\d]/g, ''), 10) || 0,
    prefix: metric.valueDisplay.includes('PHP') ? '₱' : '',
    suffix: metric.valueDisplay.includes('%') ? '%' : '',
    delay: index * 0.1,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      {isMobile ? <MobileHero /> : <HeroScrollSequence />}
      
      {/* Impact Stats Preview */}
      <section className="px-6 py-24 md:py-32 bg-background">
        <div className="mx-auto max-w-[1280px]">
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
            <p className="font-body text-lg text-muted-foreground leading-8">
              Live stewardship metrics from the Hopi-first model we are building together
            </p>
          </motion.div>
          <CulturalDivider variant="hopi" className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewMetrics.length > 0 ? (
              previewMetrics.map((metric) => (
                <ImpactStatCard
                  key={metric.label}
                  value={metric.numericValue}
                  label={metric.label}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  delay={metric.delay}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-full rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center"
              >
                <p className="font-body text-sm text-muted-foreground">
                  Live impact metrics will appear here once the public impact API is available.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Story */}
      <StorySection />

      {/* Donate */}
      <DonateSection />
    </div>
  );
}
