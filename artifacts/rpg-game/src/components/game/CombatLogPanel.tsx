import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const LOG_COLORS: Record<string, string> = {
  'damage':       'text-red-400 font-semibold',
  'crit':         'text-yellow-300 font-bold',
  'heal':         'text-green-400 font-semibold',
  'system':       'text-zinc-400 italic',
  'loot':         'text-orange-400 font-bold',
  'enemy-damage': 'text-red-500 font-bold',
  'boss':         'text-purple-400 font-bold italic',
};

export function CombatLogPanel() {
  const logs = useGameStore(s => s.combat.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="panel-border rounded-xl p-4 h-full flex flex-col bg-background/90">
      <h3 className="font-display text-sm text-muted-foreground uppercase mb-3 flex items-center gap-2 border-b border-border pb-2">
        <ScrollText className="h-4 w-4"/> Combat Log
      </h3>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hidden flex flex-col-reverse gap-1"
      >
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn("text-sm py-1 border-b border-zinc-800/30", LOG_COLORS[log.type], i === 0 && "text-base")}
            >
              {log.message}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="text-zinc-600 italic text-center py-8">
            The realm is quiet...
          </div>
        )}
      </div>
    </div>
  );
}
