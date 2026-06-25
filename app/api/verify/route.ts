import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifySchema } from '@/lib/validators';
import { isBarcodeEnabled } from '@/lib/feature-flags';

export async function POST(request: NextRequest) {
  try {
    // Legacy barcode endpoint. Returns 503 while the feature flag is off so
    // the route is still discoverable but does not leak product data.
    if (!isBarcodeEnabled()) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Tính năng quét barcode đang được tắt tạm thời. Vui lòng sử dụng QR code.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate input
    const validated = verifySchema.parse(body);
    const barcode = validated.barcode.trim();

    // Find barcode in database
    const barcodeRecord = await prisma.barcode.findUnique({
      where: { code: barcode },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            sku: true,
            batchNumber: true,
            manufactureDate: true,
            expiryDate: true,
            imageUrl: true,
            companyName: true,
            companyAddress: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!barcodeRecord) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Mã vạch không tồn tại trong hệ thống',
        },
        { status: 404 }
      );
    }

    // Update scan count and last scanned
    await prisma.barcode.update({
      where: { id: barcodeRecord.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    });

    // Log the scan
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip');

    await prisma.scanLog.create({
      data: {
        barcode: barcode,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    const product = barcodeRecord.product;
    const isExpired = new Date(product.expiryDate) < new Date();
    const isValid = product.verified && !isExpired;

    return NextResponse.json({
      success: true,
      valid: isValid,
      product: {
        ...product,
        manufactureDate: product.manufactureDate.toISOString(),
        expiryDate: product.expiryDate.toISOString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      message: isValid
        ? 'Sản phẩm hợp lệ'
        : isExpired
        ? 'Sản phẩm đã hết hạn sử dụng'
        : 'Sản phẩm chưa được xác minh',
    });
  } catch (error) {
    console.error('Verify error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Validation error',
          message: 'Dữ liệu không hợp lệ',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: 'Internal server error',
        message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
      },
      { status: 500 }
    );
  }
}
