'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format-utils';
import BarcodeScannerDialog from '@/components/admin/BarcodeScannerDialog';
import ProductForm, { ProductFormData } from '../new/ProductForm';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  skinType?: string;
  suitableFor?: string;
  pros: string[];
  cons: string[];
  tags: string[];
  status: string;
  companyName: string;
  companyWebsite?: string;
  companyContact?: string;
  purchaseLinks: Array<{
    platform: 'shopee' | 'tiki' | 'custom';
    url: string;
  }>;
  images: Array<{ id: string; url: string; sortOrder: number; isPrimary: boolean }>;
  barcodes: Array<{ id: string; code: string }>;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
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

  const handleBarcodeDetected = (barcode: string) => {
    if (product) {
      // Check if barcode already exists
      const exists = product.barcodes.some(b => b.code === barcode);
      if (!exists) {
        // This would be handled in the form component
        console.log('New barcode detected:', barcode);
      }
    }
  };

  const handleSubmit = async (formData: ProductFormData, asDraft: boolean) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: asDraft ? 'DRAFT' : formData.status || 'PUBLISHED',
          changeReason: asDraft ? 'Đã lưu bản nháp' : 'Cập nhật thông tin sản phẩm',
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

  const handlePreview = (formData: ProductFormData) => {
    setPreviewData(formData);
    setShowPreview(true);
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
            <p className="text-gray-500 mt-1">{product.sku}</p>
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
        initialData={{
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
          tags: product.tags,
          status: (product.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') as 'DRAFT' | 'PUBLISHED',
          companyName: product.companyName,
          companyWebsite: product.companyWebsite,
          companyContact: product.companyContact,
          purchaseLinks: product.purchaseLinks,
          existingImages: product.images,
          existingBarcodes: product.barcodes.map(b => b.code),
        }}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        submitting={submitting}
        existingBarcodes={product.barcodes.map(b => b.code)}
      />

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Xem trước sản phẩm</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left column - Preview */}
                <div className="space-y-6">
                  <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                    {previewData.existingImages && previewData.existingImages.length > 0 ? (
                      <img
                        src={previewData.existingImages[0].url}
                        alt={previewData.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Barcodes */}
                  {previewData.existingBarcodes && previewData.existingBarcodes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Mã vạch ({previewData.existingBarcodes.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewData.existingBarcodes.map(barcode => (
                          <span key={barcode} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                            {barcode}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {previewData.tags && previewData.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewData.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column - Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{previewData.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">SKU: {previewData.sku}</p>
                    <p className="text-xs text-gray-400">Lô: {previewData.batchNumber}</p>
                  </div>

                  {previewData.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Mô tả</h4>
                      <p className="text-gray-600 text-sm">{previewData.description}</p>
                    </div>
                  )}

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-2 gap-4">
                    {previewData.pros && previewData.pros.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ưu điểm
                        </h4>
                        <ul className="space-y-1">
                          {previewData.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-green-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewData.cons && previewData.cons.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Nhược điểm
                        </h4>
                        <ul className="space-y-1">
                          {previewData.cons.map((con, i) => (
                            <li key={i} className="text-sm text-red-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Ngày sản xuất:</span>
                      <p className="font-medium">{previewData.manufactureDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hạn sử dụng:</span>
                      <p className="font-medium">{previewData.expiryDate}</p>
                    </div>
                  </div>

                  {/* Suitable for */}
                  {previewData.suitableFor && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Phù hợp cho</h4>
                      <p className="text-gray-600 text-sm bg-blue-50 inline-block px-3 py-1 rounded-full">
                        {previewData.suitableFor}
                      </p>
                    </div>
                  )}

                  {/* Skin type */}
                  {previewData.skinType && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Loại da phù hợp</h4>
                      <p className="text-gray-600 text-sm">{previewData.skinType}</p>
                    </div>
                  )}

                  {/* Ingredient analysis */}
                  {previewData.ingredientAnalysis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Phân tích thành phần</h4>
                      <p className="text-gray-600 text-sm">{previewData.ingredientAnalysis}</p>
                    </div>
                  )}

                  {/* Company info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin công ty</h4>
                    <p className="font-medium text-gray-900">{previewData.companyName}</p>
                    {previewData.companyWebsite && (
                      <a href={previewData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline">
                        {previewData.companyWebsite}
                      </a>
                    )}
                  </div>

                  {/* Purchase links */}
                  {previewData.purchaseLinks && previewData.purchaseLinks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Liên kết mua hàng</h4>
                      <div className="space-y-2">
                        {previewData.purchaseLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                          >
                            {link.platform === 'shopee' ? (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                              </svg>
                            ) : link.platform === 'tiki' ? (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                            <span>{link.platform === 'shopee' ? 'Shopee' : link.platform === 'tiki' ? 'Tiki' : 'Custom URL'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Đóng
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
