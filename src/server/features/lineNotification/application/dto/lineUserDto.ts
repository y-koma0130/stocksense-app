import type { LineUserEntity } from "../../domain/entities/lineUser";

/**
 * LINE通知設定のDTO
 */
export type LineUserSettingsDto = {
  lineUserId: string;
  displayName: string | null;
  notificationEnabled: boolean;
};

/**
 * エンティティからDTOに変換
 */
export const toLineUserSettingsDto = (entity: LineUserEntity): LineUserSettingsDto => {
  return {
    lineUserId: entity.lineUserId,
    displayName: entity.displayName,
    notificationEnabled: entity.notificationEnabled,
  };
};
