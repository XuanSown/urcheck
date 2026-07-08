import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ shareToken: string }> }
) {
	const { shareToken } = await params;
	const routine = await prisma.routine.findFirst({
		where: { shareToken, isPublic: true },
		include: { items: { orderBy: { order: 'asc' } } },
	});

	if (!routine) {
		return NextResponse.json(
			{ success: false, message: 'Không tìm thấy lịch trình' },
			{ status: 404 }
		);
	}

	const { id, customerId, title, description, isPublic, createdAt, updatedAt, items } =
		routine as Record<string, unknown>;
	return NextResponse.json({
		success: true,
		routine: { id, customerId, title, description, isPublic, createdAt, updatedAt, items },
	});
}
