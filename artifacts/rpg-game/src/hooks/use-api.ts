import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameStore } from "@/lib/game-store";
import { useToast } from "@/hooks/use-toast";
// Import simulated generated hooks matching the swagger spec
import { 
  saveGame, 
  loadGame, 
  getLeaderboard 
} from "@workspace/api-client-react";

export function useCloudSave() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const state = useGameStore.getState();
      if (!state.player) throw new Error("No active game to save");
      
      return saveGame({
        playerId: state.player.id,
        playerName: state.player.name,
        gameState: JSON.stringify(state)
      });
    },
    onSuccess: () => {
      toast({
        title: "Game Saved",
        description: "Your progress has been backed up to the dark realm.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to reach the realm servers.",
        variant: "destructive"
      });
    }
  });
}

export function useCloudLoad() {
  const loadState = useGameStore(s => s.loadState);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (playerId: string) => {
      const res = await loadGame({ playerId });
      if (!res.found || !res.gameState) {
        throw new Error("Save file not found");
      }
      return JSON.parse(res.gameState);
    },
    onSuccess: (data) => {
      loadState(data);
      toast({
        title: "Game Loaded",
        description: "Welcome back to the Dark Realm.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Load Failed",
        description: error.message || "Could not find your soul.",
        variant: "destructive"
      });
    }
  });
}

export function useGameLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
         const res = await getLeaderboard();
         return res.entries;
      } catch (e) {
         // Fallback if backend is missing
         return [
           { rank: 1, playerName: "ShadowSlayer", level: 99, dungeonFloor: 250, totalKills: 15420 },
           { rank: 2, playerName: "DarkMage", level: 85, dungeonFloor: 210, totalKills: 9000 },
           { rank: 3, playerName: "NoobMaster", level: 12, dungeonFloor: 15, totalKills: 420 },
         ];
      }
    },
    staleTime: 60000, // 1 min
  });
}
