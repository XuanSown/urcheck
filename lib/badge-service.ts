import prisma from './db';

export type BadgeWithEarned = {
  id: string;
  name: string;
  descriptionVi: string;
  descriptionEn: string;
  icon: string;
  order: number;
  earnedAt: string | null;
};

type Criteria = { type: string; min: number };

function localDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function evaluateCustomerBadges(customerId: string): Promise<BadgeWithEarned[]> {
  const badges = await prisma.badge.findMany({ orderBy: { order: 'asc' } });

  const scanLogs = await prisma.scanLog.findMany({
    where: { customerId },
    select: { scannedAt: true, qrCodeId: true },
    orderBy: { scannedAt: 'asc' },
  });

  const qrIds = scanLogs.map((l) => l.qrCodeId).filter(Boolean);
  const qrRecords = qrIds.length
    ? await prisma.qrCode.findMany({
        where: { id: { in: qrIds } },
        select: { code: true, product: { select: { brandName: true } } },
      })
    : [];

  const totalScans = scanLogs.length;
  const brands = new Set(qrRecords.map((r) => r.product?.brandName).filter(Boolean));
  const uniqueDays = new Set(scanLogs.map((l) => localDate(new Date(l.scannedAt)))).size;

  const earnedBadges = await prisma.customerBadge.findMany({
    where: { customerId },
    include: { badge: true },
  });

  const earnedByBadgeId = new Map(earnedBadges.map((cb) => [cb.badgeId, cb.earnedAt]));
  const createdIds: string[] = [];

  for (const badge of badges) {
    let criteria: Criteria;
    try {
      criteria = JSON.parse(JSON.stringify(badge.criteriaJson));
    } catch {
      console.error(`Badge ${badge.id} has invalid criteriaJson`);
      continue;
    }
    if (typeof criteria.type !== 'string' || typeof criteria.min !== 'number') {
      console.error(`Badge ${badge.id} has malformed criteria`);
      continue;
    }

    const { type, min } = criteria;
    let met = false;
    if (type === 'scan_count') met = totalScans >= min;
    else if (type === 'active_days') met = uniqueDays >= min;
    else if (type === 'brands_seen') met = brands.size >= min;
    else console.warn(`Unknown badge type: ${type}`);

    if (met && !earnedByBadgeId.has(badge.id)) {
      createdIds.push(badge.id);
    }
  }

  if (createdIds.length > 0) {
    await prisma.customerBadge.createMany({
      data: createdIds.map((badgeId) => ({ customerId, badgeId })),
      skipDuplicates: true,
    });

    const earnedNow = await prisma.customerBadge.findMany({
      where: { customerId, badgeId: { in: createdIds } },
      select: { badgeId: true, earnedAt: true },
    });
    for (const e of earnedNow) {
      earnedByBadgeId.set(e.badgeId, e.earnedAt);
    }
  }

  return badges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    descriptionVi: badge.descriptionVi,
    descriptionEn: badge.descriptionEn,
    icon: badge.icon,
    order: badge.order,
    earnedAt: earnedByBadgeId.get(badge.id)?.toISOString() ?? null,
  }));
}

export async function getBadgesForCustomer(customerId: string, locale: string = 'vi') {
  const badges = await evaluateCustomerBadges(customerId);
  return badges.map((b) => ({
    ...b,
    description: locale === 'en' ? b.descriptionEn : b.descriptionVi,
  }));
}
