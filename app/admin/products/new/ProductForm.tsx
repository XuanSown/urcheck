'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import BarcodeScannerDialog from '@/components/admin/BarcodeScannerDialog';
import { QrCodeDialog } from '@/components/admin/QrCodeDialog';
import { useLocale } from '@/components/I18nProvider';
import { isBarcodeEnabled } from '@/lib/feature-flags';

export interface ProductFormData {
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
  ingredientAnalysis?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  purchaseLinks: Array<{ platform: string; url: string }>;
  companyName: string;
  companyAddress?: string;
  verified: boolean;
  barcodes: string[];
  orderCode?: string;
  batchCode?: string;
  existingBarcodes?: string[];
  existingImages?: Array<{ id: string; url: string; isPrimary: boolean; altText?: string }>;
  companyWebsite?: string;
  companyContact?: string;
}

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData> | null;
  onSubmit?: (formData: ProductFormData, asDraft: boolean) => void | Promise<void>;
  onPreview?: (formData: ProductFormData) => void;
  submitting?: boolean;
  existingBarcodes?: string[];
}

const skinTypeOptions = [
  'da dầu',
  'da khô',
  'da hỗn hợp',
  'da nhạy cảm',
  'da bình thường',
  'tất cả loại da',
];

const suitableForOptions = [
  'nam/nữ',
  'nam',
  'nữ',
  'trẻ em',
  'người lớn',
  'mẹ và bé',
];

const purchaseLinkPlatforms = [
  'Shopee',
  'Tiki',
  'Lazada',
  'TGDĐ',
  'Website riêng',
  'Shop chính hãng',
];

export default function ProductForm({
  productId,
  initialData,
  onSubmit,
  onPreview,
  submitting = false,
  existingBarcodes = [],
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    batchNumber: '',
    manufactureDate: '',
    expiryDate: '',
    skinType: '',
    suitableFor: '',
    pros: [''],
    cons: [''],
    ingredientAnalysis: '',
    tags: [],
    status: 'DRAFT',
    purchaseLinks: [{ platform: '', url: '' }],
    companyName: '',
    companyAddress: '',
    verified: true,
    barcodes: [],
    orderCode: '',
    batchCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [previewData, setPreviewData] = useState<ProductFormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [generatedQr, setGeneratedQr] = useState<{
    code: string;
    url: string;
    orderCode?: string | null;
    batchCode?: string | null;
  } | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const { t } = useLocale();
  const barcodeAllowed = isBarcodeEnabled();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        sku: initialData.sku || '',
        batchNumber: initialData.batchNumber || '',
        manufactureDate: initialData.manufactureDate ? formatDateInput(initialData.manufactureDate) : '',
        expiryDate: initialData.expiryDate ? formatDateInput(initialData.expiryDate) : '',
        skinType: initialData.skinType || '',
        suitableFor: initialData.suitableFor || '',
        pros: initialData.pros?.length ? initialData.pros : [''],
        cons: initialData.cons?.length ? initialData.cons : [''],
        ingredientAnalysis: initialData.ingredientAnalysis || '',
        tags: initialData.tags || [],
        status: (initialData.status as 'DRAFT' | 'PUBLISHED') || 'DRAFT',
        purchaseLinks: initialData.purchaseLinks?.length
          ? initialData.purchaseLinks
          : [{ platform: '', url: '' }],
        companyName: initialData.companyName || '',
        companyAddress: initialData.companyAddress || '',
        verified: initialData.verified ?? true,
        barcodes: initialData.barcodes || [],
        orderCode: initialData.orderCode || '',
        batchCode: initialData.batchCode || '',
        existingBarcodes: initialData.existingBarcodes || [],
        existingImages: initialData.existingImages || [],
        companyWebsite: initialData.companyWebsite,
        companyContact: initialData.companyContact,
      });
      setImages(initialData.existingImages || []);
    }
  }, [initialData]);

  const formatDateInput = (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleArrayChange = (field: 'pros' | 'cons', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleBarcodeDetected = (barcode: string) => {
    setFormData(prev => {
      const allBarcodes = [...(prev.barcodes || []), ...(prev.existingBarcodes || [])];
      if (allBarcodes.includes(barcode)) return prev;
      return {
        ...prev,
        barcodes: [...prev.barcodes, barcode],
      };
    });
  };

  const removeBarcode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      barcodes: prev.barcodes.filter((_, i) => i !== index),
    }));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handlePurchaseLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      purchaseLinks: prev.purchaseLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const addPurchaseLink = () => {
    setFormData(prev => ({
      ...prev,
      purchaseLinks: [...prev.purchaseLinks, { platform: '', url: '' }],
    }));
  };

  const removePurchaseLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      purchaseLinks: prev.purchaseLinks.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!productId) {
      setError('Vui lòng lưu sản phẩm trước khi upload ảnh');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', files[0]);

    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImages(prev => [...prev, data.data]);
    } catch (err: any) {
      alert('Upload ảnh thất bại: ' + err.message);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!productId) return;
    if (!confirm('Xóa ảnh này?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      alert('Xóa ảnh thất bại');
    }
  };

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên sản phẩm');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('Vui lòng nhập mã SKU');
      return false;
    }
    if (!formData.batchNumber.trim()) {
      setError('Vui lòng nhập số lô');
      return false;
    }
    if (!formData.manufactureDate) {
      setError('Vui lòng chọn ngày sản xuất');
      return false;
    }
    if (!formData.expiryDate) {
      setError('Vui lòng chọn ngày hết hạn');
      return false;
    }
    if (new Date(formData.expiryDate) <= new Date(formData.manufactureDate)) {
      setError('Ngày hết hạn phải sau ngày sản xuất');
      return false;
    }
    if (!formData.companyName.trim()) {
      setError('Vui lòng nhập tên công ty');
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    setFormData(prev => ({ ...prev, status: 'DRAFT' }));
  };

  const handlePreviewClick = () => {
    setPreviewData(formData);
    setShowPreview(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    if (onSubmit) {
      onSubmit(formData, formData.status === 'DRAFT');
    } else {
      handleSubmitLocal(formData);
    }
  };

  const handleSubmitLocal = async (data: ProductFormData) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        manufactureDate: new Date(data.manufactureDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        orderCode: data.orderCode?.trim() || undefined,
        batchCode: data.batchCode?.trim() || undefined,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Lưu thất bại');
      }

      setSuccess('Lưu sản phẩm thành công!');

      // Show QR dialog (auto-generated by the server) so admin can print.
      if (result.qrCode) {
        setGeneratedQr({
          code: result.qrCode.code,
          url: result.qrCode.url,
          orderCode: result.qrCode.orderCode,
          batchCode: result.qrCode.batchCode,
        });
        setShowQrDialog(true);
      }

      setTimeout(() => {
        router.push('/admin/products');
      }, 2500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Cập nhật thông tin sản phẩm' : 'Điền đầy đủ thông tin sản phẩm'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft} disabled={loading}>
            Lưu nháp
          </Button>
          <Button onClick={handleFormSubmit} loading={loading}>
            {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700">{success}</p>
        </Card>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mã SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số lô / Batch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="manufactureDate"
                value={formData.manufactureDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày hết hạn <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Loại da phù hợp
              </label>
              <select
                name="skinType"
                value={formData.skinType || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Chọn loại da</option>
                {skinTypeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phù hợp cho
              </label>
              <select
                name="suitableFor"
                value={formData.suitableFor || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Chọn đối tượng</option>
                {suitableForOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Barcodes - only shown when ENABLE_BARCODE=true */}
        {barcodeAllowed && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Mã barcode / EAN</h2>
          <div className="space-y-3">
            {/* Existing barcodes (in edit mode) */}
            {formData.existingBarcodes && formData.existingBarcodes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Mã hiện tại:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.existingBarcodes.map((barcode, idx) => (
                    <span
                      key={`existing-${idx}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-mono rounded-lg"
                    >
                      {barcode}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Khi lưu, các mã mới bên dưới sẽ thay thế toàn bộ mã hiện tại.
                </p>
              </div>
            )}
            {formData.barcodes.map((barcode, index) => (
              <div key={`new-${index}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => {
                    const newBarcodes = [...formData.barcodes];
                    newBarcodes[index] = e.target.value;
                    setFormData(prev => ({ ...prev, barcodes: newBarcodes }));
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  placeholder="Nhập mã barcode (EAN-13, EAN-8)"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Quét
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeBarcode(index)}
                  className="text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, barcodes: [...prev.barcodes, ''] }))}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm mã barcode
            </Button>
          </div>
        </Card>
        )}

        {/* Order code / Batch code */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t('form_order_code')} & {t('form_batch_code')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('form_order_code')}
              </label>
              <input
                type="text"
                name="orderCode"
                value={formData.orderCode || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                placeholder={t('form_order_code_hint')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('form_order_code_hint')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('form_batch_code')}
              </label>
              <input
                type="text"
                name="batchCode"
                value={formData.batchCode || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                placeholder={t('form_batch_code_hint')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('form_batch_code_hint')}
              </p>
            </div>
          </div>
        </Card>

        {/* Pros & Cons */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ưu & Nhược điểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ưu điểm</label>
              {formData.pros.map((pro, index) => (
                <div key={`pro-${index}`} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => handleArrayChange('pros', index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    placeholder={`Ưu điểm ${index + 1}`}
                  />
                  {formData.pros.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('pros', index)}>
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('pros')}>
                + Thêm ưu điểm
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhược điểm</label>
              {formData.cons.map((con, index) => (
                <div key={`con-${index}`} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => handleArrayChange('cons', index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                    placeholder={`Nhược điểm ${index + 1}`}
                  />
                  {formData.cons.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('cons', index)}>
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('cons')}>
                + Thêm nhược điểm
              </Button>
            </div>
          </div>
        </Card>

        {/* Tags & Analysis */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Phân tích & Tags</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onKeyDown={handleTagAdd}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập tag rồi nhấn Enter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phân tích thành phần
              </label>
              <textarea
                name="ingredientAnalysis"
                value={formData.ingredientAnalysis || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                placeholder="Phân tích chi tiết về các thành phần, công dụng, tác dụng phụ..."
              />
            </div>
          </div>
        </Card>

        {/* Purchase Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Link mua hàng (tối đa 2)</h2>
          <div className="space-y-3">
            {formData.purchaseLinks.map((link, index) => (
              <div key={`link-${index}`} className="flex gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => handlePurchaseLinkChange(index, 'platform', e.target.value)}
                  className="w-1/3 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn nền tảng</option>
                  {purchaseLinkPlatforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handlePurchaseLinkChange(index, 'url', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
                {formData.purchaseLinks.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => removePurchaseLink(index)}>
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
            {formData.purchaseLinks.length < 2 && (
              <Button type="button" variant="outline" size="sm" onClick={addPurchaseLink}>
                + Thêm link mua hàng
              </Button>
            )}
          </div>
        </Card>

        {/* Company Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin nhà sản xuất</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Địa chỉ công ty
              </label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Images */}
        {isEditing && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hình ảnh sản phẩm</h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload ảnh
              </label>
              <p className="text-sm text-gray-500 mt-2">JPEG, PNG, WebP. Tối đa 10MB mỗi ảnh</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.altText || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Chính
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Bottom actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="button" variant="secondary" onClick={handlePreviewClick}>
            Xem trước
          </Button>
          <Button type="submit" loading={submitting || loading}>
            {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </div>
      </form>

      {/* Barcode Scanner Dialog - only when barcode feature is enabled */}
      {barcodeAllowed && (
      <BarcodeScannerDialog
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcodeDetected={handleBarcodeDetected}
        existingBarcodes={[...(formData.barcodes || []), ...(formData.existingBarcodes || [])]}
      />
      )}

      {/* QR Code Dialog - shown after successful save */}
      {generatedQr && (
        <QrCodeDialog
          open={showQrDialog}
          onClose={() => setShowQrDialog(false)}
          code={generatedQr.code}
          url={generatedQr.url}
          productName={formData.name}
          orderCode={generatedQr.orderCode}
          batchCode={generatedQr.batchCode}
        />
      )}

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
                  {(previewData.existingBarcodes?.length || previewData.barcodes?.length) ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Mã vạch</h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(previewData.existingBarcodes || []), ...(previewData.barcodes || [])].map((barcode: string, idx: number) => (
                          <span key={`${barcode}-${idx}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                            {barcode}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Tags */}
                  {previewData.tags && previewData.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewData.tags.map((tag: string) => (
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
                    {previewData.pros && previewData.pros.filter(p => p).length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ưu điểm
                        </h4>
                        <ul className="space-y-1">
                          {previewData.pros.filter(p => p).map((pro: string, i: number) => (
                            <li key={i} className="text-sm text-green-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewData.cons && previewData.cons.filter(c => c).length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Nhược điểm
                        </h4>
                        <ul className="space-y-1">
                          {previewData.cons.filter(c => c).map((con: string, i: number) => (
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
                  {previewData.purchaseLinks && previewData.purchaseLinks.filter(l => l.url).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Liên kết mua hàng</h4>
                      <div className="space-y-2">
                        {previewData.purchaseLinks.filter(l => l.url).map((link: { platform: string; url: string }, i: number) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>{link.platform || 'Link mua hàng'}</span>
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
