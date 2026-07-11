import { NextRequest, NextResponse } from 'next/server';
import type { RoutineItem } from '@prisma/client';
import prisma from '@/lib/db';
import { primaryImageUrl } from '@/lib/product-utils';

type ShareRoutineItem = RoutineItem & {
  product: { name: string; brandName: string | null; images: { url: string }[] } | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const routine = await prisma.routine.findFirst({
    where: { shareToken, isPublic: true },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy lịch trình' },
      { status: 404 }
    );
  }

  const items = routine.items.map((it: ShareRoutineItem) => ({
    id: it.id,
    productId: it.productId,
    timeOfDay: it.timeOfDay,
    order: it.order,
    notes: it.notes,
    productName: it.product?.name ?? '',
    brandName: it.product?.brandName ?? null,
    imageUrl: primaryImageUrl(it.product?.images),
  }));

  const { customerId, ...rest } = routine as Record<string, unknown>;
  void customerId;
  return NextResponse.json({
    success: true,
    routine: { ...rest, items },
  });
}
