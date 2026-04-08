import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { IconArrowRight } from '@tabler/icons-react';

const HERO_IMAGE = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80";

export default function HeroScrollSequence() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Phase 1: Image expands, text fades
  const imageWidth = useTransform(scrollYProgress, [0, 0.3], ["60%", "100%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const textX = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0.2, 0.55]);

  // Phase 2-3: Centered headline fades in
  const centerTextOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.7, 0.85], [0, 1, 1, 0]);
  const centerTextY = useTransform(scrollYProgress, [0.25, 0.4, 0.7, 0.85], [30, 0, 0, -30]);

  // Phase 3: SVG divider
  const svgOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);
  const svgDash = useTransform(scrollYProgress, [0.45, 0.65], [1, 0]);

  // Phase 4: Fade out
  const sectionOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);
  const exitScale = useTransform(scrollYProgress, [0.7, 1], [1, 1.03]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <motion.div
        style={{ opacity: sectionOpacity }}
        className="sticky top-0 h-screen overflow-hidden"
      >
        {/* Image layer */}
        <motion.div
          style={{ width: imageWidth, scale: exitScale }}
          className="absolute top-0 left-0 h-full"
        >
          <motion.img
            src={HERO_IMAGE}
            alt="Arizona desert landscape with mesas and golden light"
            style={{ scale: imageScale }}
            className="w-full h-full object-cover"
          />
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-foreground"
          />
        </motion.div>

        {/* Phase 0: Split text */}
        <motion.div
          style={{ opacity: textOpacity, x: textX }}
          className="absolute top-0 right-0 w-[40%] h-full flex flex-col justify-center px-8 md:px-12 lg:px-16"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
            A Safe Place<br />to Heal
          </h1>
          <p className="font-body text-lg text-muted-foreground mb-8 max-w-md">
            Empowering Native American youth through culturally grounded safehouse programs, 
            one community at a time.
          </p>
          <div className="flex gap-3">
            <Link to="/impact">
              <Button size="lg" className="font-body bg-primary hover:bg-primary/90 gap-2">
                See Our Impact
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Phase 2-3: Centered cinematic text */}
        <motion.div
          style={{ opacity: centerTextOpacity, y: centerTextY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white text-center px-8 drop-shadow-2xl">
            Every Child Deserves<br />a Place to Belong
          </h2>
        </motion.div>

        {/* Phase 3: SVG Divider */}
        <motion.div
          style={{ opacity: svgOpacity }}
          className="absolute bottom-0 left-0 right-0 px-12"
        >
          <svg viewBox="0 0 1200 60" className="w-full" aria-hidden="true">
            <motion.path
              d="M0 30 L40 10 L80 30 L120 10 L160 30 L200 10 L240 30 L280 10 L320 30 L360 10 L400 30 L440 10 L480 30 L520 10 L560 30 L600 10 L640 30 L680 10 L720 30 L760 10 L800 30 L840 10 L880 30 L920 10 L960 30 L1000 10 L1040 30 L1080 10 L1120 30 L1160 10 L1200 30"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              fill="none"
              strokeDasharray="1"
              style={{ pathLength: useTransform(scrollYProgress, [0.45, 0.65], [0, 1]) }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}