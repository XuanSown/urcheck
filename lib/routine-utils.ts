export const TIME_ORDER = ['morning', 'afternoon', 'evening', 'night'] as const;
export type TimeOfDay = (typeof TIME_ORDER)[number];

export type RoutineItem = {
  id: string;
  productId: string;
  productName?: string | null;
  brandName?: string | null;
  imageUrl?: string | null;
  timeOfDay: string;
  order: number;
  notes?: string | null;
};

export type Routine = {
  id: string;
  title: string;
  description?: string | null;
  isPublic: boolean;
  shareToken?: string | null;
  items: RoutineItem[];
};

export function groupItemsByTimeOfDay(items: RoutineItem[]): Record<TimeOfDay, RoutineItem[]> {
  const groups = { morning: [], afternoon: [], evening: [], night: [] } as Record<TimeOfDay, RoutineItem[]>;
  for (const it of items) {
    const key = (TIME_ORDER as readonly string[]).includes(it.timeOfDay) ? (it.timeOfDay as TimeOfDay) : 'night';
    groups[key].push(it);
  }
  return groups;
}
