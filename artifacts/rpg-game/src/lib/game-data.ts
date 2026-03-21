import { v4 as uuidv4 } from 'uuid';

export type HeroClass = 'Warrior' | 'Mage' | 'Rogue' | 'Ranger';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'Weapon' | 'Armor' | 'Helmet' | 'Accessory' | 'Potion';

export interface Stats {
  str: number; // Physical dmg
  dex: number; // Crit, dodge, ranger dmg
  int: number; // Magic dmg, Max MP
  vit: number; // Max HP
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  cooldown: number;
  type: 'attack' | 'buff' | 'debuff' | 'heal';
  multiplier: number;
  statScale: keyof Stats;
  effect?: 'stun' | 'poison' | 'shield';
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  stats?: Partial<Stats> & { hp?: number; mp?: number; atk?: number; def?: number; crit?: number };
  value: number;
  description: string;
  restore?: { hp?: number; mp?: number };
}

export const CLASS_BASE_STATS: Record<HeroClass, Stats> = {
  Warrior: { str: 10, dex: 4, int: 2, vit: 12 },
  Mage: { str: 2, dex: 5, int: 14, vit: 6 },
  Rogue: { str: 6, dex: 12, int: 4, vit: 8 },
  Ranger: { str: 5, dex: 10, int: 6, vit: 9 },
};

export const CLASS_SKILLS: Record<HeroClass, Skill[]> = {
  Warrior: [
    { id: 'w1', name: 'Heavy Strike', description: 'A powerful physical attack.', mpCost: 5, cooldown: 0, type: 'attack', multiplier: 1.5, statScale: 'str' },
    { id: 'w2', name: 'Shield Bash', description: 'Stuns the enemy.', mpCost: 15, cooldown: 3, type: 'attack', multiplier: 0.8, statScale: 'str', effect: 'stun' },
    { id: 'w3', name: 'Battle Cry', description: 'Buffs attack power.', mpCost: 20, cooldown: 5, type: 'buff', multiplier: 0, statScale: 'str' },
  ],
  Mage: [
    { id: 'm1', name: 'Fireball', description: 'High magic damage.', mpCost: 10, cooldown: 0, type: 'attack', multiplier: 1.8, statScale: 'int' },
    { id: 'm2', name: 'Ice Lance', description: 'Damages and has a chance to freeze (stun).', mpCost: 20, cooldown: 3, type: 'attack', multiplier: 1.2, statScale: 'int', effect: 'stun' },
    { id: 'm3', name: 'Arcane Shield', description: 'Absorbs damage.', mpCost: 30, cooldown: 5, type: 'buff', multiplier: 0, statScale: 'int', effect: 'shield' },
  ],
  Rogue: [
    { id: 'r1', name: 'Backstab', description: 'High crit chance attack.', mpCost: 8, cooldown: 0, type: 'attack', multiplier: 1.6, statScale: 'dex' },
    { id: 'r2', name: 'Poison Blade', description: 'Poisons the enemy.', mpCost: 15, cooldown: 3, type: 'attack', multiplier: 1.0, statScale: 'dex', effect: 'poison' },
    { id: 'r3', name: 'Shadow Step', description: 'Increases dodge vastly.', mpCost: 25, cooldown: 5, type: 'buff', multiplier: 0, statScale: 'dex' },
  ],
  Ranger: [
    { id: 'ra1', name: 'Aimed Shot', description: 'Precise ranged attack.', mpCost: 6, cooldown: 0, type: 'attack', multiplier: 1.5, statScale: 'dex' },
    { id: 'ra2', name: 'Volley', description: 'Multiple weak hits.', mpCost: 18, cooldown: 3, type: 'attack', multiplier: 2.0, statScale: 'dex' },
    { id: 'ra3', name: 'Hunter Mark', description: 'Increases damage taken by enemy.', mpCost: 20, cooldown: 4, type: 'debuff', multiplier: 0, statScale: 'int' },
  ]
};

export const ENEMY_TYPES = {
  1: [{ name: 'Slime', hpMod: 0.8, atkMod: 0.5, defMod: 0.5 }, { name: 'Goblin', hpMod: 1, atkMod: 1, defMod: 0.8 }, { name: 'Wolf', hpMod: 0.9, atkMod: 1.2, defMod: 0.6 }],
  2: [{ name: 'Skeleton', hpMod: 1.2, atkMod: 1.2, defMod: 1.2 }, { name: 'Zombie', hpMod: 1.5, atkMod: 0.8, defMod: 1.5 }, { name: 'Cultist', hpMod: 0.8, atkMod: 1.8, defMod: 0.5 }],
  3: [{ name: 'Fire Elemental', hpMod: 1.5, atkMod: 2, defMod: 1.2 }, { name: 'Demon', hpMod: 2, atkMod: 1.8, defMod: 1.8 }],
  4: [{ name: 'Shadow Wraith', hpMod: 1.8, atkMod: 2.5, defMod: 2 }, { name: 'Ancient Drake', hpMod: 3, atkMod: 2, defMod: 3 }]
};

export const generateEnemy = (floor: number) => {
  const zone = Math.min(Math.ceil(floor / 10), 4) as 1|2|3|4;
  const isBoss = floor % 10 === 0;
  
  const possibleTypes = ENEMY_TYPES[zone];
  const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
  
  const level = floor;
  const baseHp = 20 + (level * 8);
  const baseAtk = 4 + (level * 2);
  const baseDef = 2 + (level * 1.5);
  
  const bossMod = isBoss ? 3 : 1;
  
  return {
    id: uuidv4(),
    name: isBoss ? `Boss: ${type.name} King` : type.name,
    level,
    maxHp: Math.floor(baseHp * type.hpMod * bossMod),
    hp: Math.floor(baseHp * type.hpMod * bossMod),
    atk: Math.floor(baseAtk * type.atkMod * bossMod),
    def: Math.floor(baseDef * type.defMod * bossMod),
    isBoss,
    status: [] as string[]
  };
};

export const generateLoot = (floor: number): Item | null => {
  if (Math.random() > 0.4) return null; // 40% drop chance
  
  const r = Math.random();
  let rarity: Rarity = 'Common';
  let multiplier = 1;
  
  if (r > 0.95) { rarity = 'Legendary'; multiplier = 3; }
  else if (r > 0.85) { rarity = 'Epic'; multiplier = 2; }
  else if (r > 0.6) { rarity = 'Rare'; multiplier = 1.5; }
  else if (r > 0.3) { rarity = 'Uncommon'; multiplier = 1.2; }
  
  const types: ItemType[] = ['Weapon', 'Armor', 'Helmet', 'Accessory'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const statBase = Math.max(1, Math.floor(floor * multiplier));
  
  return {
    id: uuidv4(),
    name: `${rarity} ${type} of Floor ${floor}`,
    type,
    rarity,
    stats: {
      atk: type === 'Weapon' ? statBase * 2 : 0,
      def: ['Armor', 'Helmet'].includes(type) ? statBase * 2 : 0,
      hp: statBase * 5,
      str: Math.floor(statBase / 2),
      vit: Math.floor(statBase / 2),
    },
    value: Math.floor(floor * 10 * multiplier),
    description: `A mysterious ${type} found on floor ${floor}.`
  };
};

export const POTIONS: Item[] = [
  { id: 'p1', name: 'Minor Health Potion', type: 'Potion', rarity: 'Common', value: 20, description: 'Restores 50 HP', restore: { hp: 50 } },
  { id: 'p2', name: 'Health Potion', type: 'Potion', rarity: 'Uncommon', value: 50, description: 'Restores 150 HP', restore: { hp: 150 } },
  { id: 'p3', name: 'Minor Mana Potion', type: 'Potion', rarity: 'Common', value: 20, description: 'Restores 30 MP', restore: { mp: 30 } },
];
