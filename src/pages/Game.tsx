import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { PlayerSidebar } from '@/components/game/PlayerSidebar';
import { CombatPanel } from '@/components/game/CombatPanel';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { CombatLogPanel } from '@/components/game/CombatLogPanel';
import { useCloudSave } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { LogOut, Save } from 'lucide-react';
import { useLocation } from 'wouter';

export default function GamePage() {
  const { player, combat } = useGameStore();
  const [, setLocation] = useLocation();
  const saveMutation = useCloudSave();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');

  useEffect(() => {
    if (!player) setLocation('/');
  }, [player]);

  if (!player) return null;

  return (
    <div className="h-screen w-full flex flex-col p-2 md:p-4 gap-4 max-w-[1600px] mx-auto">
      
      {/* Top Bar */}
      <header className="flex justify-between items-center px-4 py-2 panel-border rounded-xl shrink-0">
        <h1 className="text-2xl font-display text-accent text-glow tracking-widest">DARK REALM</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="border-accent text-accent hover:bg-accent hover:text-black"
          >
            <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Game'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left: Player Sidebar */}
        <PlayerSidebar />

        {/* Center: Main View (Combat/Explore) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-h-0">
            <CombatPanel />
          </div>
          <div className="h-48 shrink-0">
            <CombatLogPanel />
          </div>
        </div>

        {/* Right: Sub-panels (Inventory/Shop) */}
        <div className="w-80 lg:w-[400px] shrink-0 h-full flex flex-col min-h-0">
          <div className="flex gap-2 mb-2 shrink-0">
            <Button 
              variant={activeTab === 'inventory' ? 'default' : 'outline'} 
              className={activeTab === 'inventory' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-zinc-800 text-zinc-400'}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </Button>
            <Button 
              variant={activeTab === 'shop' ? 'default' : 'outline'} 
              className={activeTab === 'shop' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-zinc-800 text-zinc-400'}
              onClick={() => setActiveTab('shop')}
              disabled={combat.inCombat}
            >
              Merchant
            </Button>
          </div>
          
          <div className="flex-1 min-h-0">
            {activeTab === 'inventory' && <InventoryPanel />}
            {activeTab === 'shop' && (
              <div className="panel-border rounded-xl p-8 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <p>The merchant only appears between battles.</p>
                <p className="text-xs mt-2">(Shop system stubbed for brevity)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
