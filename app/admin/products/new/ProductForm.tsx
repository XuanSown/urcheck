'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { QrCodeDialog } from '@/components/admin/QrCodeDialog';
import { QRCodeSVG } from 'qrcode.react';

export interface ProductFormData {
  name: string;
  description?: string;
  manufactureDate: string;
  expiryDate: string;
  expiryType?: 'dates' | 'months';
  expiresInMonths?: number | string;
  skinType?: string;
  suitableFor?: string;
  usages: string[];
  usageInstructions: string[];
  ingredientAnalysis?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  purchaseLinks: Array<{ platform: string; url: string }>;
  brandName: string;
  batchNumber?: string;
  category?: string;
  certifications: string[];
  verified: boolean;
  existingImages?: Array<{ id: string; url: string; isPrimary: boolean; altText?: string }>;
}

// Read a File as a base64 data URL so the local preview always renders,
// independent of blob: URL support or any CSP restrictions.
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData> | null;
  qrCode?: { code: string; url: string } | null;
  onSubmit?: (formData: ProductFormData, asDraft: boolean) => void | Promise<void>;
  onPreview?: (formData: ProductFormData) => void;
  submitting?: boolean;
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
  submitting = false,
  qrCode,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    manufactureDate: '',
    expiryDate: '',
    expiryType: 'dates',
    expiresInMonths: '',
    skinType: '',
    suitableFor: '',
    usages: [''],
    usageInstructions: [''],
    ingredientAnalysis: '',
    tags: [],
    status: 'DRAFT',
    purchaseLinks: [{ platform: '', url: '' }],
    brandName: '',
    batchNumber: '',
    category: '',
    certifications: [],
    verified: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ProductFormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const [images, setImages] = useState<NonNullable<ProductFormData['existingImages']>>([]);
  // Pending files (khi tạo mới, chưa có productId để upload ngay)
  const [pendingFiles, setPendingFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<{
    code: string;
    url: string;
  } | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);

  const formatDateInput = (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!initialData) return;
    (async () => {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        expiryType: initialData.expiresInMonths ? 'months' : 'dates',
        expiresInMonths: initialData.expiresInMonths || '',
        manufactureDate: initialData.manufactureDate ? formatDateInput(initialData.manufactureDate) : '',
        expiryDate: initialData.expiryDate ? formatDateInput(initialData.expiryDate) : '',
        skinType: initialData.skinType || '',
        suitableFor: initialData.suitableFor || '',
        usages: initialData?.usages?.length ? initialData.usages : [''],
        usageInstructions: initialData?.usageInstructions?.length ? initialData.usageInstructions : [''],
        ingredientAnalysis: initialData?.ingredientAnalysis || '',
        tags: initialData?.tags || [],
        status: initialData?.status || 'PUBLISHED',
        purchaseLinks: initialData?.purchaseLinks || [],
        brandName: initialData?.brandName || '',
        verified: initialData?.verified ?? true,
        batchNumber: initialData?.batchNumber || '',
        category: initialData?.category || '',
        certifications: initialData?.certifications || [],
        existingImages: initialData.existingImages || [],
      });
      setImages(initialData.existingImages || []);
    })();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      if (error === fieldErrors[name]) setError(null);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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

  const handleCertAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && certInput.trim()) {
      e.preventDefault();
      if (!formData.certifications.includes(certInput.trim())) {
        setFormData(prev => ({
          ...prev,
          certifications: [...prev.certifications, certInput.trim()],
        }));
      }
      setCertInput('');
    }
  };

  const removeCert = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
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

  const totalImageCount = isEditing ? images.length : pendingFiles.length;

  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const available = 3 - totalImageCount;
    if (available <= 0) {
      setImageNotice('Đã đạt giới hạn tối đa 3 hình ảnh.');
      return;
    }
    const toAdd = fileArray.slice(0, available);
    if (fileArray.length > available) {
      setImageNotice(`Chỉ ${available} ảnh đầu tiên được thêm.`);
    } else {
      setImageNotice(null);
    }

    if (isEditing) {
      // Upload ngay lên server
      handleImageUpload(toAdd);
    } else {
      // Lưu tạm, hiển thị preview bằng data URL (luôn hiển thị được)
      const newPending = await Promise.all(
        toAdd.map(async (file) => ({
          file,
          previewUrl: await readFileAsDataUrl(file),
        }))
      );
      setPendingFiles(prev => [...prev, ...newPending]);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files.length || !productId) return;
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const response = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          body: formDataUpload,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        return data.data;
      });
      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (err: unknown) {
      alert('Upload ảnh thất bại: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingImages(false);
    }
  };

  // Upload tất cả pending files sau khi tạo sản phẩm thành công
  const uploadPendingImages = async (newProductId: string): Promise<boolean> => {
    if (pendingFiles.length === 0) return true;
    setUploadingImages(true);
    try {
      for (const { file } of pendingFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await fetch(`/api/admin/products/${newProductId}/images`, {
          method: 'POST',
          body: formDataUpload,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Upload ảnh thất bại');
        }
      }
      return true;
    } catch (err: unknown) {
      setError('Sản phẩm đã lưu nhưng một số ảnh chưa tải lên được: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setUploadingImages(false);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteImage = async (imageId: string) => {
    if (!productId) return;
    if (!confirm('Xóa ảnh này?')) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch {
      alert('Xóa ảnh thất bại');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Vui lòng nhập tên sản phẩm';
    }

    if (!formData.brandName.trim()) {
      errs.brandName = 'Vui lòng nhập tên thương hiệu';
    }

    const expiryValid =
      (formData.expiryType === 'months' && Number(formData.expiresInMonths) > 0) ||
      (formData.manufactureDate && formData.expiryDate &&
        new Date(formData.expiryDate) > new Date(formData.manufactureDate));

    if (!expiryValid) {
      errs.expiry = formData.expiryType === 'months'
        ? 'Vui lòng nhập số tháng hết hạn lớn hơn 0'
        : 'Ngày hết hạn phải sau ngày sản xuất';
    }

    setFieldErrors(errs);
    setError(errs.name || errs.brandName || errs.expiry || null);
    return Object.keys(errs).length === 0;
  };

  const saveDraft = async (): Promise<boolean> => {
    const ok = validate();
    if (!ok) return false;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: 'DRAFT',
        usages: formData.usages.filter((u) => u.trim() !== ''),
        usageInstructions: formData.usageInstructions.filter((c) => c.trim() !== ''),
        purchaseLinks: formData.purchaseLinks.filter((l) => l.url.trim() !== '' && l.platform.trim() !== ''),
        manufactureDate: formData.expiryType === 'dates' && formData.manufactureDate ? new Date(formData.manufactureDate).toISOString() : null,
        expiryDate: formData.expiryType === 'dates' && formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        expiresInMonths: formData.expiryType === 'months' && formData.expiresInMonths ? Number(formData.expiresInMonths) : null,
        batchNumber: formData.batchNumber || null,
        category: formData.category || null,
        certifications: formData.certifications || [],
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Lưu nháp thất bại');

      if (pendingFiles.length > 0 && result.data?.id) {
        await uploadPendingImages(result.data.id);
      }
      setSuccess('Đã lưu bản nháp');
       setTimeout(() => router.push(`/admin/products/${result.data.id}`), 800);
       return true;
     } catch (err: unknown) {
       setError(err instanceof Error ? err.message : String(err));
       return false;
     } finally {
      setLoading(false);
    }
  };

  const handleDraftClick = async () => {
    if (isEditing) {
      // Lưu nháp và ở lại trang chỉnh sửa
      await handleSubmitLocal(formData, 'DRAFT');
    } else {
      await saveDraft();
    }
  };

  const handlePreviewClick = () => {
    const pendingImages = pendingFiles.map((item, index) => ({
      id: `pending-${index}`,
      url: item.previewUrl,
      isPrimary: index === 0 && images.length === 0,
      altText: item.file.name
    }));

    setPreviewData({
      ...formData,
      existingImages: [...images, ...pendingImages]
    });
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
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

  const handleSubmitLocal = async (data: ProductFormData, forceStatus?: 'DRAFT' | 'PUBLISHED') => {
    setLoading(true);

    try {
      const cleanFormData = {
        ...formData,
        usages: formData.usages.filter((u) => u.trim() !== ''),
        usageInstructions: formData.usageInstructions.filter((c) => c.trim() !== ''),
        purchaseLinks: formData.purchaseLinks.filter((l) => l.url.trim() !== '' && l.platform.trim() !== ''),
      };

      const payload = {
        ...cleanFormData,
        status: forceStatus || formData.status,
        manufactureDate: data.expiryType === 'dates' && data.manufactureDate ? new Date(data.manufactureDate).toISOString() : null,
        expiryDate: data.expiryType === 'dates' && data.expiryDate ? new Date(data.expiryDate).toISOString() : null,
        expiresInMonths: data.expiryType === 'months' && data.expiresInMonths ? Number(data.expiresInMonths) : null,
        batchNumber: data.batchNumber || null,
        category: data.category || null,
        certifications: data.certifications || [],
      };

      const isDraft = (forceStatus || formData.status) === 'DRAFT';

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Lưu thất bại');
      }

      // Upload pending images (selected before product was created)
      let imagesOk = true;
      if (pendingFiles.length > 0 && result.data?.id) {
        imagesOk = await uploadPendingImages(result.data.id);
      }

      if (!imagesOk) return; // keep error visible, stop before success/QR dialog

      if (isDraft) {
        setSuccess('Đã lưu bản nháp');
        setTimeout(() => router.push(`/admin/products/${result.data.id}`), 800);
        return;
      }

      setSuccess('Lưu sản phẩm thành công!');

      // Show QR dialog (auto-generated by the server) so admin can print.
      if (result.qrCode) {
        setGeneratedQr({
          code: result.qrCode.code,
          url: result.qrCode.url,
        });
        setShowQrDialog(true);
      } else {
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white\">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Cập nhật thông tin sản phẩm' : 'Điền đầy đủ thông tin sản phẩm'}
          </p>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700">{success}</p>
        </Card>
      )}

      <form id="product-form" onSubmit={handleFormSubmit} className="space-y-6">
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
                aria-invalid={!!fieldErrors.name}
                className={`w-full px-4 py-2.5 rounded-lg border dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                required
              />
              {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="VD: CeraVe, La Roche-Posay..."
                aria-invalid={!!fieldErrors.brandName}
                className={`w-full px-4 py-2.5 rounded-lg border dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.brandName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                required
              />
              {fieldErrors.brandName && <p className="mt-1 text-sm text-red-600">{fieldErrors.brandName}</p>}
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Hạn sử dụng</label>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="expiryType"
                    value="dates"
                    checked={formData.expiryType === 'dates'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Chọn ngày cụ thể</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="expiryType"
                    value="months"
                    checked={formData.expiryType === 'months'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Nhập số tháng hết hạn</span>
                </label>
              </div>

              {formData.expiryType === 'dates' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sản xuất</label>
                    <input
                      type="date"
                      name="manufactureDate"
                      value={formData.manufactureDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày hết hạn</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tháng hết hạn (kể từ NSX)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="expiresInMonths"
                      value={formData.expiresInMonths || ''}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 pr-16"
                      placeholder="Ví dụ: 36 (Hoặc để trống)"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">tháng</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
                <option value="ARCHIVED">Đã lưu trữ</option>
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số lô / Batch number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber || ''}
                onChange={handleChange}
                placeholder="VD: LOT2024-AB12"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">Hiển thị trên trang xác thực QR cho người dùng.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phân loại
              </label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                placeholder="VD: Serum, Kem dưỡng, Sữa rửa mặt..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Đã xác minh (sản phẩm chính hãng)
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Usages & Instructions */}
        <Card className="p-6 shadow-sm border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white\">Công dụng & Hướng dẫn</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Công dụng</label>
              {formData.usages.map((usage, index) => (
                <div key={`usage-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={usage}
                    onChange={(e) => {
                      const newUsages = [...formData.usages];
                      newUsages[index] = e.target.value;
                      setFormData({ ...formData, usages: newUsages });
                    }}
                    placeholder={`Công dụng ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  {formData.usages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newUsages = formData.usages.filter((_, i) => i !== index);
                        setFormData({ ...formData, usages: newUsages });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, usages: [...formData.usages, ''] })}
                className="text-primary-600 border-primary-200 hover:bg-primary-50 rounded-xl"
              >
                + Thêm công dụng
              </Button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Hướng dẫn sử dụng</label>
              {formData.usageInstructions.map((instruction, index) => (
                <div key={`instruction-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...formData.usageInstructions];
                      newInstructions[index] = e.target.value;
                      setFormData({ ...formData, usageInstructions: newInstructions });
                    }}
                    placeholder={`Bước ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  {formData.usageInstructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = formData.usageInstructions.filter((_, i) => i !== index);
                        setFormData({ ...formData, usageInstructions: newInstructions });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, usageInstructions: [...formData.usageInstructions, ''] })}
                className="text-orange-600 border-orange-200 hover:bg-orange-50 rounded-xl"
              >
                + Thêm hướng dẫn
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập tag rồi nhấn Enter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Chứng nhận
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.certifications.map(cert => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {cert}
                    <button type="button" onClick={() => removeCert(cert)}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={certInput}
                onKeyDown={handleCertAdd}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="VD: FDA, CPA, Organic... rồi nhấn Enter"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                  className="w-1/3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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


        {/* Images */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
              <p className="text-sm text-gray-500 mt-0.5">Tối đa 3 ảnh • JPEG, PNG, WebP • Mỗi ảnh tối đa 10MB</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Badge đếm ảnh */}
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                totalImageCount >= 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {totalImageCount}/3 ảnh
              </span>
            </div>
          </div>

          {/* Khu vực upload – ẩn khi đã đủ 3 ảnh */}
          {totalImageCount < 3 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-5 ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50 scale-[1.01]'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800 hover:border-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-900/20'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isDragOver ? 'bg-primary-100' : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
                }`}>
                  <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Còn {3 - totalImageCount} vị trí trống
                  </p>
                </div>
              </label>
            </div>
          )}

          {totalImageCount >= 3 && (
            <div className="mb-5 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đã đạt giới hạn 3 ảnh. Xóa bớt để tải ảnh mới.
            </div>
          )}

          {/* Upload progress */}
          {uploadingImages && (
            <div className="mb-4 flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <svg className="w-4 h-4 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm text-primary-700 dark:text-primary-400">Đang tải ảnh lên...</span>
            </div>
          )}

          {imageNotice && (
            <div className="mb-4 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {imageNotice}
            </div>
          )}

          {/* Grid ảnh – khi tạo mới: hiển thị pendingFiles */}
          {!isEditing && pendingFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {pendingFiles.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow">
                      Chính
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.file.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Placeholder ô trống */}
              {pendingFiles.length < 3 && Array.from({ length: 3 - pendingFiles.length }).map((_, i) => (
                <label key={`placeholder-${i}`} htmlFor="image-upload" className="cursor-pointer">
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50/40 transition-all">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Grid ảnh – khi chỉnh sửa: hiển thị images từ server */}
          {isEditing && images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800\">
                    <Image
                      src={image.url}
                      alt={image.altText || ''}
                      fill
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow">
                      Chính
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Placeholder ô trống khi đang chỉnh sửa */}
              {images.length < 3 && Array.from({ length: 3 - images.length }).map((_, i) => (
                <label key={`placeholder-edit-${i}`} htmlFor="image-upload" className="cursor-pointer">
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50/40 transition-all">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Hướng dẫn khi chưa có ảnh nào và đang tạo mới */}
          {!isEditing && pendingFiles.length === 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <label key={i} htmlFor="image-upload" className="cursor-pointer">
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center gap-2 hover:border-primary-300 hover:bg-primary-50/40 transition-all">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {i === 0 && <span className="text-xs text-gray-400">Ảnh chính</span>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* QR Code display (edit mode) */}
        {isEditing && qrCode && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Mã QR Sản phẩm</h2>
            <div className="flex items-center gap-4">
              <div 
                className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all"
                onClick={() => {
                  setGeneratedQr({ code: qrCode!.code, url: qrCode!.url });
                  setShowQrDialog(true);
                }}
                title="Bấm để phóng to"
              >
                <QRCodeSVG value={qrCode.url} size={80} />
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">Mã code: <span className="text-primary-600 font-bold">{qrCode.code}</span></p>
                <p className="text-sm text-gray-500 mt-1">Bấm vào mã QR để xem lớn, tải về hoặc in.</p>
              </div>
            </div>
          </Card>
        )}
      </form>

      {/* Sticky footer action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Hủy
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handlePreviewClick} disabled={loading}>
              Xem trước
            </Button>
            <Button type="button" variant="outline" onClick={handleDraftClick} disabled={loading} loading={loading && (formData.status === 'DRAFT')}>
              Lưu nháp
            </Button>
            <Button type="submit" form="product-form" disabled={submitting || loading} loading={submitting || loading}>
              {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Dialog - shown after successful save */}
      {generatedQr && (
        <QrCodeDialog
          open={showQrDialog}
          onClose={() => {
            setShowQrDialog(false);
            if (!isEditing) {
              router.push('/admin/products');
            }
          }}
          code={generatedQr.code}
          url={generatedQr.url}
          productName={formData.name}
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white\">Xem trước sản phẩm</h2>
              <button
                type="button"
                onClick={handleClosePreview}
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
                  <div className="relative aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                    {previewData.existingImages && previewData.existingImages.length > 0 ? (
                      <Image
                        src={previewData.existingImages[0].url}
                        alt={previewData.name}
                        fill
                        className="w-full h-full object-cover rounded-xl"
                        unoptimized
                      />
                    ) : (
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white\">{previewData.name}</h3>
                  </div>

                  {previewData.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tên thương hiệu</h4>
                      <p className="text-gray-600 text-sm">{previewData.brandName}</p>
                    </div>
                  )}

                  {/* Usages & Instructions */}
                  <div className="grid grid-cols-2 gap-4">
                    {previewData.usages && previewData.usages.filter((u: string) => u).length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Công dụng
                        </h4>
                        <ul className="space-y-1">
                          {previewData.usages.filter((u: string) => u).map((usage: string, i: number) => (
                            <li key={i} className="text-sm text-green-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{usage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewData.usageInstructions && previewData.usageInstructions.filter((c: string) => c).length > 0 && (
                      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Hướng dẫn sử dụng
                        </h4>
                        <ul className="space-y-1">
                          {previewData.usageInstructions.filter((c: string) => c).map((con: string, i: number) => (
                            <li key={i} className="text-sm text-primary-700 dark:text-primary-400 flex items-start">
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
                      <p className="text-gray-600 dark:text-gray-300 text-sm bg-primary-50 dark:bg-primary-900/20 inline-block px-3 py-1 rounded-full">
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
                    <p className="font-medium text-gray-900 dark:text-white\">{previewData.brandName}</p>
                    {previewData.batchNumber && (
                      <p className="text-gray-600 text-sm mt-1">Số lô: {previewData.batchNumber}</p>
                    )}
                    {previewData.category && (
                      <p className="text-gray-600 text-sm">Phân loại: {previewData.category}</p>
                    )}
                    {previewData.certifications && previewData.certifications.length > 0 && (
                      <p className="text-gray-600 text-sm">Chứng nhận: {previewData.certifications.join(', ')}</p>
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
