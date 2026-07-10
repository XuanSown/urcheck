export const TIME_ORDER = ['morning', 'afternoon', 'evening', 'night'] as const;
export type TimeOfDay = (typeof TIME_ORDER)[number];

export function groupItemsByTimeOfDay(items: any[]): Record<TimeOfDay, any[]> {
  const groups = { morning: [], afternoon: [], evening: [], night: [] } as Record<TimeOfDay, any[]>;
  for (const it of items) {
    const key = (TIME_ORDER as readonly string[]).includes(it.timeOfDay) ? (it.timeOfDay as TimeOfDay) : 'night';
    groups[key].push(it);
  }
  return groups;
}
