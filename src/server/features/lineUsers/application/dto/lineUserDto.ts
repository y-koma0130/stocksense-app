import { z } from "zod";
import type { LineUserEntity } from "../../domain/entities/lineUser";

/**
 * LINE通知設定DTOスキーマ
 */
export const LineUserSettingsDtoSchema = z.object({
  lineUserId: z.string(),
  displayName: z.string().nullable(),
  notificationEnabled: z.boolean(),
});

export type LineUserSettingsDto = z.infer<typeof LineUserSettingsDtoSchema>;

/**
 * エンティティからDTOに変換
 */
export const toLineUserSettingsDto = (entity: LineUserEntity): LineUserSettingsDto => {
  return LineUserSettingsDtoSchema.parse({
    lineUserId: entity.lineUserId,
    displayName: entity.displayName,
    notificationEnabled: entity.notificationEnabled,
  });
};
