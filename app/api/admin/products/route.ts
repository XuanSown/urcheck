import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import { productSchema } from '@/lib/validators';
import {
  buildQrUrl,
  generateQrCode,
} from '@/lib/qr-utils';

// GET /api/admin/products?page=&limit=&search=&status=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = (searchParams.get('search') || '').trim();
    const status = (searchParams.get('status') || '').trim();

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
            take: 3,
            select: { id: true, url: true, isPrimary: true, altText: true },
          },
          _count: {
            select: {
              versions: true,
            },
          },
          qrCodes: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { code: true, url: true }
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format response to match client expectations
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,

      manufactureDate: p.manufactureDate ? p.manufactureDate.toISOString() : null,
      expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
      expiresInMonths: p.expiresInMonths,
      skinType: p.skinType,
      suitableFor: p.suitableFor,
      usages: p.usages,
      usageInstructions: p.usageInstructions,
      ingredientAnalysis: p.ingredientAnalysis,
      tags: p.tags,
      status: p.status,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      purchaseLinks: p.purchaseLinks,
      brandName: p.brandName,
      verified: p.verified,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      imageUrl: p.imageUrl,
      images: p.images,
      versionCount: p._count.versions,
      qrCode: p.qrCodes?.[0] || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tải danh sách sản phẩm' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const body = await request.json();
    const validatedData = productSchema.parse(body);



    // Create product with images and QR code in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,

          manufactureDate: validatedData.manufactureDate ? new Date(validatedData.manufactureDate) : null,
          expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
          expiresInMonths: validatedData.expiresInMonths || null,
          skinType: validatedData.skinType,
          suitableFor: validatedData.suitableFor,
          usages: validatedData.usages,
          usageInstructions: validatedData.usageInstructions,
          ingredientAnalysis: validatedData.ingredientAnalysis,
          tags: validatedData.tags,
          status: validatedData.status,
          publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
          purchaseLinks: validatedData.purchaseLinks,
          brandName: validatedData.brandName,
          verified: validatedData.verified,
        },
      });

      // Auto-create QR code for this product (one product = one QR)
      const qrCodeValue = generateQrCode(product.name);
      const qrCode = await tx.qrCode.create({
        data: {
          code: qrCodeValue,
          url: buildQrUrl(qrCodeValue),
          productId: product.id,
        },
      });

      // Create version record
      const productSnapshot = {
        name: product.name,
        description: product.description,

        manufactureDate: product.manufactureDate,
        expiryDate: product.expiryDate,
        expiresInMonths: product.expiresInMonths,
        skinType: product.skinType,
        suitableFor: product.suitableFor,
        usages: product.usages,
        usageInstructions: product.usageInstructions,
        ingredientAnalysis: product.ingredientAnalysis,
        tags: product.tags,
        status: product.status,
        purchaseLinks: product.purchaseLinks,
        brandName: product.brandName,
        verified: product.verified,
        qrCode: qrCodeValue,

      };

      await tx.productVersion.create({
        data: {
          productId: product.id,
          productSnapshot,
          changedBy: 'system',
          changeReason: 'Tạo mới sản phẩm',
        },
      });

      // Fetch product with relations
      const fullProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },

          qrCodes: { orderBy: { createdAt: 'desc' } },
          _count: {
            select: {
              versions: true,
              qrCodes: true,
            },
          },
        },
      });

      return fullProduct;
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: formatProductResponse(result!),
      qrCode: result?.qrCodes?.[0]
        ? {
            id: result.qrCodes[0].id,
            code: result.qrCodes[0].code,
            url: result.qrCodes[0].url,

          }
        : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }



    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}

function formatProductResponse(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,

    manufactureDate: product.manufactureDate ? product.manufactureDate.toISOString() : null,
    expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
    expiresInMonths: product.expiresInMonths,
    skinType: product.skinType,
    suitableFor: product.suitableFor,
    pros: product.pros,
    cons: product.cons,
    ingredientAnalysis: product.ingredientAnalysis,
    tags: product.tags,
    status: product.status,
    publishedAt: product.publishedAt?.toISOString() ?? null,
    purchaseLinks: product.purchaseLinks,
    companyName: product.companyName,
    companyAddress: product.companyAddress,
    verified: product.verified,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images,

    versionCount: product._count.versions,
  };
}
