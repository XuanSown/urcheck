import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';
import { z } from 'zod';

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

const routineSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().max(1000).optional().nullable(),
  isPublic: z.boolean().optional(),
  items: z.array(routineItemSchema).min(1, 'Routine phải có ít nhất 1 sản phẩm').max(MAX_ROUTINE_ITEMS),
});

export async function GET() {
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const routines = await prisma.routine.findMany({
    where: { customerId: guard.session.customerId },
    include: {
      items: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, routines });
}

export async function POST(request: Request) {
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const body = await request.json();
  const parsed = routineSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.format() },
      { status: 400 }
    );
  }

  const { title, description, isPublic, items } = parsed.data;

  const routine = await prisma.routine.create({
    data: {
      customerId: guard.session.customerId,
      title,
      description: description ?? null,
      isPublic: Boolean(isPublic),
      items: {
        create: items.map((item, idx) => ({
          productId: item.productId,
          productName: item.productName,
          brandName: item.brandName ?? null,
          imageUrl: item.imageUrl ?? null,
          timeOfDay: item.timeOfDay,
          order: item.order ?? idx,
          notes: item.notes ?? null,
        })),
      },
    },
    include: { items: { orderBy: [{ order: 'asc' }] } },
  });

  return NextResponse.json({ success: true, routine }, { status: 201 });
}
