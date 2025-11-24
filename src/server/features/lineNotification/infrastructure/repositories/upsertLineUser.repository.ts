import { db } from "@/db";
import { lineUsers } from "@/db/schema";
import type { LineUserEntity } from "../../domain/entities/lineUser";

/**
 * LINEユーザーをUPSERTする関数の型定義
 */
export type UpsertLineUser = (entity: LineUserEntity) => Promise<void>;

export const upsertLineUser: UpsertLineUser = async (entity) => {
  await db
    .insert(lineUsers)
    .values({
      lineUserId: entity.lineUserId,
      displayName: entity.displayName,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: lineUsers.lineUserId,
      set: {
        displayName: entity.displayName,
        updatedAt: new Date(),
      },
    });
};
