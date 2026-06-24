import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/db';
import { productSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        barcodes: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            barcodes: true,
            versions: true,
          },
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
    await requireAdmin();
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

    // Check for duplicate SKU (excluding current product)
    if (validatedData.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: {
          sku: validatedData.sku,
          id: { not: id },
        },
      });

      if (duplicateSku) {
        return NextResponse.json(
          { success: false, error: `SKU "${validatedData.sku}" đã được sử dụng bởi sản phẩm khác` },
          { status: 409 }
        );
      }
    }

    // Check for duplicate barcodes
    if (validatedData.barcodes && validatedData.barcodes.length > 0) {
      const existingBarcodes = await prisma.barcode.findMany({
        where: {
          code: { in: validatedData.barcodes },
          productId: { not: id },
        },
        select: { code: true, product: { select: { name: true } } },
      });

      if (existingBarcodes.length > 0) {
        const duplicates = existingBarcodes.map(b => `${b.code} (${b.product.name})`).join(', ');
        return NextResponse.json(
          { success: false, error: `Mã vạch đã tồn tại trong sản phẩm khác: ${duplicates}` },
          { status: 409 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get current product AND barcodes for version snapshot
      const oldData = await tx.product.findUnique({
        where: { id },
      });

      const currentBarcodes = await tx.barcode.findMany({
        where: { productId: id },
        select: { code: true },
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
          sku: validatedData.sku,
          batchNumber: validatedData.batchNumber,
          manufactureDate: new Date(validatedData.manufactureDate),
          expiryDate: new Date(validatedData.expiryDate),
          skinType: validatedData.skinType,
          suitableFor: validatedData.suitableFor,
          pros: validatedData.pros,
          cons: validatedData.cons,
          ingredientAnalysis: validatedData.ingredientAnalysis,
          tags: validatedData.tags,
          status: validatedData.status,
          publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
          purchaseLinks: validatedData.purchaseLinks,
          companyName: validatedData.companyName,
          companyAddress: validatedData.companyAddress,
          verified: validatedData.verified,
        },
      });

      // Handle barcodes: delete old and create new
      await tx.barcode.deleteMany({
        where: { productId: id },
      });

      if (validatedData.barcodes && validatedData.barcodes.length > 0) {
        await tx.barcode.createMany({
          data: validatedData.barcodes.map(code => ({
            code,
            productId: id,
          })),
        });
      }

      // Create version record with barcodes included
      const productSnapshot = {
        name: product.name,
        description: product.description,
        sku: product.sku,
        batchNumber: product.batchNumber,
        manufactureDate: product.manufactureDate,
        expiryDate: product.expiryDate,
        skinType: product.skinType,
        suitableFor: product.suitableFor,
        pros: product.pros,
        cons: product.cons,
        ingredientAnalysis: product.ingredientAnalysis,
        tags: product.tags,
        status: product.status,
        purchaseLinks: product.purchaseLinks,
        companyName: product.companyName,
        companyAddress: product.companyAddress,
        verified: product.verified,
        barcodes: currentBarcodes.map(b => b.code),
      };

      // Build diff
      const changedFields: string[] = [];
      const oldBarcodes = currentBarcodes.map(b => b.code).sort();
      const newBarcodes = (validatedData.barcodes || []).sort();

      if (JSON.stringify(oldBarcodes) !== JSON.stringify(newBarcodes)) {
        changedFields.push('barcodes');
      }

      if (oldData.name !== product.name) changedFields.push('name');
      if (oldData.description !== product.description) changedFields.push('description');
      if (oldData.sku !== product.sku) changedFields.push('sku');
      if (oldData.batchNumber !== product.batchNumber) changedFields.push('batchNumber');
      if (oldData.manufactureDate.getTime() !== product.manufactureDate.getTime()) changedFields.push('manufactureDate');
      if (oldData.expiryDate.getTime() !== product.expiryDate.getTime()) changedFields.push('expiryDate');
      if (oldData.skinType !== product.skinType) changedFields.push('skinType');
      if (oldData.suitableFor !== product.suitableFor) changedFields.push('suitableFor');
      if (JSON.stringify(oldData.pros) !== JSON.stringify(product.pros)) changedFields.push('pros');
      if (JSON.stringify(oldData.cons) !== JSON.stringify(product.cons)) changedFields.push('cons');
      if (oldData.ingredientAnalysis !== product.ingredientAnalysis) changedFields.push('ingredientAnalysis');
      if (JSON.stringify(oldData.tags) !== JSON.stringify(product.tags)) changedFields.push('tags');
      if (oldData.status !== product.status) changedFields.push('status');
      if (JSON.stringify(oldData.purchaseLinks) !== JSON.stringify(product.purchaseLinks)) changedFields.push('purchaseLinks');
      if (oldData.companyName !== product.companyName) changedFields.push('companyName');
      if (oldData.companyAddress !== product.companyAddress) changedFields.push('companyAddress');
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
          barcodes: true,
          _count: {
            select: {
              barcodes: true,
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
    await requireAdmin();
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

    // Delete product (cascade will delete images, barcodes, versions)
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

function formatProductResponse(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    batchNumber: product.batchNumber,
    manufactureDate: product.manufactureDate.toISOString(),
    expiryDate: product.expiryDate.toISOString(),
    skinType: product.skinType,
    suitableFor: product.suitableFor,
    pros: product.pros,
    cons: product.cons,
    ingredientAnalysis: product.ingredientAnalysis,
    tags: product.tags,
    status: product.status,
    publishedAt: product.publishedAt?.toISOString(),
    purchaseLinks: product.purchaseLinks,
    companyName: product.companyName,
    companyAddress: product.companyAddress,
    verified: product.verified,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images,
    barcodeCount: product._count?.barcodes || product.barcodes?.length || 0,
    barcodes: product.barcodes,
    versionCount: product._count?.versions || product.versions?.length || 0,
  };
}
