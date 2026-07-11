import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import { productSchema } from '@/lib/validators';
import type { Prisma } from '@prisma/client';

interface ProductWithRelations {
  id: string;
  name: string;
  description: string | null;
  manufactureDate: Date | null;
  expiryDate: Date | null;
  expiresInMonths: number | null;
  skinType: string | null;
  suitableFor: string | null;
  usages: Prisma.JsonValue;
  usageInstructions: string[];
  ingredientAnalysis: Prisma.JsonValue;
  tags: Prisma.JsonValue;
  status: string;
  publishedAt: Date | null;
  purchaseLinks: Prisma.JsonValue;
  brandName: string | null;
  batchNumber: string | null;
  category: string | null;
  certifications: Prisma.JsonValue;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: Array<Record<string, unknown>>;
  _count?: { versions: number };
  versions?: Array<Record<string, unknown>>;
  qrCodes?: { code: string; url: string }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },

        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProductResponse(product),
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const body = await request.json();

    // Validate input (status không cho phép ARCHIVED qua update)
    const validatedData = productSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }



    const result = await prisma.$transaction(async (tx) => {
      // Get current product for version snapshot
      const oldData = await tx.product.findUnique({
        where: { id },
      });



      if (!oldData) {
        throw new Error('Product not found');
      }

      // Update product
      const product = await tx.product.update({
        where: { id },
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
          batchNumber: validatedData.batchNumber || null,
          category: validatedData.category || null,
          certifications: validatedData.certifications || [],
          verified: validatedData.verified,
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
        batchNumber: product.batchNumber,
        category: product.category,
        certifications: product.certifications,
        verified: product.verified,

      };

      // Build diff
      const changedFields: string[] = [];

      if (oldData.name !== product.name) changedFields.push('name');
      if (oldData.description !== product.description) changedFields.push('description');

      if (oldData.manufactureDate?.getTime() !== product.manufactureDate?.getTime()) changedFields.push('manufactureDate');
      if (oldData.expiryDate?.getTime() !== product.expiryDate?.getTime()) changedFields.push('expiryDate');
      if (oldData.expiresInMonths !== product.expiresInMonths) changedFields.push('expiresInMonths');
      if (oldData.skinType !== product.skinType) changedFields.push('skinType');
      if (oldData.suitableFor !== product.suitableFor) changedFields.push('suitableFor');
      if (JSON.stringify(oldData.usages) !== JSON.stringify(product.usages)) changedFields.push('usages');
      if (JSON.stringify(oldData.usageInstructions) !== JSON.stringify(product.usageInstructions)) changedFields.push('usageInstructions');
      if (oldData.ingredientAnalysis !== product.ingredientAnalysis) changedFields.push('ingredientAnalysis');
      if (JSON.stringify(oldData.tags) !== JSON.stringify(product.tags)) changedFields.push('tags');
      if (oldData.status !== product.status) changedFields.push('status');
      if (JSON.stringify(oldData.purchaseLinks) !== JSON.stringify(product.purchaseLinks)) changedFields.push('purchaseLinks');
      if (oldData.brandName !== product.brandName) changedFields.push('brandName');
      if (oldData.verified !== product.verified) changedFields.push('verified');

      await tx.productVersion.create({
        data: {
          productId: product.id,
          productSnapshot,
          changedBy: 'system', // Replace with actual admin user
          changeReason: `Cập nhật sản phẩm. Thay đổi: ${changedFields.join(', ')}`,
        },
      });

      // Fetch updated product with relations
      const fullProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },

          _count: {
            select: {
              versions: true,
            },
          },
        },
      });

      return fullProduct;
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: formatProductResponse(result!),
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }

    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu trùng lặp' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    if (product.status !== 'ARCHIVED') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể xóa sản phẩm đã lưu trữ. Vui lòng chuyển trạng thái sang Đã lưu trữ trước khi xóa.' },
        { status: 400 }
      );
    }

    // Delete product (cascade will delete images, versions)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

function formatProductResponse(product: ProductWithRelations) {
  // Primary image now lives in ProductImage; no fallback from removed product.imageUrl
  const existingImages = product.images || [];

  return {
    id: product.id,
    name: product.name,
    description: product.description,

    manufactureDate: product.manufactureDate ? product.manufactureDate.toISOString() : null,
    expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
    expiresInMonths: product.expiresInMonths,
    skinType: product.skinType,
    suitableFor: product.suitableFor,
    usages: product.usages,
    usageInstructions: product.usageInstructions,
    ingredientAnalysis: product.ingredientAnalysis,
    tags: product.tags,
    status: product.status,
    publishedAt: product.publishedAt?.toISOString() ?? null,
    purchaseLinks: product.purchaseLinks,
    brandName: product.brandName,
    batchNumber: product.batchNumber,
    category: product.category,
    certifications: product.certifications,
    verified: product.verified,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: existingImages,
    versionCount: product._count?.versions || 0,
    versions: product.versions,
    qrCode: product.qrCodes?.[0] || null,
  };
}
