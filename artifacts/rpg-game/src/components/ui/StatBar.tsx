import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatBarProps {
  current: number;
  max: number;
  colorClass: string;
  label: string;
  showText?: boolean;
  className?: string;
}

export function StatBar({ current, max, colorClass, label, showText = true, className }: StatBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex justify-between text-xs mb-1 font-semibold tracking-wide">
          <span className="uppercase text-muted-foreground">{label}</span>
          <span className="text-foreground">{Math.floor(current)} / {max}</span>
        </div>
      )}
      <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-border shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("h-full rounded-full relative", colorClass)}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 right-0 h-[30%] bg-white/20" />
        </motion.div>
      </div>
    </div>
  );
}
