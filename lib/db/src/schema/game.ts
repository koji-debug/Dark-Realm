import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameSavesTable = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().unique(),
  playerName: text("player_name").notNull(),
  gameState: text("game_state").notNull(),
  level: integer("level").notNull().default(1),
  dungeonFloor: integer("dungeon_floor").notNull().default(1),
  totalKills: integer("total_kills").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameSaveSchema = createInsertSchema(gameSavesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSavesTable.$inferSelect;
