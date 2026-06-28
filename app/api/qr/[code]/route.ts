import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isQrEnabled } from '@/lib/feature-flags';
import { extractQrCode } from '@/lib/qr-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    if (!isQrEnabled()) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Tính năng QR đang tạm tắt',
        },
        { status: 503 }
      );
    }

    const { code: rawCode } = await params;
    const code = extractQrCode(rawCode);

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Mã QR không hợp lệ',
        },
        { status: 400 }
      );
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { code },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,

            manufactureDate: true,
            expiryDate: true,
            imageUrl: true,
            brandName: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            skinType: true,
            suitableFor: true,
            usages: true,
            usageInstructions: true,
            ingredientAnalysis: true,
            tags: true,
            status: true,
            purchaseLinks: true,
            images: {
              orderBy: [
                { isPrimary: 'desc' },
                { sortOrder: 'asc' }
              ],
              select: { id: true, url: true, isPrimary: true, altText: true }
            }
          },
        },
      },
    });

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Mã QR không tồn tại trong hệ thống',
        },
        { status: 404 }
      );
    }

    if (qrCode.product.status === 'ARCHIVED') {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Sản phẩm không tồn tại hoặc đã bị ẩn',
        },
        { status: 404 }
      );
    }

    // Best-effort scan tracking (do not fail the response if it errors)
    try {
      const userAgent = request.headers.get('user-agent');
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-real-ip');

      await prisma.$transaction([
        prisma.qrCode.update({
          where: { id: qrCode.id },
          data: {
            scanCount: { increment: 1 },
            lastScannedAt: new Date(),
          },
        }),
      ]);
      await prisma.scanLog.create({
        data: {
          qrCode: `QR:${qrCode.code}`,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        },
      });
    } catch (trackErr) {
      console.warn('QR scan tracking failed:', trackErr);
    }

    const product = qrCode.product;
    const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
    const isValid = product.verified && !isExpired;

    return NextResponse.json({
      success: true,
      valid: isValid,
      qrCode: {
        id: qrCode.id,
        code: qrCode.code,
        url: qrCode.url,

        scanCount: qrCode.scanCount,
        lastScannedAt: qrCode.lastScannedAt?.toISOString() ?? null,
        isActive: qrCode.isActive,
      },
      product: {
        id: product.id,
        name: product.name,
        description: product.description,

        manufactureDate: product.manufactureDate ? product.manufactureDate.toISOString() : null,
        expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
        imageUrl: (product as any).images?.[0]?.url || product.imageUrl,
        brandName: product.brandName,
        verified: product.verified,
        skinType: product.skinType,
        suitableFor: product.suitableFor,
        usages: product.usages,
        usageInstructions: product.usageInstructions,
        ingredientAnalysis: product.ingredientAnalysis,
        tags: product.tags,
        purchaseLinks: product.purchaseLinks,
        images: product.images,
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
    console.error('GET /api/qr/[code] error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Đã xảy ra lỗi, vui lòng thử lại',
      },
      { status: 500 }
    );
  }
}
