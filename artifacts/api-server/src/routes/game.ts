import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gameSavesTable } from "@workspace/db";
import { SaveGameBody, LoadGameQueryParams } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/save", async (req, res) => {
  const parsed = SaveGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { playerId, playerName, gameState } = parsed.data;

  let level = 1;
  let dungeonFloor = 1;
  let totalKills = 0;

  try {
    const state = JSON.parse(gameState);
    level = state.player?.level ?? 1;
    dungeonFloor = state.dungeonFloor ?? 1;
    totalKills = state.totalKills ?? 0;
  } catch {
    // use defaults if parse fails
  }

  await db
    .insert(gameSavesTable)
    .values({ playerId, playerName, gameState, level, dungeonFloor, totalKills })
    .onConflictDoUpdate({
      target: gameSavesTable.playerId,
      set: {
        playerName,
        gameState,
        level,
        dungeonFloor,
        totalKills,
        updatedAt: new Date(),
      },
    });

  res.json({ success: true, savedAt: new Date().toISOString() });
});

router.get("/load", async (req, res) => {
  const parsed = LoadGameQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing playerId" });
    return;
  }

  const { playerId } = parsed.data;
  const rows = await db
    .select()
    .from(gameSavesTable)
    .where(eq(gameSavesTable.playerId, playerId))
    .limit(1);

  if (rows.length === 0) {
    res.json({ found: false });
    return;
  }

  const row = rows[0];
  res.json({
    found: true,
    playerName: row.playerName,
    gameState: row.gameState,
    savedAt: row.updatedAt.toISOString(),
  });
});

router.get("/leaderboard", async (_req, res) => {
  const rows = await db
    .select()
    .from(gameSavesTable)
    .orderBy(desc(gameSavesTable.dungeonFloor), desc(gameSavesTable.level), desc(gameSavesTable.totalKills))
    .limit(10);

  const entries = rows.map((row, i) => ({
    rank: i + 1,
    playerName: row.playerName,
    level: row.level,
    dungeonFloor: row.dungeonFloor,
    totalKills: row.totalKills,
  }));

  res.json({ entries });
});

export default router;
