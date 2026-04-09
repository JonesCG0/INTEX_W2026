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
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
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

      {/* Footer */}
      <footer className="border-t border-border bg-background px-6 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-display text-2xl text-primary mb-3">Project Haven</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
                A youth-first safehouse network rooted in cultural identity, trauma-informed care, and transparent stewardship.
              </p>
            </motion.div>

            {/* Contact Us */}
            <motion.div
              id="contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Contact Us</p>
              {/* ↓ Replace with your real contact details */}
              <ul className="space-y-3 font-body text-sm text-muted-foreground">
                <li>
                  <a href="mailto:info@jonescg0.net" className="hover:text-primary transition-colors">
                    info@jonescg0.net
                  </a>
                </li>
                <li>
                  <a href="tel:+18005550100" className="hover:text-primary transition-colors">
                    1-800-555-0100
                  </a>
                </li>
                <li className="leading-relaxed">
                  Arizona Hopi Safehouse Network<br />
                  United States
                </li>
              </ul>
            </motion.div>

            {/* Follow Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Follow Us</p>
              {/* ↓ Replace these hrefs with your real social media URLs */}
              <ul className="space-y-3 font-body text-sm">
                <li>
                  <a
                    href="https://www.linkedin.com/in/carson-jones-262903280/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Project Haven on Facebook"
                  >
                    <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/ashlynn-burgess/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Project Haven on Instagram"
                  >
                    <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/tanneratkinson/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Project Haven on X (Twitter)"
                  >
                    <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-muted-foreground">
              © {new Date().getFullYear()} Project Haven. All rights reserved.
            </p>
            <a href="/privacy" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
