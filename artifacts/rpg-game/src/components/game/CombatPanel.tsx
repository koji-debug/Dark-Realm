import React from 'react';
import { useGameStore, useDerivedStats } from '@/lib/game-store';
import { StatBar } from '@/components/ui/StatBar';
import { CLASS_SKILLS } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Zap, Skull, HeartPulse, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CombatPanel() {
  const { player, combat, attack, useSkill, flee, processVictory } = useGameStore();
  const derivedStats = useDerivedStats();

  if (!player || !combat.enemy) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center panel-border rounded-xl p-8 bg-[url('/images/bg-castle.png')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/70 rounded-xl" />
        <div className="relative z-10 text-center space-y-6">
          <h2 className="text-3xl font-display text-accent text-glow">Dungeon Floor {useGameStore(s=>s.progression.floor)}</h2>
          <p className="text-muted-foreground">The shadows are quiet... for now.</p>
          <Button 
            size="lg" 
            onClick={() => useGameStore.getState().explore()}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold tracking-widest text-lg px-12 py-6 rounded-none border border-red-500/50 shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] transition-all hover:scale-105"
          >
            <Sword className="mr-2" /> EXPLORE DEEPER
          </Button>
        </div>
      </div>
    );
  }

  const { enemy, inCombat, turn } = combat;
  const skills = CLASS_SKILLS[player.heroClass];
  const isPlayerTurn = turn === 'player' && enemy.hp > 0;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Enemy Area */}
      <div className="flex-1 panel-border rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Dynamic BG based on zone could go here */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0" />
        
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={enemy.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            className="relative z-10 flex flex-col items-center w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-display text-red-500 text-glow flex items-center justify-center gap-2">
                {enemy.isBoss && <Skull className="text-accent" />}
                {enemy.name}
              </h3>
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Level {enemy.level}</span>
            </div>
            
            {/* Enemy "Sprite" Placeholder */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                filter: turn === 'enemy' ? ["brightness(1)", "brightness(2) drop-shadow(0 0 10px red)", "brightness(1)"] : "brightness(1)"
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-32 h-32 mb-8 relative"
            >
              {enemy.isBoss ? 
                <Skull className="w-full h-full text-red-600 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]" /> : 
                <img src={`${import.meta.env.BASE_URL}images/class-warrior.png`} alt="enemy" className="w-full h-full object-cover rounded-full border-4 border-red-900/50 mix-blend-luminosity opacity-50" />
              }
            </motion.div>

            <StatBar 
              current={enemy.hp} 
              max={enemy.maxHp} 
              colorClass="bg-red-600" 
              label="Enemy HP" 
              className="w-full mb-2"
            />
          </motion.div>
        </AnimatePresence>

        {enemy.hp <= 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center flex-col gap-4 backdrop-blur-sm"
          >
            <h2 className="text-4xl font-display text-accent text-glow">VICTORY</h2>
            <Button onClick={() => processVictory()} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-black">
              Collect Loot
            </Button>
          </motion.div>
        )}
      </div>

      {/* Action Bar */}
      <div className="panel-border rounded-xl p-4 shrink-0 bg-background/95">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            disabled={!isPlayerTurn} 
            onClick={() => attack()}
            className="h-16 flex flex-col items-center justify-center bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-500 transition-colors"
          >
            <Sword className="mb-1 h-5 w-5" />
            <span>Attack</span>
          </Button>
          
          {skills.map(skill => {
            const cd = combat.playerCooldowns[skill.id] || 0;
            const canAfford = player.mp >= skill.mpCost;
            return (
              <Button 
                key={skill.id}
                disabled={!isPlayerTurn || cd > 0 || !canAfford}
                onClick={() => useSkill(skill.id)}
                className="h-16 flex flex-col items-center justify-center bg-zinc-800 hover:bg-blue-900/40 border border-zinc-700 hover:border-blue-500 relative overflow-hidden group"
              >
                {cd > 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 font-bold text-xl">{cd}</div>}
                {skill.type === 'attack' ? <Zap className="mb-1 h-5 w-5 text-blue-400" /> : <Shield className="mb-1 h-5 w-5 text-green-400" />}
                <span className="text-xs font-semibold truncate w-full px-1">{skill.name}</span>
                <span className="text-[10px] text-blue-300 absolute bottom-1 right-1">{skill.mpCost} MP</span>
              </Button>
            );
          })}
          
          <Button 
            disabled={!isPlayerTurn} 
            onClick={() => flee()}
            variant="ghost"
            className="h-16 flex flex-col items-center justify-center border border-zinc-700 hover:bg-zinc-800"
          >
            <Footprints className="mb-1 h-5 w-5" />
            <span>Flee</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
