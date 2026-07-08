import prisma from './db';

const BADGES = [
  {
    name: 'first_scan',
    descriptionVi: 'Quét lần đầu',
    descriptionEn: 'First scan',
    icon: '1️⃣',
    order: 1,
    criteriaJson: JSON.stringify({ type: 'scan_count', min: 1 }),
  },
  {
    name: 'ten_scans',
    descriptionVi: 'Quét 10 lần',
    descriptionEn: '10 scans',
    icon: '🔟',
    order: 2,
    criteriaJson: JSON.stringify({ type: 'scan_count', min: 10 }),
  },
  {
    name: 'fifty_scans',
    descriptionVi: 'Quét 50 lần',
    descriptionEn: '50 scans',
    icon: '⭐',
    order: 3,
    criteriaJson: JSON.stringify({ type: 'scan_count', min: 50 }),
  },
  {
    name: 'week_active',
    descriptionVi: 'Hoạt động 7 ngày',
    descriptionEn: '7 days active',
    icon: '📅',
    order: 4,
    criteriaJson: JSON.stringify({ type: 'active_days', min: 7 }),
  },
  {
    name: 'brand_explorer',
    descriptionVi: 'Khám phá 5 thương hiệu',
    descriptionEn: 'Explore 5 brands',
    icon: '🏷️',
    order: 5,
    criteriaJson: JSON.stringify({ type: 'brands_seen', min: 5 }),
  },
];

export async function seedBadges() {
  for (const b of BADGES) {
    const existing = await prisma.badge.findFirst({
      where: { name: b.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.badge.update({
        where: { id: existing.id },
        data: {
          descriptionVi: b.descriptionVi,
          descriptionEn: b.descriptionEn,
          icon: b.icon,
          criteriaJson: b.criteriaJson,
          order: b.order,
        },
      });
    } else {
      await prisma.badge.create({ data: b });
    }
  }
  console.log(`Seeded ${BADGES.length} badges`);
}

seedBadges()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
