export const TYPES = {
  WARNING: 'warning' as const,
  HINT: 'hint' as const,
} as const;

export type MessageType = typeof TYPES[keyof typeof TYPES];
