import React from 'react';
import { useGameStore } from '@/lib/game-store';
import { Item } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Backpack, Shield, Sword, Box, Droplet } from 'lucide-react';

const RARITY_COLORS = {
  Common: 'border-zinc-600 text-zinc-400',
  Uncommon: 'border-green-600 shadow-[0_0_5px_rgba(0,255,0,0.2)] text-green-400',
  Rare: 'border-blue-500 shadow-[0_0_8px_rgba(0,100,255,0.3)] text-blue-400',
  Epic: 'border-purple-500 shadow-[0_0_10px_rgba(150,0,255,0.4)] text-purple-400',
  Legendary: 'border-orange-500 shadow-[0_0_15px_rgba(255,150,0,0.6)] text-orange-400',
};

function ItemCard({ item, action, actionLabel }: { item: Item, action: (i: Item) => void, actionLabel: string }) {
  return (
    <div className={cn("p-3 rounded-lg border bg-card flex flex-col gap-2 relative group overflow-hidden transition-all hover:scale-[1.02]", RARITY_COLORS[item.rarity])}>
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm leading-tight pr-4">{item.name}</h4>
        {item.type === 'Potion' ? <Droplet className="h-4 w-4 opacity-50 absolute top-2 right-2" /> : <Shield className="h-4 w-4 opacity-50 absolute top-2 right-2" />}
      </div>
      
      <div className="text-xs text-muted-foreground min-h-[32px]">
        {item.stats && Object.entries(item.stats).filter(([_,v])=>v>0).map(([k,v]) => (
          <span key={k} className="mr-2 uppercase inline-block"><span className="text-foreground">+{v}</span> {k}</span>
        ))}
        {item.restore && Object.entries(item.restore).map(([k,v]) => (
          <span key={k} className="mr-2 uppercase inline-block text-green-400">+{v} {k}</span>
        ))}
      </div>
      
      <Button 
        size="sm" 
        variant="secondary" 
        className="w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => action(item)}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export function InventoryPanel() {
  const { inventory, equipment, equip, unequip, useItem, combat } = useGameStore();

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      
      {/* Equipment Slots */}
      <div className="panel-border rounded-xl p-4 shrink-0">
        <h3 className="font-display text-sm text-muted-foreground uppercase mb-3 flex items-center gap-2"><Sword className="h-4 w-4"/> Equipment</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(equipment) as [keyof typeof equipment, Item | null][]).map(([slot, item]) => (
            <div key={slot} className="border border-zinc-800 bg-zinc-900/50 rounded-lg p-3 relative flex flex-col min-h-[100px] justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">{slot}</span>
              {item ? (
                <>
                  <span className={cn("text-sm font-bold leading-tight", RARITY_COLORS[item.rarity].split(' ')[2])}>{item.name}</span>
                  <Button size="sm" variant="ghost" className="h-6 mt-2 text-xs" onClick={() => unequip(slot)} disabled={combat.inCombat}>Unequip</Button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-20">
                  <Box className="h-8 w-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bag */}
      <div className="panel-border rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <h3 className="font-display text-sm text-muted-foreground uppercase mb-3 flex items-center gap-2"><Backpack className="h-4 w-4"/> Bag ({inventory.length}/50)</h3>
        
        <div className="flex-1 overflow-y-auto scrollbar-hidden pr-2">
          {inventory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <Box className="h-12 w-12 mb-2" />
              <p>Your bag is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
              {inventory.map((item, idx) => (
                <ItemCard 
                  key={item.id + idx} 
                  item={item} 
                  action={item.type === 'Potion' ? useItem : equip}
                  actionLabel={item.type === 'Potion' ? 'Use' : 'Equip'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
