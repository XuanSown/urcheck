import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';
import { z } from 'zod';
import { primaryImageUrl } from '@/lib/product-utils';

type RoutineItemWithProduct = Prisma.RoutineItemGetPayload<{
  include: {
    product: {
      include: { images: { where: { isPrimary: true }; take: 1; select: { url: true; isPrimary: true } } };
    };
  };
}>;

function mapRoutineItem(item: RoutineItemWithProduct) {
  return {
    ...item,
    productName: item.product?.name ?? '',
    brandName: item.product?.brandName ?? null,
    imageUrl: primaryImageUrl(item.product?.images) ?? null,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const routine = await prisma.routine.findFirst({
    where: { id, customerId: guard.session.customerId },
    include: {
      items: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy routine' }, { status: 404 });
  }

  const mapped = { ...routine, items: routine.items.map(mapRoutineItem) };
  return NextResponse.json({ success: true, routine: mapped });
}

const ALLOWED_TIME_OF_DAY = ['morning', 'afternoon', 'evening', 'night'] as const;
const MAX_ROUTINE_ITEMS = 20;

const routineItemSchema = z.object({
  productId: z.string().min(1, 'productId không được để trống'),
  productName: z.string().min(1, 'productName không được để trống').max(200),
  brandName: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url('imageUrl không hợp lệ').max(500).optional().nullable(),
  timeOfDay: z.enum(ALLOWED_TIME_OF_DAY).default('night'),
  order: z.number().int().nonnegative().optional(),
  notes: z.string().max(500).optional().nullable(),
});

const routineUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  isPublic: z.boolean().optional(),
  items: z.array(routineItemSchema).min(1).max(MAX_ROUTINE_ITEMS).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const existing = await prisma.routine.findFirst({
    where: { id, customerId: guard.session.customerId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy routine' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = routineUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.format() },
      { status: 400 }
    );
  }

  const { title, description, isPublic, items } = parsed.data;
  const data: Record<string, unknown> = {};

  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() ?? null;
  if (isPublic !== undefined) data.isPublic = isPublic;

  if (items) {
    // Validate all productIds exist and are PUBLISHED
    const productIds = items.map((item) => item.productId);
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'PUBLISHED' },
      select: { id: true },
    });
    const validIds = new Set(validProducts.map((p) => p.id));
    const invalidIds = productIds.filter((id) => !validIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: `Sản phẩm không hợp lệ: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    await prisma.routineItem.deleteMany({ where: { routineId: id } });
    data.items = {
      create: items.map((item, idx) => ({
        productId: item.productId,
        timeOfDay: item.timeOfDay,
        order: item.order ?? idx,
        notes: item.notes ?? null,
      })),
    };
  }

  const routine = await prisma.routine.update({
    where: { id },
    data,
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } } } } },
      },
    },
  });

  const mapped = { ...routine, items: routine.items.map(mapRoutineItem) };
  return NextResponse.json({ success: true, routine: mapped });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const existing = await prisma.routine.findFirst({
    where: { id, customerId: guard.session.customerId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy routine' }, { status: 404 });
  }

  await prisma.routine.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
