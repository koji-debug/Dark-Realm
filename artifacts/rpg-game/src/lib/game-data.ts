import { v4 as uuidv4 } from 'uuid';

export type HeroClass = 'Warrior' | 'Mage' | 'Rogue' | 'Ranger';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'Weapon' | 'Armor' | 'Helmet' | 'Accessory' | 'Potion';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
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
  animationType?: 'slash' | 'magic' | 'arrow' | 'dark';
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  sprite?: string;
  stats?: Partial<Stats> & { hp?: number; mp?: number; atk?: number; def?: number; crit?: number };
  value: number;
  description: string;
  restore?: { hp?: number; mp?: number };
}

export interface EnemyType {
  name: string;
  sprite: string;
  hpMod: number;
  atkMod: number;
  defMod: number;
  specialMove?: string;
  moveDesc?: string;
}

export interface BossData {
  name: string;
  title: string;
  sprite: string;
  hpMod: number;
  atkMod: number;
  defMod: number;
  specialMove: string;
  moveDesc: string;
  deathCry: string;
}

export const CLASS_BASE_STATS: Record<HeroClass, Stats> = {
  Warrior: { str: 10, dex: 4, int: 2, vit: 12 },
  Mage:    { str: 2, dex: 5, int: 14, vit: 6 },
  Rogue:   { str: 6, dex: 12, int: 4, vit: 8 },
  Ranger:  { str: 5, dex: 10, int: 6, vit: 9 },
};

export const CLASS_SKILLS: Record<HeroClass, Skill[]> = {
  Warrior: [
    { id: 'w1', name: 'Heavy Strike',  description: 'Powerful blow dealing 150% damage.',      mpCost: 5,  cooldown: 0, type: 'attack', multiplier: 1.5, statScale: 'str', animationType: 'slash' },
    { id: 'w2', name: 'Shield Bash',   description: 'Stuns the enemy for one turn.',             mpCost: 15, cooldown: 3, type: 'attack', multiplier: 0.8, statScale: 'str', effect: 'stun', animationType: 'slash' },
    { id: 'w3', name: 'Battle Cry',    description: 'Buffs all attacks this fight.',             mpCost: 20, cooldown: 5, type: 'buff',   multiplier: 0,   statScale: 'str', animationType: 'slash' },
    { id: 'w4', name: 'Whirlwind',     description: 'Spin attack: 200% damage.',                 mpCost: 30, cooldown: 6, type: 'attack', multiplier: 2.0, statScale: 'str', animationType: 'slash' },
  ],
  Mage: [
    { id: 'm1', name: 'Fireball',      description: 'Explosive magic dealing 180% damage.',     mpCost: 10, cooldown: 0, type: 'attack', multiplier: 1.8, statScale: 'int', animationType: 'magic' },
    { id: 'm2', name: 'Ice Lance',     description: 'Piercing ice that may freeze the foe.',    mpCost: 20, cooldown: 3, type: 'attack', multiplier: 1.2, statScale: 'int', effect: 'stun', animationType: 'magic' },
    { id: 'm3', name: 'Arcane Shield', description: 'Absorbs incoming damage.',                  mpCost: 30, cooldown: 5, type: 'buff',   multiplier: 0,   statScale: 'int', effect: 'shield', animationType: 'magic' },
    { id: 'm4', name: 'Thunder Storm', description: 'Lightning barrage dealing 250% damage.',   mpCost: 40, cooldown: 7, type: 'attack', multiplier: 2.5, statScale: 'int', animationType: 'magic' },
  ],
  Rogue: [
    { id: 'r1', name: 'Backstab',      description: 'Guaranteed critical hit — 160% damage.',  mpCost: 8,  cooldown: 0, type: 'attack', multiplier: 1.6, statScale: 'dex', animationType: 'slash' },
    { id: 'r2', name: 'Poison Blade',  description: 'Envenoms the enemy, dealing DoT.',         mpCost: 15, cooldown: 3, type: 'attack', multiplier: 1.0, statScale: 'dex', effect: 'poison', animationType: 'dark' },
    { id: 'r3', name: 'Shadow Step',   description: 'Teleport and strike for 180% damage.',    mpCost: 25, cooldown: 5, type: 'attack', multiplier: 1.8, statScale: 'dex', animationType: 'dark' },
    { id: 'r4', name: 'Assassination', description: 'Execute: 300% damage, requires 4 turns.', mpCost: 40, cooldown: 8, type: 'attack', multiplier: 3.0, statScale: 'dex', animationType: 'dark' },
  ],
  Ranger: [
    { id: 'ra1', name: 'Aimed Shot',   description: 'Precise strike — 150% ranged damage.',    mpCost: 6,  cooldown: 0, type: 'attack', multiplier: 1.5, statScale: 'dex', animationType: 'arrow' },
    { id: 'ra2', name: 'Volley',       description: 'Arrow rain — 200% damage total.',          mpCost: 18, cooldown: 3, type: 'attack', multiplier: 2.0, statScale: 'dex', animationType: 'arrow' },
    { id: 'ra3', name: 'Hunter Mark',  description: 'Marks target; next hit deals +50% dmg.',  mpCost: 20, cooldown: 4, type: 'debuff', multiplier: 0,   statScale: 'int', animationType: 'arrow' },
    { id: 'ra4', name: 'Eagle Eye',    description: 'Snipe — 280% damage with no miss.',        mpCost: 35, cooldown: 7, type: 'attack', multiplier: 2.8, statScale: 'dex', animationType: 'arrow' },
  ],
};

// ── Zone 1: Verdant Forest (floors 1-10) ──────────────────────────────────────
const ZONE1_ENEMIES: EnemyType[] = [
  { name: 'Slime',         sprite: '🟢', hpMod: 0.7,  atkMod: 0.4,  defMod: 0.3 },
  { name: 'Goblin',        sprite: '👺', hpMod: 0.9,  atkMod: 0.9,  defMod: 0.7, specialMove: 'Sneak Attack',   moveDesc: 'lunges from the shadows!' },
  { name: 'Giant Spider',  sprite: '🕷️', hpMod: 0.8,  atkMod: 1.1,  defMod: 0.5, specialMove: 'Venomous Bite',  moveDesc: 'injects venom for extra damage!' },
  { name: 'Forest Wolf',   sprite: '🐺', hpMod: 0.9,  atkMod: 1.3,  defMod: 0.5, specialMove: 'Pack Howl',      moveDesc: 'howls and strikes twice!' },
  { name: 'Forest Witch',  sprite: '🧙‍♀️', hpMod: 0.7,  atkMod: 1.5,  defMod: 0.4, specialMove: 'Hex Bolt',       moveDesc: 'hurls a cursed bolt!' },
  { name: 'Treant Sapling',sprite: '🌿', hpMod: 1.4,  atkMod: 0.7,  defMod: 1.2, specialMove: 'Root Slam',      moveDesc: 'slams you with ancient roots!' },
];

// ── Zone 2: Cursed Dungeon (floors 11-20) ─────────────────────────────────────
const ZONE2_ENEMIES: EnemyType[] = [
  { name: 'Skeleton',      sprite: '💀', hpMod: 1.0,  atkMod: 1.2,  defMod: 1.0, specialMove: 'Bone Shatter',   moveDesc: 'hurls razor-sharp bones!' },
  { name: 'Zombie',        sprite: '🧟', hpMod: 1.6,  atkMod: 0.7,  defMod: 1.3, specialMove: 'Rotten Grasp',   moveDesc: 'grabs and drains your energy!' },
  { name: 'Dark Cultist',  sprite: '🕯️', hpMod: 0.8,  atkMod: 1.7,  defMod: 0.5, specialMove: 'Dark Ritual',    moveDesc: 'channels dark energy for massive damage!' },
  { name: 'Banshee',       sprite: '👻', hpMod: 0.9,  atkMod: 1.5,  defMod: 0.6, specialMove: 'Death Wail',     moveDesc: 'unleashes a soul-rending scream!' },
  { name: 'Vampire',       sprite: '🧛', hpMod: 1.1,  atkMod: 1.4,  defMod: 0.9, specialMove: 'Blood Drain',    moveDesc: 'drains your blood, healing itself!' },
  { name: 'Dark Knight',   sprite: '🗡️', hpMod: 1.3,  atkMod: 1.3,  defMod: 1.4, specialMove: 'Void Cleave',    moveDesc: 'cleaves through your defenses!' },
];

// ── Zone 3: Volcanic Wastes (floors 21-30) ────────────────────────────────────
const ZONE3_ENEMIES: EnemyType[] = [
  { name: 'Fire Elemental',sprite: '🔥', hpMod: 1.3,  atkMod: 2.0,  defMod: 1.0, specialMove: 'Inferno Burst',  moveDesc: 'erupts in a column of flame!' },
  { name: 'Lava Golem',    sprite: '🗿', hpMod: 2.0,  atkMod: 1.3,  defMod: 2.2, specialMove: 'Magma Fist',     moveDesc: 'slams with molten fists!' },
  { name: 'Hell Hound',    sprite: '🐕', hpMod: 1.2,  atkMod: 2.2,  defMod: 0.8, specialMove: 'Flame Charge',   moveDesc: 'charges at blazing speed!' },
  { name: 'Imp',           sprite: '😈', hpMod: 0.9,  atkMod: 2.0,  defMod: 0.7, specialMove: 'Chaos Bolt',     moveDesc: 'launches a chaotic energy bolt!' },
  { name: 'Ash Drake',     sprite: '🦎', hpMod: 1.8,  atkMod: 1.8,  defMod: 1.5, specialMove: 'Ash Breath',     moveDesc: 'breathes choking ash clouds!' },
  { name: 'Molten Demon',  sprite: '🌋', hpMod: 1.6,  atkMod: 2.3,  defMod: 1.2, specialMove: 'Eruption',       moveDesc: 'triggers a volcanic eruption!' },
];

// ── Zone 4: Dark Realm (floors 31+) ───────────────────────────────────────────
const ZONE4_ENEMIES: EnemyType[] = [
  { name: 'Shadow Wraith', sprite: '🌑', hpMod: 1.8,  atkMod: 2.6,  defMod: 1.8, specialMove: 'Soul Rend',      moveDesc: 'tears at your very soul!' },
  { name: 'Void Stalker',  sprite: '🕳️', hpMod: 1.5,  atkMod: 3.0,  defMod: 1.5, specialMove: 'Phase Strike',   moveDesc: 'phases through your armor!' },
  { name: 'Ancient Drake', sprite: '🐲', hpMod: 2.8,  atkMod: 2.2,  defMod: 2.5, specialMove: 'Dragon Breath',  moveDesc: 'bathes you in ancient flame!' },
  { name: 'Lich Mage',     sprite: '🧿', hpMod: 1.6,  atkMod: 3.2,  defMod: 1.2, specialMove: 'Death Coil',     moveDesc: 'launches a coil of pure death!' },
  { name: 'Abyss Titan',   sprite: '⚫', hpMod: 3.5,  atkMod: 2.0,  defMod: 3.0, specialMove: 'Gravity Crush',  moveDesc: 'crushes you with void gravity!' },
  { name: 'Chaos Serpent', sprite: '🐍', hpMod: 2.2,  atkMod: 2.8,  defMod: 1.8, specialMove: 'Chaos Venom',    moveDesc: 'injects reality-warping venom!' },
];

// ── Named Zone Bosses ──────────────────────────────────────────────────────────
export const ZONE_BOSSES: Record<number, BossData> = {
  10:  { name: 'Gorgoth the Thornlord',  title: 'Ancient Treant King',        sprite: '🌳', hpMod: 3.5,  atkMod: 2.0, defMod: 2.5, specialMove: 'Strangling Vines',  moveDesc: 'ensnares you in razor-sharp vines for massive damage!',   deathCry: 'The ancient forest weeps as Gorgoth crumbles to dust...' },
  20:  { name: 'Lord Vexor the Undying', title: 'Lich King of the Dungeon',   sprite: '💀', hpMod: 4.0,  atkMod: 2.5, defMod: 2.0, specialMove: 'Death Nova',        moveDesc: 'releases an explosion of death magic in all directions!',  deathCry: '"I cannot die... I am eternal..." Vexor dissolves into ash.' },
  30:  { name: 'Infernos the Tyrant',    title: 'Dragon Lord of the Volcano', sprite: '🐉', hpMod: 5.0,  atkMod: 3.0, defMod: 2.8, specialMove: 'Apocalypse Flame',  moveDesc: 'unleashes a torrent of world-ending dragonfire!',          deathCry: 'INFERNOS ROARS... then falls silent. The volcano weeps.' },
  40:  { name: 'The Void Emperor',       title: 'Ruler of the Dark Realm',    sprite: '🌌', hpMod: 6.0,  atkMod: 3.5, defMod: 3.0, specialMove: 'Reality Collapse',  moveDesc: 'collapses reality itself, dealing catastrophic damage!',   deathCry: 'The Dark Realm shatters. You have done the impossible.' },
  50:  { name: 'Azathon the Eternal',    title: 'God of Darkness',            sprite: '☠️', hpMod: 8.0,  atkMod: 4.0, defMod: 3.5, specialMove: 'Oblivion Pulse',    moveDesc: 'emits a pulse of oblivion that tears through existence!',  deathCry: 'THE GOD OF DARKNESS FALLS. LEGEND SPEAKS YOUR NAME.' },
};

export const ENEMY_ZONES: Record<1|2|3|4, EnemyType[]> = {
  1: ZONE1_ENEMIES,
  2: ZONE2_ENEMIES,
  3: ZONE3_ENEMIES,
  4: ZONE4_ENEMIES,
};

export const ZONE_NAMES: Record<1|2|3|4, string> = {
  1: 'Verdant Forest',
  2: 'Cursed Dungeon',
  3: 'Volcanic Wastes',
  4: 'Dark Realm',
};

export const ZONE_BG: Record<1|2|3|4, string> = {
  1: 'bg-forest.png',
  2: 'bg-castle.png',
  3: 'bg-volcano.png',
  4: 'bg-castle.png',
};

export const getZone = (floor: number): 1|2|3|4 => Math.min(Math.ceil(floor / 10), 4) as 1|2|3|4;

export interface Enemy {
  id: string;
  name: string;
  title?: string;
  sprite: string;
  level: number;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  isBoss: boolean;
  specialMove?: string;
  moveDesc?: string;
  deathCry?: string;
  status: string[];
}

export const generateEnemy = (floor: number): Enemy => {
  const zone = getZone(floor);
  const isBoss = floor % 10 === 0;
  const bossKey = floor <= 50 ? (Math.floor(floor / 10) * 10) : 50;

  const level = floor;
  const baseHp  = 20 + level * 8;
  const baseAtk = 4  + level * 2;
  const baseDef = 2  + level * 1.5;

  if (isBoss) {
    const boss = ZONE_BOSSES[bossKey] ?? ZONE_BOSSES[50];
    return {
      id: uuidv4(),
      name: boss.name,
      title: boss.title,
      sprite: boss.sprite,
      level,
      maxHp: Math.floor(baseHp  * boss.hpMod),
      hp:    Math.floor(baseHp  * boss.hpMod),
      atk:   Math.floor(baseAtk * boss.atkMod),
      def:   Math.floor(baseDef * boss.defMod),
      isBoss: true,
      specialMove: boss.specialMove,
      moveDesc:    boss.moveDesc,
      deathCry:    boss.deathCry,
      status: [],
    };
  }

  const pool = ENEMY_ZONES[zone];
  const type = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: uuidv4(),
    name: type.name,
    sprite: type.sprite,
    level,
    maxHp: Math.floor(baseHp  * type.hpMod),
    hp:    Math.floor(baseHp  * type.hpMod),
    atk:   Math.floor(baseAtk * type.atkMod),
    def:   Math.floor(baseDef * type.defMod),
    isBoss: false,
    specialMove: type.specialMove,
    moveDesc:    type.moveDesc,
    status: [],
  };
};

// ── Item Generation ────────────────────────────────────────────────────────────
const WEAPON_NAMES   = ['Sword', 'Axe', 'Mace', 'Blade', 'Staff', 'Dagger', 'Scythe', 'Spear', 'Wand', 'Bow'];
const ARMOR_NAMES    = ['Chestplate', 'Mail', 'Robes', 'Tunic', 'Scale Armor', 'Plate'];
const HELMET_NAMES   = ['Helm', 'Crown', 'Hood', 'Circlet', 'Mask', 'Tiara'];
const ACCESS_NAMES   = ['Ring', 'Amulet', 'Pendant', 'Bracelet', 'Brooch', 'Talisman'];
const PREFIXES: Record<Rarity, string[]> = {
  Common:    ['Iron', 'Worn', 'Crude', 'Simple', 'Rusty'],
  Uncommon:  ['Steel', 'Sturdy', 'Polished', 'Carved', 'Reinforced'],
  Rare:      ['Enchanted', 'Mystic', 'Ancient', 'Rune-etched', 'Spectral'],
  Epic:      ['Shadow', 'Void', 'Crimson', 'Arcane', 'Abyssal', 'Blood-forged'],
  Legendary: ['Godforged', 'Eternal', 'Celestial', 'Soul-bound', 'Mythic', 'Primordial'],
};
const SUFFIXES = ['of Power', 'of the Dragon', 'of Shadows', 'of the Void', 'of Ruin', 'of the Storm', 'of the Fallen King', 'of Eternity'];

const ITEM_SPRITES: Record<ItemType, Record<Rarity, string>> = {
  Weapon:    { Common: '🗡️', Uncommon: '⚔️', Rare: '🔱', Epic: '🌑', Legendary: '⚡' },
  Armor:     { Common: '🛡️', Uncommon: '🛡️', Rare: '🔵', Epic: '🟣', Legendary: '🌟' },
  Helmet:    { Common: '⛑️', Uncommon: '🪖', Rare: '👑', Epic: '💎', Legendary: '✨' },
  Accessory: { Common: '💍', Uncommon: '📿', Rare: '💠', Epic: '🔮', Legendary: '🌙' },
  Potion:    { Common: '🧪', Uncommon: '🧪', Rare: '⚗️', Epic: '⚗️', Legendary: '✨' },
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const generateLoot = (floor: number): Item | null => {
  const dropChance = Math.min(0.6, 0.35 + floor * 0.005);
  if (Math.random() > dropChance) return null;

  const r = Math.random();
  let rarity: Rarity = 'Common';
  let mult = 1;
  if (r > 0.97)      { rarity = 'Legendary'; mult = 3.5; }
  else if (r > 0.88) { rarity = 'Epic';      mult = 2.2; }
  else if (r > 0.65) { rarity = 'Rare';      mult = 1.6; }
  else if (r > 0.35) { rarity = 'Uncommon';  mult = 1.2; }

  const types: ItemType[] = ['Weapon', 'Armor', 'Helmet', 'Accessory'];
  const type = types[Math.floor(Math.random() * types.length)];

  const namePool = type === 'Weapon' ? WEAPON_NAMES : type === 'Armor' ? ARMOR_NAMES : type === 'Helmet' ? HELMET_NAMES : ACCESS_NAMES;
  const prefix = pick(PREFIXES[rarity]);
  const base   = pick(namePool);
  const suffix = rarity === 'Epic' || rarity === 'Legendary' ? ` ${pick(SUFFIXES)}` : '';
  const name   = `${prefix} ${base}${suffix}`;

  const statBase = Math.max(1, Math.floor(floor * mult));
  return {
    id: uuidv4(),
    name,
    type,
    rarity,
    sprite: ITEM_SPRITES[type][rarity],
    stats: {
      atk: type === 'Weapon'                      ? statBase * 2 : 0,
      def: ['Armor', 'Helmet'].includes(type)     ? statBase * 2 : 0,
      hp:  statBase * 5,
      str: Math.floor(statBase / 2),
      vit: Math.floor(statBase / 2),
    },
    value: Math.floor(floor * 10 * mult),
    description: `${rarity} ${type.toLowerCase()} found on floor ${floor}.`,
  };
};

export const POTIONS: Item[] = [
  { id: 'p1', name: 'Minor Health Potion', type: 'Potion', rarity: 'Common',   sprite: '🧪', value: 20,  description: 'Restores 50 HP',  restore: { hp: 50  } },
  { id: 'p2', name: 'Health Potion',       type: 'Potion', rarity: 'Uncommon', sprite: '🧪', value: 50,  description: 'Restores 150 HP', restore: { hp: 150 } },
  { id: 'p3', name: 'Greater Health Pot.', type: 'Potion', rarity: 'Rare',     sprite: '⚗️', value: 120, description: 'Restores 400 HP', restore: { hp: 400 } },
  { id: 'p4', name: 'Minor Mana Potion',   type: 'Potion', rarity: 'Common',   sprite: '🧪', value: 20,  description: 'Restores 30 MP',  restore: { mp: 30  } },
  { id: 'p5', name: 'Mana Potion',         type: 'Potion', rarity: 'Uncommon', sprite: '🧪', value: 50,  description: 'Restores 80 MP',  restore: { mp: 80  } },
];
