import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface ImpactStatCardProps {
  value: number;
  label: string;
  detail?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  decimals?: number;
}

export default function ImpactStatCard({
  value,
  label,
  detail,
  prefix = "",
  suffix = "",
  delay = 0,
  decimals = 0,
}: ImpactStatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setCount(value);
      return;
    }
    const duration = 1500;
    const steps = 40;
    const stepValue = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, reduceMotion, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0.2 : 0.6, delay }}
      className="relative bg-card border border-border rounded-xl p-8 text-center group hover:shadow-lg transition-shadow"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-accent rounded-b-full" />
      <p className="font-display text-4xl md:text-5xl text-primary mb-2">
        {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </p>
      <p className="font-body text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {detail ? (
        <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed">{detail}</p>
      ) : null}
    </motion.div>
  );
}