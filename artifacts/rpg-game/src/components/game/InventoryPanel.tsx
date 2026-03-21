import React from 'react';
import { useGameStore } from '@/lib/game-store';
import { Item } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Backpack, Sword, Box } from 'lucide-react';

const RARITY_COLORS: Record<string, string> = {
  Common:    'border-zinc-600 text-zinc-300',
  Uncommon:  'border-green-600 text-green-400',
  Rare:      'border-blue-500 text-blue-400 shadow-[0_0_8px_rgba(0,80,255,0.25)]',
  Epic:      'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(140,0,255,0.35)]',
  Legendary: 'border-orange-400 text-orange-300 shadow-[0_0_16px_rgba(255,140,0,0.55)]',
};

const RARITY_BADGE: Record<string, string> = {
  Common:    'bg-zinc-700 text-zinc-300',
  Uncommon:  'bg-green-900 text-green-400',
  Rare:      'bg-blue-950 text-blue-400',
  Epic:      'bg-purple-950 text-purple-400',
  Legendary: 'bg-orange-950 text-orange-300',
};

function ItemCard({ item, action, actionLabel }: { item: Item; action: (i: Item) => void; actionLabel: string }) {
  return (
    <div className={cn(
      'p-3 rounded-lg border bg-card flex flex-col gap-2 relative group overflow-hidden transition-all hover:scale-[1.02] cursor-default',
      RARITY_COLORS[item.rarity],
    )}>
      {/* Sprite + rarity badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none">{item.sprite ?? '📦'}</span>
        <span className={cn('text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded', RARITY_BADGE[item.rarity])}>
          {item.rarity}
        </span>
      </div>

      {/* Name */}
      <h4 className="font-bold text-sm leading-tight">{item.name}</h4>

      {/* Stats */}
      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 min-h-[18px]">
        {item.stats && Object.entries(item.stats).filter(([, v]) => v && v > 0).map(([k, v]) => (
          <span key={k} className="uppercase"><span className="text-foreground font-semibold">+{v}</span> {k}</span>
        ))}
        {item.restore && Object.entries(item.restore).map(([k, v]) => (
          <span key={k} className="text-green-400 uppercase"><span className="font-semibold">+{v}</span> {k}</span>
        ))}
      </div>

      <Button
        size="sm"
        variant="secondary"
        className="w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
        onClick={() => action(item)}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

const SLOT_SPRITE: Record<string, string> = {
  Weapon: '⚔️', Armor: '🛡️', Helmet: '⛑️', Accessory: '💍',
};

export function InventoryPanel() {
  const { inventory, equipment, equip, unequip, useItem, combat } = useGameStore();

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* Equipment Slots */}
      <div className="panel-border rounded-xl p-3 shrink-0">
        <h3 className="font-display text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Sword className="h-3.5 w-3.5" /> Equipped
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(equipment) as [keyof typeof equipment, Item | null][]).map(([slot, item]) => (
            <div
              key={slot}
              className={cn(
                'border rounded-lg p-2 flex flex-col min-h-[80px] justify-between bg-zinc-900/60',
                item ? RARITY_COLORS[item.rarity] : 'border-zinc-800',
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{SLOT_SPRITE[slot]}</span>
                <span className="text-[9px] uppercase text-zinc-500 font-bold">{slot}</span>
              </div>
              {item ? (
                <>
                  <span className={cn('text-xs font-semibold leading-tight', RARITY_COLORS[item.rarity].split(' ')[1])}>
                    {item.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 mt-1 text-[10px]"
                    onClick={() => unequip(slot)}
                    disabled={combat.inCombat}
                  >
                    Unequip
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-20">
                  <Box className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bag */}
      <div className="panel-border rounded-xl p-3 flex-1 flex flex-col min-h-0">
        <h3 className="font-display text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 shrink-0">
          <Backpack className="h-3.5 w-3.5" /> Bag ({inventory.length}/50)
        </h3>

        <div className="flex-1 overflow-y-auto scrollbar-hidden pr-1">
          {inventory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 gap-2">
              <Box className="h-10 w-10" />
              <p className="text-sm">Your bag is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 pb-4">
              {inventory.map((item, idx) => (
                <ItemCard
                  key={item.id + idx}
                  item={item}
                  action={item.type === 'Potion' ? useItem : equip}
                  actionLabel={item.type === 'Potion' ? '🧪 Use' : '⚔️ Equip'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
