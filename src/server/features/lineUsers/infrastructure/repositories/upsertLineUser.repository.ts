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
      userId: entity.userId,
      displayName: entity.displayName,
      notificationEnabled: entity.notificationEnabled ? 1 : 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: lineUsers.lineUserId,
      set: {
        userId: entity.userId,
        displayName: entity.displayName,
        notificationEnabled: entity.notificationEnabled ? 1 : 0,
        updatedAt: new Date(),
      },
    });
};
