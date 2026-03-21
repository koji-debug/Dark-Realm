import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HeroClass, Stats, Item, CLASS_BASE_STATS, CLASS_SKILLS, generateEnemy, generateLoot } from './game-data';

export interface CombatLog {
  id: string;
  message: string;
  type: 'damage' | 'heal' | 'system' | 'loot' | 'enemy-damage';
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
    enemy: ReturnType<typeof generateEnemy> | null;
    logs: CombatLog[];
    turn: 'player' | 'enemy';
    playerCooldowns: Record<string, number>;
  };
  progression: {
    floor: number;
    highestFloor: number;
  };
  
  // Actions
  createNewGame: (name: string, heroClass: HeroClass) => void;
  loadState: (state: GameState) => void;
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
}

const getXpNeeded = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

const calculateDerivedStats = (base: Stats, equip: GameState['equipment']) => {
  let maxHp = base.vit * 10;
  let maxMp = base.int * 5;
  let atk = base.str * 2;
  let def = base.vit * 1;
  
  Object.values(equip).forEach(item => {
    if (!item?.stats) return;
    if (item.stats.hp) maxHp += item.stats.hp;
    if (item.stats.mp) maxMp += item.stats.mp;
    if (item.stats.atk) atk += item.stats.atk;
    if (item.stats.def) def += item.stats.def;
    if (item.stats.str) atk += item.stats.str * 2;
    if (item.stats.vit) { maxHp += item.stats.vit * 10; def += item.stats.vit; }
  });
  
  return { maxHp, maxMp, atk, def };
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
      },
      progression: { floor: 1, highestFloor: 1 },

      addLog: (msg, type) => set(state => ({
        combat: { ...state.combat, logs: [{ id: Math.random().toString(), message: msg, type }, ...state.combat.logs].slice(0, 50) }
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
            gold: 0,
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
          combat: { inCombat: false, enemy: null, logs: [], turn: 'player', playerCooldowns: {} },
          progression: { floor: 1, highestFloor: 1 }
        });
      },

      loadState: (newState) => set(newState),

      explore: () => {
        const { progression, player } = get();
        if (!player) return;
        
        const enemy = generateEnemy(progression.floor);
        set(state => ({
          combat: { 
            inCombat: true, 
            enemy, 
            logs: [{ id: Math.random().toString(), message: `Encountered ${enemy.name}!`, type: 'system' }],
            turn: 'player',
            playerCooldowns: state.combat.playerCooldowns // Keep cooldowns between fights
          }
        }));
      },

      attack: () => {
        const { player, combat, equipment, enemyTurn } = get();
        if (!player || !combat.enemy || combat.turn !== 'player') return;

        const { atk } = calculateDerivedStats(player.baseStats, equipment);
        
        // Simple damage formula
        const damage = Math.max(1, Math.floor((atk * (0.8 + Math.random()*0.4)) - (combat.enemy.def * 0.5)));
        const isCrit = Math.random() < (player.baseStats.dex * 0.01);
        const finalDmg = isCrit ? damage * 2 : damage;

        get().addLog(`You hit ${combat.enemy.name} for ${finalDmg} damage! ${isCrit ? '(CRITICAL)' : ''}`, 'damage');

        set(state => {
          if (!state.combat.enemy) return state;
          const newHp = state.combat.enemy.hp - finalDmg;
          return {
            combat: {
              ...state.combat,
              enemy: { ...state.combat.enemy, hp: Math.max(0, newHp) },
              turn: 'enemy'
            }
          };
        });

        if (get().combat.enemy!.hp <= 0) {
          get().processVictory();
        } else {
          setTimeout(() => get().enemyTurn(), 800);
        }
      },

      useSkill: (skillId) => {
        const { player, combat, equipment, enemyTurn } = get();
        if (!player || !combat.enemy || combat.turn !== 'player') return;

        const skills = CLASS_SKILLS[player.heroClass];
        const skill = skills.find(s => s.id === skillId);
        if (!skill) return;

        if (player.mp < skill.mpCost) {
          get().addLog("Not enough mana!", "system");
          return;
        }

        if ((combat.playerCooldowns[skillId] || 0) > 0) {
          get().addLog("Skill is on cooldown!", "system");
          return;
        }

        // Apply cost and CD
        set(state => ({
          player: { ...state.player!, mp: state.player!.mp - skill.mpCost },
          combat: { 
            ...state.combat, 
            playerCooldowns: { ...state.combat.playerCooldowns, [skillId]: skill.cooldown } 
          }
        }));

        if (skill.type === 'attack') {
          const { atk, maxMp } = calculateDerivedStats(player.baseStats, equipment);
          // Scale damage based on skill definition
          const scaleStat = skill.statScale === 'int' ? (maxMp/2) : atk;
          const damage = Math.max(1, Math.floor((scaleStat * skill.multiplier) - (combat.enemy.def * 0.3)));
          
          get().addLog(`Used ${skill.name}! Dealt ${damage} damage.`, 'damage');
          
          set(state => {
            if (!state.combat.enemy) return state;
            const newHp = state.combat.enemy.hp - damage;
            return {
              combat: {
                ...state.combat,
                enemy: { ...state.combat.enemy, hp: Math.max(0, newHp) },
                turn: 'enemy'
              }
            };
          });
        } else if (skill.type === 'heal') {
           // Implement heal logic
        }

        if (get().combat.enemy!.hp <= 0) {
          get().processVictory();
        } else {
          setTimeout(() => get().enemyTurn(), 800);
        }
      },

      enemyTurn: () => {
        const { player, combat, equipment } = get();
        if (!player || !combat.enemy || combat.inCombat === false) return;

        const { def } = calculateDerivedStats(player.baseStats, equipment);
        const damage = Math.max(1, Math.floor((combat.enemy.atk * (0.8 + Math.random()*0.4)) - (def * 0.4)));

        get().addLog(`${combat.enemy.name} attacks you for ${damage} damage!`, 'enemy-damage');

        // Reduce cooldowns
        const newCooldowns = { ...combat.playerCooldowns };
        Object.keys(newCooldowns).forEach(k => {
          if (newCooldowns[k] > 0) newCooldowns[k]--;
        });

        set(state => {
          const newHp = state.player!.hp - damage;
          return {
            player: { ...state.player!, hp: Math.max(0, newHp) },
            combat: { ...state.combat, turn: 'player', playerCooldowns: newCooldowns }
          };
        });

        if (get().player!.hp <= 0) {
          get().processDefeat();
        }
      },

      processVictory: () => {
        const { combat, progression, player } = get();
        if (!player || !combat.enemy) return;

        const xpGain = Math.floor(combat.enemy.level * 15 * (1 + player.prestige * 0.1));
        const goldGain = Math.floor(combat.enemy.level * 10 * (1 + player.prestige * 0.1));
        const loot = generateLoot(progression.floor);

        get().addLog(`Victory! Gained ${xpGain} XP and ${goldGain} gold.`, 'system');
        if (loot) {
          get().addLog(`Found loot: ${loot.name}`, 'loot');
        }

        let newXp = player.xp + xpGain;
        let newLevel = player.level;
        let newStatPoints = player.statPoints;
        let xpNeeded = player.xpNeeded;

        // Level up check
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
          newStatPoints += 3;
          xpNeeded = getXpNeeded(newLevel);
          get().addLog(`Level up! You are now level ${newLevel}. Gained 3 stat points.`, 'system');
        }

        // Heal 10% after fight
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
            hp: newHp
          },
          inventory: loot ? [...state.inventory, loot] : state.inventory,
          progression: {
            ...state.progression,
            floor: state.progression.floor + 1,
            highestFloor: Math.max(state.progression.highestFloor, state.progression.floor + 1)
          },
          combat: { ...state.combat, inCombat: false, enemy: null }
        }));
      },

      processDefeat: () => {
        get().addLog(`You have been defeated... Fleeing to town.`, 'system');
        set(state => {
          const { maxHp } = calculateDerivedStats(state.player!.baseStats, state.equipment);
          return {
            player: { ...state.player!, hp: Math.floor(maxHp * 0.5) }, // Revive with 50% hp
            progression: { ...state.progression, floor: Math.max(1, state.progression.floor - 5) }, // Fall back 5 floors
            combat: { ...state.combat, inCombat: false, enemy: null, turn: 'player' }
          };
        });
      },

      flee: () => {
        get().addLog(`You fled from battle!`, 'system');
        set(state => ({
          combat: { ...state.combat, inCombat: false, enemy: null, turn: 'player' }
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
            }
          };
        });
        
        get().addLog(`Used ${item.name}.`, 'system');
        
        // If in combat, takes a turn
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
          
          // Move currently equipped back to inventory
          const currentSlot = newEquip[item.type as keyof GameState['equipment']];
          if (currentSlot) {
            newInv.push(currentSlot);
          }
          
          newEquip[item.type as keyof GameState['equipment']] = item;
          
          return { equipment: newEquip, inventory: newInv };
        });
        
        // Recalculate caps to ensure we don't exceed new max hp/mp
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({
          player: {
            ...state.player!,
            hp: Math.min(state.player!.hp, maxHp),
            mp: Math.min(state.player!.mp, maxMp),
            maxHp,
            maxMp
          }
        }));
      },

      unequip: (slot) => {
        set(state => {
          const item = state.equipment[slot];
          if (!item) return state;
          
          const newEquip = { ...state.equipment, [slot]: null };
          return {
            equipment: newEquip,
            inventory: [...state.inventory, item]
          };
        });
        
        // Recalculate caps
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({
          player: {
            ...state.player!,
            hp: Math.min(state.player!.hp, maxHp),
            mp: Math.min(state.player!.mp, maxMp),
            maxHp,
            maxMp
          }
        }));
      },

      sellItem: (item) => {
        set(state => ({
          inventory: state.inventory.filter(i => i.id !== item.id),
          player: { ...state.player!, gold: state.player!.gold + Math.floor(item.value / 2) }
        }));
      },

      buyItem: (item) => {
        if (get().player!.gold < item.value) return;
        set(state => ({
          inventory: [...state.inventory, { ...item, id: Math.random().toString() }],
          player: { ...state.player!, gold: state.player!.gold - item.value }
        }));
      },

      allocateStat: (stat) => {
        if (get().player!.statPoints <= 0) return;
        set(state => {
          const newBase = { ...state.player!.baseStats, [stat]: state.player!.baseStats[stat] + 1 };
          return {
            player: {
              ...state.player!,
              baseStats: newBase,
              statPoints: state.player!.statPoints - 1
            }
          };
        });
        
        // Update max hp/mp
        const { maxHp, maxMp } = calculateDerivedStats(get().player!.baseStats, get().equipment);
        set(state => ({
          player: {
            ...state.player!,
            maxHp,
            maxMp
          }
        }));
      }

    }),
    {
      name: 'dark-realm-storage',
    }
  )
);

export const useDerivedStats = () => {
  const player = useGameStore(s => s.player);
  const equipment = useGameStore(s => s.equipment);
  if (!player) return null;
  return calculateDerivedStats(player.baseStats, equipment);
};
