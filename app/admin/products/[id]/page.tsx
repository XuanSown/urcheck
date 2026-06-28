'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format-utils';
import ProductForm, { ProductFormData } from '../new/ProductForm';

interface Product {
  id: string;
  name: string;
  description?: string;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  expiresInMonths?: number | null;
  skinType?: string;
  suitableFor?: string;
  usages: string[];
  usageInstructions: string[];
  tags: string[];
  status: string;
  brandName: string;
  companyWebsite?: string;
  companyContact?: string;
  purchaseLinks: Array<{
    platform: 'shopee' | 'tiki' | 'custom';
    url: string;
  }>;
  images: Array<{ id: string; url: string; sortOrder: number; isPrimary: boolean }>;
  qrCode?: any;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<ProductFormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải thông tin sản phẩm');
      }

      setProduct(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleSubmit = async (formData: ProductFormData, asDraft: boolean) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          manufactureDate: formData.expiryType === 'dates' && formData.manufactureDate ? new Date(formData.manufactureDate).toISOString() : null,
          expiryDate: formData.expiryType === 'dates' && formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
          expiresInMonths: formData.expiryType === 'months' && formData.expiresInMonths ? Number(formData.expiresInMonths) : null,
          status: asDraft ? 'DRAFT' : formData.status || 'PUBLISHED',
          changeReason: asDraft ? 'Đã lưu bản nháp' : 'Cập nhật thông tin sản phẩm',
          // Lọc bỏ các giá trị rỗng
          usages: formData.usages.filter(u => u.trim() !== ''),
          usageInstructions: formData.usageInstructions.filter(i => i.trim() !== ''),
          purchaseLinks: formData.purchaseLinks.filter(l => l.url.trim() !== '' && l.platform.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể cập nhật sản phẩm');
      }

      // Refresh product data
      await fetchProduct();

      if (!asDraft) {
        alert('Cập nhật sản phẩm thành công!');
      }
    } catch (err: any) {
      setError(err.message);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
          </Link>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="text-red-700">{error}</div>
        </Card>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(product.status)}`}>
                {product.status === 'DRAFT' ? 'Bản nháp' : product.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Đã lưu trữ'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/products/${productId}/history`}>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch sử phiên bản
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        productId={productId}
        initialData={{
          name: product.name,
          description: product.description,
          manufactureDate: product.manufactureDate || '',
          expiryDate: product.expiryDate || '',
          expiresInMonths: product.expiresInMonths || '',
          skinType: product.skinType,
          suitableFor: product.suitableFor,
          usages: product.usages,
          usageInstructions: product.usageInstructions,
          tags: product.tags,
          status: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
          brandName: product.brandName,
          companyWebsite: product.companyWebsite,
          companyContact: product.companyContact,
          purchaseLinks: product.purchaseLinks,
          existingImages: product.images,
        }}
        qrCode={product.qrCode}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
