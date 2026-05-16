export type NotificationType = 'Placement' | 'Result' | 'Event';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export const TYPE_WEIGHTS: Record<NotificationType, number> = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};
