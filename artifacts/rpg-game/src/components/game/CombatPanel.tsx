import React, { useEffect } from 'react';
import { useGameStore, useDerivedStats } from '@/lib/game-store';
import { StatBar } from '@/components/ui/StatBar';
import { CLASS_SKILLS, getZone, ZONE_BG, ZONE_NAMES } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Skull, Footprints, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SKILL_ICON: Record<string, React.ReactNode> = {
  slash: <Sword  className="h-5 w-5 text-red-400" />,
  magic: <Sparkles className="h-5 w-5 text-blue-400" />,
  arrow: <Target className="h-5 w-5 text-green-400" />,
  dark:  <Skull  className="h-5 w-5 text-purple-400" />,
};

const SKILL_COLOR: Record<string, string> = {
  attack: 'hover:bg-red-900/40 hover:border-red-500',
  buff:   'hover:bg-blue-900/40 hover:border-blue-400',
  debuff: 'hover:bg-orange-900/40 hover:border-orange-400',
  heal:   'hover:bg-green-900/40 hover:border-green-400',
};

const RARITY_BORDER: Record<string, string> = {
  Common:    'border-zinc-500',
  Uncommon:  'border-green-500',
  Rare:      'border-blue-500',
  Epic:      'border-purple-500',
  Legendary: 'border-orange-400 shadow-[0_0_20px_rgba(255,160,0,0.6)]',
};

// Skill effect overlay colours
const EFFECT_OVERLAY: Record<string, string> = {
  slash: 'from-red-500/30',
  magic: 'from-blue-500/30',
  arrow: 'from-green-500/20',
  dark:  'from-purple-700/40',
};

export function CombatPanel() {
  const {
    player, combat, progression, animation,
    attack, useSkill, flee, processVictory, clearLootDrop, clearBossDeathCry,
  } = useGameStore();
  const derivedStats = useDerivedStats();

  const zone   = getZone(progression.floor);
  const bg     = ZONE_BG[zone];
  const zoneName = ZONE_NAMES[zone];

  // Auto-dismiss loot drop after 3s
  useEffect(() => {
    if (animation.lootDrop) {
      const t = setTimeout(clearLootDrop, 3000);
      return () => clearTimeout(t);
    }
  }, [animation.lootDrop]);

  useEffect(() => {
    if (animation.bossDeathCry) {
      const t = setTimeout(clearBossDeathCry, 4000);
      return () => clearTimeout(t);
    }
  }, [animation.bossDeathCry]);

  // ── Explore / idle screen ─────────────────────────────────────────────────
  if (!player || !combat.enemy) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center panel-border rounded-xl overflow-hidden relative"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center space-y-4 px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{zoneName}</p>
          <h2 className="text-3xl font-display text-accent text-glow">Floor {progression.floor}</h2>
          <p className="text-muted-foreground text-sm">The shadows stir...</p>
          <Button
            size="lg"
            onClick={() => useGameStore.getState().explore()}
            className="bg-red-800 hover:bg-red-700 text-white font-bold tracking-widest text-base px-12 py-6 rounded border border-red-500/50 shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,0,0.7)] transition-all hover:scale-105 mt-4"
          >
            <Sword className="mr-2 h-5 w-5" /> DESCEND DEEPER
          </Button>
        </div>
      </div>
    );
  }

  const { enemy, turn } = combat;
  const skills = CLASS_SKILLS[player.heroClass];
  const isPlayerTurn = turn === 'player' && enemy.hp > 0;

  return (
    <div className="h-full flex flex-col gap-3 relative">

      {/* ── Loot Drop Popup ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {animation.lootDrop && (
          <motion.div
            key="loot-popup"
            initial={{ y: -60, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-sm bg-black/80',
              RARITY_BORDER[animation.lootDrop.rarity],
            )}
          >
            <span className="text-3xl">{animation.lootDrop.sprite ?? '📦'}</span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Item Drop!</p>
              <p className={cn('font-bold text-sm', {
                'text-zinc-300':  animation.lootDrop.rarity === 'Common',
                'text-green-400': animation.lootDrop.rarity === 'Uncommon',
                'text-blue-400':  animation.lootDrop.rarity === 'Rare',
                'text-purple-400':animation.lootDrop.rarity === 'Epic',
                'text-orange-400':animation.lootDrop.rarity === 'Legendary',
              })}>{animation.lootDrop.name}</p>
              <p className="text-[10px] text-zinc-500">{animation.lootDrop.rarity}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Boss Death Cry ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {animation.bossDeathCry && (
          <motion.div
            key="boss-cry"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/90 border border-red-700 rounded-2xl p-8 max-w-sm text-center shadow-[0_0_40px_rgba(255,0,0,0.5)]">
              <Skull className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-400 font-display text-lg leading-snug italic">"{animation.bossDeathCry}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Enemy Area ────────────────────────────────────────────────────── */}
      <div
        className="flex-1 panel-border rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-0"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Zone overlay */}
        <div className={cn(
          'absolute inset-0',
          zone === 1 ? 'bg-black/60' : zone === 2 ? 'bg-black/70' : zone === 3 ? 'bg-black/55' : 'bg-black/80'
        )} />

        {/* Skill effect overlay flash */}
        <AnimatePresence>
          {animation.skillEffect && (
            <motion.div
              key="skill-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('absolute inset-0 z-10 bg-gradient-to-t to-transparent pointer-events-none', EFFECT_OVERLAY[animation.skillEffect])}
            />
          )}
        </AnimatePresence>

        {/* Zone label */}
        <div className="absolute top-3 left-4 z-10 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">
          {zoneName} · Floor {progression.floor}
        </div>

        {/* Enemy sprite + health */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={enemy.id}
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, filter: 'blur(10px)', y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="relative z-10 flex flex-col items-center w-full max-w-xs px-4"
          >
            {/* Name & title */}
            <div className="text-center mb-4">
              {enemy.title && (
                <p className="text-[10px] uppercase tracking-widest text-orange-400 mb-1">{enemy.title}</p>
              )}
              <h3 className={cn('font-display flex items-center justify-center gap-2', enemy.isBoss ? 'text-3xl text-red-400' : 'text-xl text-zinc-100')}>
                {enemy.isBoss && <Skull className="text-red-500 h-6 w-6" />}
                {enemy.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Lv.{enemy.level}</p>
            </div>

            {/* Emoji sprite */}
            <motion.div
              animate={{
                y: animation.enemyAttacking ? [0, -16, 0] : [0, -6, 0],
                rotate: animation.enemyHit ? [0, -8, 8, -4, 0] : 0,
                scale: animation.enemyHit ? [1, 0.9, 1.05, 1] : animation.critFlash ? [1, 1.2, 1] : 1,
                filter: animation.enemyHit
                  ? ['brightness(1)', 'brightness(3) hue-rotate(0deg)', 'brightness(1)']
                  : animation.critFlash
                  ? ['brightness(1)', 'brightness(4) saturate(2)', 'brightness(1)']
                  : 'brightness(1)',
              }}
              transition={{ duration: animation.enemyHit ? 0.35 : 2, repeat: animation.enemyHit || animation.critFlash ? 0 : Infinity, ease: 'easeInOut' }}
              className={cn(
                'text-[80px] leading-none select-none mb-6 drop-shadow-lg',
                enemy.isBoss && 'text-[100px]',
                animation.enemyHit && 'drop-shadow-[0_0_20px_rgba(255,50,50,1)]',
              )}
            >
              {enemy.sprite}
            </motion.div>

            {/* Enemy HP bar */}
            <StatBar
              current={enemy.hp}
              max={enemy.maxHp}
              colorClass={enemy.isBoss ? 'bg-orange-600' : 'bg-red-600'}
              label="HP"
              className="w-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Victory overlay */}
        {enemy.hp <= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/85 z-20 flex items-center justify-center flex-col gap-4 backdrop-blur-sm"
          >
            <motion.h2
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              className="text-5xl font-display text-accent text-glow"
            >VICTORY</motion.h2>
            <p className="text-zinc-400 text-sm">+XP +Gold{animation.lootDrop ? ' +Loot' : ''}</p>
            <Button
              onClick={() => processVictory()}
              className="border border-accent text-accent bg-transparent hover:bg-accent hover:text-black font-bold px-8 py-3"
            >
              Collect &amp; Continue
            </Button>
          </motion.div>
        )}

        {/* Player attack animation → projectile */}
        <AnimatePresence>
          {animation.playerAttacking && animation.skillEffect && (
            <motion.div
              key="projectile"
              initial={{ x: '-50%', y: '80%', opacity: 1, scale: 0.5 }}
              animate={{ x: '0%', y: '-10%', opacity: 0, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute z-30 left-1/2 pointer-events-none text-5xl"
            >
              {animation.skillEffect === 'slash' ? '⚔️'
               : animation.skillEffect === 'magic' ? '🔮'
               : animation.skillEffect === 'arrow' ? '🏹'
               : '💀'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player hit flash */}
        <AnimatePresence>
          {animation.playerHit && (
            <motion.div
              key="player-hit"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-30 bg-red-800/50 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Action Bar ────────────────────────────────────────────────────── */}
      <div className="panel-border rounded-xl p-3 shrink-0 bg-background/95">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">

          {/* Basic Attack */}
          <Button
            disabled={!isPlayerTurn}
            onClick={() => attack()}
            className="h-16 flex flex-col items-center justify-center bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-500 transition-all gap-1"
          >
            <Sword className="h-5 w-5 text-red-400" />
            <span className="text-xs font-bold">Attack</span>
          </Button>

          {/* Skills */}
          {skills.map(skill => {
            const cd        = combat.playerCooldowns[skill.id] ?? 0;
            const canAfford = player.mp >= skill.mpCost;
            const icon      = SKILL_ICON[skill.animationType ?? 'slash'];
            return (
              <Button
                key={skill.id}
                disabled={!isPlayerTurn || cd > 0 || !canAfford}
                onClick={() => useSkill(skill.id)}
                title={`${skill.name}: ${skill.description} (${skill.mpCost} MP)`}
                className={cn(
                  'h-16 flex flex-col items-center justify-center bg-zinc-800 border border-zinc-700 relative overflow-hidden transition-all gap-0.5',
                  SKILL_COLOR[skill.type],
                  (cd > 0 || !canAfford) && 'opacity-60',
                )}
              >
                {cd > 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                    <span className="font-mono font-bold text-xl text-orange-400">{cd}</span>
                  </div>
                )}
                {icon}
                <span className="text-[10px] font-semibold leading-tight text-center px-1 line-clamp-1">{skill.name}</span>
                <span className="text-[9px] text-blue-300">{skill.mpCost}mp</span>
              </Button>
            );
          })}

          {/* Flee */}
          <Button
            disabled={!isPlayerTurn}
            onClick={() => flee()}
            variant="ghost"
            className="h-16 flex flex-col items-center justify-center border border-zinc-700 hover:bg-zinc-800 gap-1"
          >
            <Footprints className="h-5 w-5 text-zinc-400" />
            <span className="text-xs">Flee</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
