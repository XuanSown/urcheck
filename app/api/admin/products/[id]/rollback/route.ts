import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn phiên bản để khôi phục' },
        { status: 400 }
      );
    }

    // Get the version to rollback to
    const version = await prisma.productVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Phiên bản không tồn tại' },
        { status: 404 }
      );
    }

    // Verify version belongs to this product
    if (version.productId !== id) {
      return NextResponse.json(
        { success: false, error: 'Phiên bản không thuộc về sản phẩm này' },
        { status: 400 }
      );
    }

    // Get current product for new snapshot
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Apply the rollback - restore from snapshot
    const snapshot = version.productSnapshot as any;

    if (!snapshot || typeof snapshot !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Snapshot phiên bản không hợp lệ' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update product fields from snapshot
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: snapshot.name,
          description: snapshot.description,
          sku: snapshot.sku,
          batchNumber: snapshot.batchNumber,
          manufactureDate: new Date(snapshot.manufactureDate),
          expiryDate: new Date(snapshot.expiryDate),
          skinType: snapshot.skinType,
          suitableFor: snapshot.suitableFor,
          pros: snapshot.pros,
          cons: snapshot.cons,
          ingredientAnalysis: snapshot.ingredientAnalysis,
          tags: snapshot.tags,
          status: snapshot.status,
          purchaseLinks: snapshot.purchaseLinks,
          companyName: snapshot.companyName,
          companyAddress: snapshot.companyAddress,
          verified: snapshot.verified,
        },
      });

      // Recreate barcodes from snapshot
      await tx.barcode.deleteMany({
        where: { productId: id },
      });

      if (snapshot.barcodes && Array.isArray(snapshot.barcodes) && snapshot.barcodes.length > 0) {
        await tx.barcode.createMany({
          data: snapshot.barcodes.map((code: string) => ({
            code,
            productId: id,
          })),
        });
      }

      // Create version record for the rollback action
      await tx.productVersion.create({
        data: {
          productId: id,
          productSnapshot: {
            ...snapshot,
            _rollbackNote: `Đã khôi phục về phiên bản ${versionId}`,
          },
          changedBy: 'admin',
          changeReason: `Khôi phục về phiên bản ${versionId} (${version.changeReason || 'không có lý do'})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Khôi phục phiên bản thành công',
    });
  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi khôi phục' },
      { status: 500 }
    );
  }
}
