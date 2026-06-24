import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

const SUPABASE_BUCKET = 'product-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Helper to upload buffer to Supabase Storage
async function uploadToSupabase(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase admin client not configured');
  }

  const filePath = `products/${Date.now()}-${filename}`;

  const { error } = await supabaseAdmin!
    .storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabaseAdmin!
    .storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

// Helper: fallback in-memory data URL (dev mode without Supabase)
function bufferToDataUrl(buffer: Buffer, contentType: string): string {
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

// POST /api/admin/products/[id]/images - Upload image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file' },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File quá lớn (tối đa 10MB)' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng file không hỗ trợ (chỉ JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine next sortOrder
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Check if this is the first image → mark as primary
    const existingCount = await prisma.productImage.count({
      where: { productId: id },
    });
    const isPrimary = existingCount === 0;

    // Upload: prefer Supabase, fallback to data URL
    let url: string;
    try {
      if (isSupabaseAdminConfigured()) {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        url = await uploadToSupabase(buffer, filename, file.type);
      } else {
        // Dev fallback - store as data URL so it can be displayed
        url = bufferToDataUrl(buffer, file.type);
      }
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Upload thất bại: ${uploadError.message || 'unknown error'}` },
        { status: 500 }
      );
    }

    // Save to DB
    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        altText: file.name,
        sortOrder: nextSortOrder,
        isPrimary,
      },
    });

    // If first image, also update product.imageUrl
    if (isPrimary) {
      await prisma.product.update({
        where: { id },
        data: { imageUrl: url },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Upload ảnh thành công',
      data: image,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]/images?imageId=xxx - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu imageId' },
        { status: 400 }
      );
    }

    // Get image record
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId: id },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Ảnh không tồn tại' },
        { status: 404 }
      );
    }

    // Delete from Supabase Storage (best-effort)
    try {
      if (isSupabaseAdminConfigured() && !image.url.startsWith('data:')) {
        const url = new URL(image.url);
        const pathname = url.pathname;
        const filePath = pathname.replace(`/${SUPABASE_BUCKET}/`, '');

        await supabaseAdmin!
          .storage
          .from(SUPABASE_BUCKET)
          .remove([filePath]);
      }
    } catch (storageError) {
      console.error('Failed to delete from storage:', storageError);
      // Continue with DB deletion even if storage delete fails
    }

    // Delete from database
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // If deleted image was primary or only image, update product's imageUrl
    const remainingImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
      take: 1,
    });

    const newPrimary = remainingImages[0];
    if (newPrimary) {
      await prisma.product.update({
        where: { id },
        data: { imageUrl: newPrimary.url },
      });
    } else {
      await prisma.product.update({
        where: { id },
        data: { imageUrl: null },
      });
    }

    // Reorder remaining images
    const allImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });

    for (let i = 0; i < allImages.length; i++) {
      if (allImages[i].sortOrder !== i) {
        await prisma.productImage.update({
          where: { id: allImages[i].id },
          data: { sortOrder: i },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa ảnh thành công',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa ảnh' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]/images - Reorder images
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { imageIds }: { imageIds: Array<{ id: string; sortOrder: number }> } = body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    // Update sort order for all images
    await prisma.$transaction(async (tx) => {
      for (const item of imageIds) {
        await tx.productImage.update({
          where: {
            id: item.id,
            productId: id,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Sắp xếp ảnh thành công',
    });
  } catch (error) {
    console.error('Reorder images error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi' },
      { status: 500 }
    );
  }
}
