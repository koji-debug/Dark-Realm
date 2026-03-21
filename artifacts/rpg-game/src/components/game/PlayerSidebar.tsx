import React from 'react';
import { useGameStore, useDerivedStats } from '@/lib/game-store';
import { StatBar } from '@/components/ui/StatBar';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Sword, Coins, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlayerSidebar() {
  const { player, allocateStat } = useGameStore();
  const derived = useDerivedStats();

  if (!player || !derived) return null;

  const portraitMap = {
    'Warrior': 'class-warrior.png',
    'Mage': 'class-mage.png',
    'Rogue': 'class-rogue.png',
    'Ranger': 'class-ranger.png',
  };

  return (
    <div className="w-80 shrink-0 h-full flex flex-col gap-4 overflow-y-auto scrollbar-hidden">
      
      {/* Identity Card */}
      <div className="panel-border rounded-xl p-4 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-4 border-border overflow-hidden mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <img src={`${import.meta.env.BASE_URL}images/${portraitMap[player.heroClass]}`} alt={player.heroClass} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-display text-glow text-center">{player.name}</h2>
        <div className="text-sm text-accent tracking-widest uppercase mb-4">{player.heroClass}</div>
        
        <div className="w-full space-y-3">
          <StatBar current={player.hp} max={derived.maxHp} colorClass="bg-health" label="HP" />
          <StatBar current={player.mp} max={derived.maxMp} colorClass="bg-mana" label="MP" />
          <div className="pt-2">
            <StatBar current={player.xp} max={player.xpNeeded} colorClass="bg-xp" label={`Level ${player.level} XP`} />
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <div className="panel-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-sm text-muted-foreground uppercase">Attributes</h3>
          {player.statPoints > 0 && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full animate-pulse border border-accent/50">
              {player.statPoints} Pts
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {(['str', 'dex', 'int', 'vit'] as const).map(stat => (
            <div key={stat} className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
              <span className="uppercase font-semibold text-zinc-400 w-12">{stat}</span>
              <span className="text-lg font-mono">{player.baseStats[stat]}</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn("h-6 w-6 rounded-full hover:bg-accent/20 hover:text-accent", player.statPoints === 0 && "opacity-0")}
                disabled={player.statPoints === 0}
                onClick={() => allocateStat(stat)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Derived Stats */}
      <div className="panel-border rounded-xl p-4 grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center p-3 bg-zinc-900/50 border border-zinc-800 rounded">
          <Sword className="text-red-400 mb-1" />
          <span className="text-xs text-muted-foreground">Attack</span>
          <span className="font-mono text-lg">{derived.atk}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-zinc-900/50 border border-zinc-800 rounded">
          <Shield className="text-blue-400 mb-1" />
          <span className="text-xs text-muted-foreground">Defense</span>
          <span className="font-mono text-lg">{derived.def}</span>
        </div>
      </div>

      {/* Wealth & Meta */}
      <div className="panel-border rounded-xl p-4 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-zinc-950">
        <div className="flex items-center gap-2 text-accent">
          <Coins className="h-5 w-5" />
          <span className="font-mono text-lg font-bold">{player.gold}</span>
        </div>
        {player.prestige > 0 && (
          <div className="flex items-center gap-1 text-purple-400">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">P{player.prestige}</span>
          </div>
        )}
      </div>

    </div>
  );
}
