import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconHeartHandshake } from '@tabler/icons-react';
import HeroSignatureAccent from './HeroSignatureAccent';

const HERO_IMAGE = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80";

export default function HeroScrollSequence() {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageWidth = useTransform(scrollYProgress, [0, 0.25, 0.5], ["60%", "100%", "100%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.03]);
  const splitTextOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const splitTextX = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const warmOverlayOpacity = useTransform(scrollYProgress, [0, 0.25], [0.2, 0.35]);
  const scrimOpacity = useTransform(scrollYProgress, [0.25, 0.5, 0.85], [0, 0.6, 0.25]);
  const cinematicTextOpacity = useTransform(scrollYProgress, [0.28, 0.45, 0.7, 0.88], [0, 1, 1, 0]);
  const cinematicTextY = useTransform(scrollYProgress, [0.28, 0.45, 0.88], [24, 0, -30]);
  const accentOpacity = useTransform(scrollYProgress, [0.5, 0.62], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0.78, 1], [1, 0]);
  const nextSectionOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const nextSectionY = useTransform(scrollYProgress, [0.8, 1], [60, 0]);

  if (reduceMotion) {
    return (
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1280px] grid-cols-[1.1fr_0.9fr] items-stretch gap-8 px-6 py-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60">
            <img
              src={HERO_IMAGE}
              alt="Arizona desert landscape with mesas and golden light"
              className="h-full min-h-[34rem] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center gap-6 py-10">
            <span className="font-body text-xs uppercase tracking-[0.32em] text-primary">
              Hopi-first expansion
            </span>
            <h1 className="font-display text-5xl leading-[1.05] text-foreground">
              A safe place to heal, belong, and begin again.
            </h1>
            <p className="max-w-xl font-body text-lg leading-8 text-muted-foreground">
              Project Haven pairs culturally grounded safehouse care with transparent stewardship so supporters, staff, and community members can see how healing grows over time.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/impact">
                <Button size="lg" className="font-body gap-2">
                  See Our Impact
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="font-body gap-2">
                  Join the Circle
                  <IconHeartHandshake className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <HeroSignatureAccent className="mx-auto -mt-10 w-full max-w-[1280px] px-6" />
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-background">
      <motion.div
        style={{ opacity: heroOpacity }}
        className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden"
      >
        <motion.div
          style={{ width: imageWidth, scale: imageScale }}
          className="absolute top-0 left-0 h-full"
        >
          <motion.img
            src={HERO_IMAGE}
            alt="Arizona desert landscape with mesas and golden light"
            className="w-full h-full object-cover"
          />
          <motion.div
            style={{ opacity: warmOverlayOpacity }}
            className="absolute inset-0 bg-gradient-to-br from-background/60 via-transparent to-transparent"
          />
          <motion.div style={{ opacity: scrimOpacity }} className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/35 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: splitTextOpacity, x: splitTextX }}
          className="absolute inset-y-0 right-0 flex w-[40%] min-w-[26rem] flex-col justify-center px-8 py-10 md:px-12 lg:px-16"
        >
          <span className="mb-4 font-body text-xs uppercase tracking-[0.32em] text-primary">
            Hopi-first expansion
          </span>
          <h1 className="mb-5 font-display text-4xl leading-tight text-foreground md:text-5xl lg:text-[3.4rem]">
            A safe place to heal, belong, and begin again.
          </h1>
          <p className="mb-6 max-w-md font-body text-lg leading-8 text-muted-foreground">
            Project Haven begins with Hopi-serving safehouse care in Arizona, then scales outward with the same commitment to cultural identity, collective care, and transparent stewardship.
          </p>
          <div className="flex gap-3">
            <Link to="/impact">
              <Button size="lg" className="font-body bg-primary hover:bg-primary/90 gap-2">
                See Our Impact
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="font-body gap-2">
                Join the Circle
                <IconHeartHandshake className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: cinematicTextOpacity, y: cinematicTextY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="max-w-4xl px-8 text-center">
            <h2 className="font-display text-4xl text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
              Every child deserves a place to belong.
            </h2>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: accentOpacity }}
          className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-12"
        >
          <HeroSignatureAccent className="w-full" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: nextSectionOpacity, y: nextSectionY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[1280px] px-6 pb-16"
      >
        <div className="max-w-xl rounded-[1.5rem] border border-border/60 bg-card/90 p-6 shadow-xl backdrop-blur">
          <p className="font-body text-xs uppercase tracking-[0.32em] text-primary">Next</p>
          <h3 className="mt-3 font-display text-2xl text-foreground">Our Story</h3>
          <p className="mt-2 font-body text-sm leading-7 text-muted-foreground">
            The next section picks up with the people, values, and partnerships shaping this Hopi-first model for youth safety and long-term belonging.
          </p>
        </div>
      </motion.div>
    </section>
  );
}