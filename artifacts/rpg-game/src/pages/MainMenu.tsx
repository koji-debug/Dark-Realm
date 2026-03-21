import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { HeroClass, CLASS_BASE_STATS } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useCloudLoad, useGameLeaderboard } from '@/hooks/use-api';
import { Trophy, Sword, Scroll, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLASSES: HeroClass[] = ['Warrior', 'Mage', 'Rogue', 'Ranger'];

export default function MainMenu() {
  const [, setLocation] = useLocation();
  const { createNewGame, player } = useGameStore();
  const [menuState, setMenuState] = useState<'main' | 'new' | 'load' | 'leaderboard'>('main');
  
  // New Game State
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass>('Warrior');

  // Load Game State
  const [loadId, setLoadId] = useState('');
  const loadMutation = useCloudLoad();
  
  // Leaderboard
  const { data: leaderboard, isLoading: isLoadingLb } = useGameLeaderboard();

  const handleCreate = () => {
    if (!name.trim()) return;
    createNewGame(name, selectedClass);
    setLocation('/game');
  };

  const handleContinue = () => {
    setLocation('/game');
  };

  const handleLoad = () => {
    if (!loadId) return;
    loadMutation.mutate(loadId, {
      onSuccess: () => setLocation('/game')
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/images/bg-forest.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
      
      <div className="relative z-10 w-full max-w-4xl p-6 flex flex-col items-center">
        
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-display text-accent text-glow tracking-widest drop-shadow-[0_0_30px_rgba(255,200,0,0.3)]">DARK REALM</h1>
          <p className="text-xl text-red-500 font-display mt-4 tracking-widest">Endless Descent</p>
        </motion.div>

        <AnimatePresence mode="wait">
          
          {/* MAIN MENU */}
          {menuState === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col gap-4 w-full max-w-xs"
            >
              {player && (
                <Button 
                  size="lg" 
                  onClick={handleContinue}
                  className="bg-accent text-black hover:bg-accent/90 text-lg font-bold h-14 box-glow"
                >
                  <Sword className="mr-2" /> Continue Game
                </Button>
              )}
              <Button size="lg" variant="outline" className="h-14 bg-black/50 border-red-900/50 hover:bg-red-900/20 hover:text-red-400 transition-colors" onClick={() => setMenuState('new')}>
                New Descent
              </Button>
              <Button size="lg" variant="outline" className="h-14 bg-black/50 border-zinc-800" onClick={() => setMenuState('load')}>
                <Scroll className="mr-2 h-4 w-4" /> Load Soul
              </Button>
              <Button size="lg" variant="outline" className="h-14 bg-black/50 border-zinc-800" onClick={() => setMenuState('leaderboard')}>
                <Trophy className="mr-2 h-4 w-4 text-accent" /> Hall of Heroes
              </Button>
            </motion.div>
          )}

          {/* NEW GAME */}
          {menuState === 'new' && (
            <motion.div 
              key="new"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-3xl panel-border rounded-xl p-8 bg-black/60"
            >
              <h2 className="text-2xl font-display text-center mb-8">Forge Your Soul</h2>
              
              <div className="mb-8">
                <label className="text-sm text-muted-foreground uppercase tracking-widest mb-2 block text-center">Your Name</label>
                <Input 
                  value={name} onChange={e => setName(e.target.value)} 
                  className="text-center text-xl h-14 bg-black/50 border-zinc-700 max-w-md mx-auto focus-visible:ring-red-500"
                  placeholder="Enter Name..."
                  maxLength={16}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {CLASSES.map(cls => (
                  <div 
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-3 transition-all",
                      selectedClass === cls ? "border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(255,0,0,0.3)] scale-105" : "border-zinc-800 bg-black/50 hover:border-zinc-500 hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-700">
                      <img src={`${import.meta.env.BASE_URL}images/class-${cls.toLowerCase()}.png`} alt={cls} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-display font-bold">{cls}</span>
                    <div className="text-[10px] text-zinc-500 grid grid-cols-2 gap-x-2 gap-y-1 w-full mt-2">
                      <span>STR: {CLASS_BASE_STATS[cls].str}</span>
                      <span>DEX: {CLASS_BASE_STATS[cls].dex}</span>
                      <span>INT: {CLASS_BASE_STATS[cls].int}</span>
                      <span>VIT: {CLASS_BASE_STATS[cls].vit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={() => setMenuState('main')}>Cancel</Button>
                <Button 
                  size="lg" 
                  onClick={handleCreate} 
                  disabled={!name}
                  className="bg-red-700 hover:bg-red-600 text-white px-12 box-glow"
                >
                  Enter the Realm
                </Button>
              </div>
            </motion.div>
          )}

          {/* LOAD GAME */}
          {menuState === 'load' && (
            <motion.div 
              key="load"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-md panel-border rounded-xl p-8 bg-black/60 text-center"
            >
              <h2 className="text-2xl font-display mb-2">Recover Soul</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your Player ID to restore your progress from the void.</p>
              
              <Input 
                value={loadId} onChange={e => setLoadId(e.target.value)} 
                className="text-center h-14 bg-black/50 border-zinc-700 mb-6"
                placeholder="Player ID (e.g. 7x9a2)"
              />

              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={() => setMenuState('main')}>Cancel</Button>
                <Button 
                  onClick={handleLoad} 
                  disabled={!loadId || loadMutation.isPending}
                  className="bg-accent hover:bg-accent/80 text-black px-8"
                >
                  {loadMutation.isPending ? 'Searching...' : 'Restore'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* LEADERBOARD */}
          {menuState === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-2xl panel-border rounded-xl p-8 bg-black/60"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-display flex items-center gap-2 text-accent"><Trophy/> Hall of Heroes</h2>
                <Button variant="ghost" size="sm" onClick={() => setMenuState('main')}>Back</Button>
              </div>
              
              {isLoadingLb ? (
                <div className="py-12 text-center text-zinc-500 animate-pulse">Consulting the ancient scrolls...</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-xs uppercase text-zinc-500 font-bold px-4 pb-2">
                    <span className="col-span-2">Rank</span>
                    <span className="col-span-4">Name</span>
                    <span className="col-span-2 text-center">Level</span>
                    <span className="col-span-2 text-center">Floor</span>
                    <span className="col-span-2 text-right">Kills</span>
                  </div>
                  {leaderboard?.map((entry) => (
                    <div key={entry.rank} className="grid grid-cols-12 items-center bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg text-sm">
                      <span className={cn("col-span-2 font-display text-lg", entry.rank === 1 ? 'text-accent text-glow' : 'text-zinc-400')}>#{entry.rank}</span>
                      <span className="col-span-4 font-bold">{entry.playerName}</span>
                      <span className="col-span-2 text-center text-blue-400">{entry.level}</span>
                      <span className="col-span-2 text-center text-red-400">{entry.dungeonFloor}</span>
                      <span className="col-span-2 text-right text-zinc-400">{entry.totalKills.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
