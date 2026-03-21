import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HeroClass, Stats, Item, Enemy, CLASS_BASE_STATS, CLASS_SKILLS, generateEnemy, generateLoot } from './game-data';

export interface CombatLog {
  id: string;
  message: string;
  type: 'damage' | 'heal' | 'system' | 'loot' | 'enemy-damage' | 'boss' | 'crit';
}

export interface PlayerState {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  xpNeeded: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseStats: Stats;
  statPoints: number;
  prestige: number;
}

export interface AnimationState {
  playerAttacking: boolean;
  enemyHit: boolean;
  enemyAttacking: boolean;
  playerHit: boolean;
  skillEffect: string | null; // 'slash' | 'magic' | 'arrow' | 'dark' | null
  critFlash: boolean;
  lootDrop: Item | null;
  bossDeathCry: string | null;
}

export interface GameState {
  player: PlayerState | null;
  inventory: Item[];
  equipment: {
    Weapon: Item | null;
    Armor: Item | null;
    Helmet: Item | null;
    Accessory: Item | null;
  };
  combat: {
    inCombat: boolean;
    enemy: Enemy | null;
    logs: CombatLog[];
    turn: 'player' | 'enemy';
    playerCooldowns: Record<string, number>;
    stunned: boolean;
  };
  progression: {
    floor: number;
    highestFloor: number;
  };
  totalKills: number;
  animation: AnimationState;

  // Actions
  createNewGame: (name: string, heroClass: HeroClass) => void;
  loadState: (state: Partial<GameState>) => void;
  explore: () => void;
  attack: () => void;
  useSkill: (skillId: string) => void;
  useItem: (itemId: string) => void;
  equip: (item: Item) => void;
  unequip: (slot: keyof GameState['equipment']) => void;
  sellItem: (item: Item) => void;
  buyItem: (item: Item) => void;
  allocateStat: (stat: keyof Stats) => void;
  flee: () => void;
  addLog: (msg: string, type: CombatLog['type']) => void;
  enemyTurn: () => void;
  processVictory: () => void;
  processDefeat: () => void;
  clearLootDrop: () => void;
  clearBossDeathCry: () => void;
}

const getXpNeeded = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

const calculateDerivedStats = (base: Stats, equip: GameState['equipment']) => {
  let maxHp = base.vit * 10;
  let maxMp = base.int * 5;
  let atk = base.str * 2;
  let def = base.vit;

  Object.values(equip).forEach(item => {
    if (!item?.stats) return;
    if (item.stats.hp)  maxHp += item.stats.hp;
    if (item.stats.mp)  maxMp += item.stats.mp;
    if (item.stats.atk) atk   += item.stats.atk;
    if (item.stats.def) def   += item.stats.def;
    if (item.stats.str) atk   += item.stats.str * 2;
    if (item.stats.vit) { maxHp += item.stats.vit * 10; def += item.stats.vit; }
  });

  return { maxHp, maxMp, atk, def };
};

const DEFAULT_ANIMATION: AnimationState = {
  playerAttacking: false,
  enemyHit: false,
  enemyAttacking: false,
  playerHit: false,
  skillEffect: null,
  critFlash: false,
  lootDrop: null,
  bossDeathCry: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: null,
      inventory: [],
      equipment: { Weapon: null, Armor: null, Helmet: null, Accessory: null },
      combat: {
        inCombat: false,
        enemy: null,
        logs: [],
        turn: 'player',
        playerCooldowns: {},
        stunned: false,
      },
      progression: { floor: 1, highestFloor: 1 },
      totalKills: 0,
      animation: DEFAULT_ANIMATION,

      addLog: (msg, type) => set(state => ({
        combat: {
          ...state.combat,
          logs: [{ id: Math.random().toString(), message: msg, type }, ...state.combat.logs].slice(0, 60),
        },
      })),

      createNewGame: (name, heroClass) => {
        const baseStats = { ...CLASS_BASE_STATS[heroClass] };
        set({
          player: {
            id: Math.random().toString(36).substring(7),
            name,
            heroClass,
            level: 1,
            xp: 0,
            xpNeeded: getXpNeeded(1),
            gold: 50,
            hp: baseStats.vit * 10,
            maxHp: baseStats.vit * 10,
            mp: baseStats.int * 5,
            maxMp: baseStats.int * 5,
            baseStats,
            statPoints: 0,
            prestige: 0,
          },
          inventory: [],
          equipment: { Weapon: null, Armor: null, Helmet: null, Accessory: null },
          combat: { inCombat: false, enemy: null, logs: [], turn: 'player', playerCooldowns: {}, stunned: false },
          progression: { floor: 1, highestFloor: 1 },
          totalKills: 0,
          animation: DEFAULT_ANIMATION,
        });
      },

      loadState: (newState) => set(state => ({ ...state, ...newState })),

      explore: () => {
        const { progression, player } = get();
        if (!player) return;
        const enemy = generateEnemy(progression.floor);
        const isBoss = enemy.isBoss;
        get().addLog(
          isBoss
            ? `⚠️ BOSS ENCOUNTER: ${enemy.name} — "${enemy.title}" stands before you!`
            : `⚔️ A wild ${enemy.name} ${enemy.sprite} appears!`,
          isBoss ? 'boss' : 'system',
        );
        set(state => ({
          combat: {
            inCombat: true,
            enemy,
            logs: state.combat.logs,
            turn: 'player',
            playerCooldowns: state.combat.playerCooldowns,
            stunned: false,
          },
          animation: DEFAULT_ANIMATION,
        }));
      },

      attack: () => {
        const { player, combat, equipment } = get();
        if (!player || !combat.enemy || combat.turn !== 'player') return;

        const { atk } = calculateDerivedStats(player.baseStats, equipment);
        const critChance = 0.05 + player.baseStats.dex * 0.008;
        const isCrit = Math.random() < critChance;
        const rawDmg = Math.floor((atk * (0.85 + Math.random() * 0.3)) - combat.enemy.def * 0.4);
        const finalDmg = Math.max(1, isCrit ? Math.floor(rawDmg * 2) : rawDmg);

        // Trigger player attack animation
        set(state => ({ animation: { ...state.animation, playerAttacking: true, skillEffect: 'slash' } }));
        setTimeout(() => {
          set(state => ({ animation: { ...state.animation, playerAttacking: false, enemyHit: true, critFlash: isCrit } }));
          setTimeout(() => set(state => ({ animation: { ...state.animation, enemyHit: false, critFlash: false, skillEffect: null } })), 400);
        }, 300);

        get().addLog(
          isCrit ? `💥 CRITICAL HIT! You slam ${combat.enemy.name} for ${finalDmg} damage!`
                 : `⚔️ You strike ${combat.enemy.name} for ${finalDmg} damage.`,
          isCrit ? 'crit' : 'damage',
        );

        set(state => {
          if (!state.combat.enemy) return state;
          return {
            combat: { ...state.combat, enemy: { ...state.combat.enemy, hp: Math.max(0, state.combat.enemy.hp - finalDmg) }, turn: 'enemy' },
          };
        });

        if (get().combat.enemy!.hp <= 0) {
          get().processVictory();
        } else {
          setTimeout(() => get().enemyTurn(), 900);
        }
      },

      useSkill: (skillId) => {
        const { player, combat, equipment } = get();
        if (!player || !combat.enemy || combat.turn !== 'player') return;

        const skill = CLASS_SKILLS[player.heroClass].find(s => s.id === skillId);
        if (!skill) return;
        if (player.mp < skill.mpCost) { get().addLog('❌ Not enough mana!', 'system'); return; }
        if ((combat.playerCooldowns[skillId] || 0) > 0) { get().addLog('⏳ Skill on cooldown!', 'system'); return; }

        set(state => ({
          player: { ...state.player!, mp: state.player!.mp - skill.mpCost },
          combat: { ...state.combat, playerCooldowns: { ...state.combat.playerCooldowns, [skillId]: skill.cooldown } },
        }));

        // Trigger skill animation
        const anim = skill.animationType ?? 'slash';
        set(state => ({ animation: { ...state.animation, playerAttacking: true, skillEffect: anim } }));
        setTimeout(() => {
          set(state => ({ animation: { ...state.animation, playerAttacking: false, enemyHit: true } }));
          setTimeout(() => set(state => ({ animation: { ...state.animation, enemyHit: false, skillEffect: null } })), 500);
        }, 400);

        if (skill.type === 'attack') {
          const { atk, maxMp } = calculateDerivedStats(player.baseStats, equipment);
          const scaleStat = skill.statScale === 'int' ? (maxMp / 2) : atk;
          const damage = Math.max(1, Math.floor(scaleStat * skill.multiplier - combat.enemy.def * 0.3));
          get().addLog(`✨ ${skill.name}! Deals ${damage} damage to ${combat.enemy.name}!`, 'damage');

          set(state => {
            if (!state.combat.enemy) return state;
            return {
              combat: { ...state.combat, enemy: { ...state.combat.enemy, hp: Math.max(0, state.combat.enemy.hp - damage) }, turn: 'enemy' },
            };
          });

          if (skill.effect === 'stun') get().addLog(`😵 ${combat.enemy.name} is stunned!`, 'system');
          if (skill.effect === 'poison') get().addLog(`☠️ ${combat.enemy.name} is poisoned!`, 'system');
        } else if (skill.type === 'buff') {
          get().addLog(`🛡️ ${skill.name} activated! Your power surges!`, 'system');
          set(state => ({ combat: { ...state.combat, turn: 'enemy' } }));
        } else if (skill.type === 'debuff') {
          get().addLog(`🎯 ${combat.enemy.name} is marked! Next hit deals bonus damage.`, 'system');
          set(state => ({ combat: { ...state.combat, turn: 'enemy' } }));
        }

        if (get().combat.enemy && get().combat.enemy!.hp <= 0) {
          get().processVictory();
        } else {
          setTimeout(() => get().enemyTurn(), 1000);
        }
      },

      enemyTurn: () => {
        const { player, combat, equipment } = get();
        if (!player || !combat.enemy || !combat.inCombat) return;
        if (combat.stunned) {
          get().addLog(`😵 ${combat.enemy.name} is stunned and skips their turn!`, 'system');
          set(state => ({ combat: { ...state.combat, turn: 'player', stunned: false } }));
          return;
        }

        const { def } = calculateDerivedStats(player.baseStats, equipment);

        // Boss uses special move 30% of the time
        const useSpecial = combat.enemy.isBoss && combat.enemy.specialMove && Math.random() < 0.3;
        const atkMult = useSpecial ? 1.8 : (0.8 + Math.random() * 0.4);
        const damage = Math.max(1, Math.floor(combat.enemy.atk * atkMult - def * 0.35));

        // Trigger enemy attack animation
        set(state => ({ animation: { ...state.animation, enemyAttacking: true } }));
        setTimeout(() => {
          set(state => ({ animation: { ...state.animation, enemyAttacking: false, playerHit: true } }));
          setTimeout(() => set(state => ({ animation: { ...state.animation, playerHit: false } })), 400);
        }, 300);

        if (useSpecial) {
          get().addLog(`🌋 ${combat.enemy.name} uses ${combat.enemy.specialMove}! ${combat.enemy.moveDesc} [${damage} DMG]`, 'boss');
        } else {
          get().addLog(`🔴 ${combat.enemy.name} attacks you for ${damage} damage!`, 'enemy-damage');
        }

        // Reduce cooldowns
        const newCooldowns = { ...combat.playerCooldowns };
        Object.keys(newCooldowns).forEach(k => { if (newCooldowns[k] > 0) newCooldowns[k]--; });

        set(state => ({
          player: { ...state.player!, hp: Math.max(0, state.player!.hp - damage) },
          combat: { ...state.combat, turn: 'player', playerCooldowns: newCooldowns },
        }));

        if (get().player!.hp <= 0) get().processDefeat();
      },

      processVictory: () => {
        const { combat, progression, player } = get();
        if (!player || !combat.enemy) return;

        const xpGain   = Math.floor(combat.enemy.level * (combat.enemy.isBoss ? 50 : 15) * (1 + player.prestige * 0.1));
        const goldGain = Math.floor(combat.enemy.level * (combat.enemy.isBoss ? 40 : 10) * (1 + player.prestige * 0.1));
        const loot     = generateLoot(progression.floor);

        if (combat.enemy.isBoss && combat.enemy.deathCry) {
          get().addLog(`💀 ${combat.enemy.deathCry}`, 'boss');
          set(state => ({ animation: { ...state.animation, bossDeathCry: combat.enemy!.deathCry! } }));
        }
        get().addLog(`🏆 Victory! +${xpGain} XP  +${goldGain} Gold`, 'system');
        if (loot) get().addLog(`🎁 Item drop: ${loot.sprite ?? ''} ${loot.name} [${loot.rarity}]`, 'loot');

        let newXp = player.xp + xpGain;
        let newLevel = player.level;
        let newStatPoints = player.statPoints;
        let xpNeeded = player.xpNeeded;

        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
          newStatPoints += 3;
          xpNeeded = getXpNeeded(newLevel);
          get().addLog(`⬆️ Level Up! You are now level ${newLevel}! (+3 stat points)`, 'system');
        }

        const { maxHp } = calculateDerivedStats(player.baseStats, get().equipment);
        const newHp = Math.min(maxHp, player.hp + Math.floor(maxHp * 0.1));

        set(state => ({
          player: {
            ...state.player!,
            level: newLevel,
            xp: newXp,
            xpNeeded,
            statPoints: newStatPoints,
            gold: state.player!.gold + goldGain,
            hp: newHp,
          },
          inventory: loot ? [...state.inventory, loot] : state.inventory,
          progression: {
            floor: state.progression.floor + 1,
            highestFloor: Math.max(state.progression.highestFloor, state.progression.floor + 1),
          },
          combat: { ...state.combat, inCombat: false, enemy: null },
          totalKills: state.totalKills + 1,
          animation: { ...state.animation, lootDrop: loot },
        }));
      },

      processDefeat: () => {
        get().addLog(`💔 You have been slain... Retreating to safety.`, 'system');
        set(state => {
          const { maxHp } = calculateDerivedStats(state.player!.baseStats, state.equipment);
          return {
            player: { ...state.player!, hp: Math.floor(maxHp * 0.5) },
            progression: { ...state.progression, floor: Math.max(1, state.progression.floor - 5) },
            combat: { ...state.combat, inCombat: false, enemy: null, turn: 'player' },
          };
        });
      },

      flee: () => {
        const goldLoss = Math.floor((get().player?.gold ?? 0) * 0.05);
        get().addLog(`🏃 You flee from battle, losing ${goldLoss} gold in panic!`, 'system');
        set(state => ({
          player: { ...state.player!, gold: Math.max(0, state.player!.gold - goldLoss) },
          combat: { ...state.combat, inCombat: false, enemy: null, turn: 'player' },
        }));
      },

      useItem: (itemId) => {
        const itemIndex = get().inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;
        const item = get().inventory[itemIndex];
        if (item.type !== 'Potion' || !item.restore) return;

        set(state => {
          const newInv = [...state.inventory];
          newInv.splice(itemIndex, 1);
          const { maxHp, maxMp } = calculateDerivedStats(state.player!.baseStats, state.equipment);
          return {
            inventory: newInv,
            player: {
              ...state.player!,
              hp: item.restore!.hp ? Math.min(maxHp, state.player!.hp + item.restore!.hp) : state.player!.hp,
              mp: item.restore!.mp ? Math.min(maxMp, state.player!.mp + item.restore!.mp) : state.player!.mp,
            },
          };
        });
        get().addLog(`🧪 Used ${item.name}.`, 'heal');
        if (get().combat.inCombat && get().combat.turn === 'player') {
          set(state => ({ combat: { ...state.combat, turn: 'enemy' } }));
          setTimeout(() => get().enemyTurn(), 800);
        }
      },

      equip: (item) => {
        if (item.type === 'Potion') return;
        set(state => {
          const newEquip = { ...state.equipment };
          const newInv = state.inventory.filter(i => i.id !== item.id);
          const current = newEquip[item.type as keyof GameState['equipment']];
          if (current) newInv.push(current);
          newEquip[item.type as keyof GameState['equipment']] = item;
          return { equipment: newEquip, inventory: newInv };
        });
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({ player: { ...state.player!, hp: Math.min(state.player!.hp, maxHp), mp: Math.min(state.player!.mp, maxMp), maxHp, maxMp } }));
      },

      unequip: (slot) => {
        set(state => {
          const item = state.equipment[slot];
          if (!item) return state;
          return { equipment: { ...state.equipment, [slot]: null }, inventory: [...state.inventory, item] };
        });
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({ player: { ...state.player!, hp: Math.min(state.player!.hp, maxHp), mp: Math.min(state.player!.mp, maxMp), maxHp, maxMp } }));
      },

      sellItem: (item) => set(state => ({
        inventory: state.inventory.filter(i => i.id !== item.id),
        player: { ...state.player!, gold: state.player!.gold + Math.floor(item.value / 2) },
      })),

      buyItem: (item) => {
        if (get().player!.gold < item.value) return;
        set(state => ({
          inventory: [...state.inventory, { ...item, id: Math.random().toString() }],
          player: { ...state.player!, gold: state.player!.gold - item.value },
        }));
      },

      allocateStat: (stat) => {
        if (get().player!.statPoints <= 0) return;
        set(state => ({
          player: {
            ...state.player!,
            baseStats: { ...state.player!.baseStats, [stat]: state.player!.baseStats[stat] + 1 },
            statPoints: state.player!.statPoints - 1,
          },
        }));
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({ player: { ...state.player!, maxHp, maxMp } }));
      },

      clearLootDrop: () => set(state => ({ animation: { ...state.animation, lootDrop: null } })),
      clearBossDeathCry: () => set(state => ({ animation: { ...state.animation, bossDeathCry: null } })),
    }),
    { name: 'dark-realm-v2-storage' },
  ),
);

export const useDerivedStats = () => {
  const player    = useGameStore(s => s.player);
  const equipment = useGameStore(s => s.equipment);
  if (!player) return null;
  return calculateDerivedStats(player.baseStats, equipment);
};
