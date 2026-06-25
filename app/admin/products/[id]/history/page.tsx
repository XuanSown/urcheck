'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format-utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Version {
  id: string;
  productSnapshot: any;
  imageSnapshot: any;
  changeReason: string | null;
  changedBy: string;
  createdAt: string;
}

interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export default function VersionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [diffs, setDiffs] = useState<VersionDiff[]>([]);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}/versions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải lịch sử phiên bản');
      }

      setVersions(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchVersions();
    }
  }, [productId, fetchVersions]);

  const compareVersions = (oldData: any, newData: any): VersionDiff[] => {
    const changes: VersionDiff[] = [];

    if (!oldData || !newData) return changes;

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      const oldVal = oldData[key];
      const newVal = newData[key];

      // Special handling for arrays
      if (Array.isArray(oldVal) && Array.isArray(newVal)) {
        if (JSON.stringify(oldVal.sort()) !== JSON.stringify(newVal.sort())) {
          changes.push({
            field: key,
            oldValue: oldVal,
            newValue: newVal,
          });
        }
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    });

    return changes;
  };

  const handleViewVersion = (version: Version) => {
    setSelectedVersion(version);
  };

  const handleRollback = async (versionId: string) => {
    setShowRollbackConfirm(false);

    try {
      const response = await fetch(`/api/admin/products/${productId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể khôi phục phiên bản');
      }

      alert('Khôi phục phiên bản thành công!');
      fetchVersions();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setRollingBack(null);
    }
  };

  const getChangeLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: 'Tên sản phẩm',
      description: 'Mô tả',
      sku: 'Mã SKU',
      batchNumber: 'Số lô',
      manufactureDate: 'Ngày sản xuất',
      expiryDate: 'Ngày hết hạn',
      skinType: 'Loại da',
      suitableFor: 'Phù hợp cho',
      pros: 'Ưu điểm',
      cons: 'Nhược điểm',
      ingredientAnalysis: 'Phân tích thành phần',
      tags: 'Tags',
      status: 'Trạng thái',
      companyName: 'Tên công ty',
      companyWebsite: 'Website công ty',
      purchaseLinks: 'Link mua hàng',
      images: 'Hình ảnh',
      barcodes: 'Mã QR',
    };
    return labels[field] || field;
  };

  const formatValue = (value: any, field: string): string => {
    if (value === null || value === undefined) return '(trống)';

    if (field === 'status') {
      const statusMap: Record<string, string> = {
        DRAFT: 'Bản nháp',
        PUBLISHED: 'Đã xuất bản',
        ARCHIVED: 'Đã lưu trữ',
      };
      return statusMap[value] || value;
    }

    if (field === 'manufactureDate' || field === 'expiryDate') {
      return formatDate(value);
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử phiên bản</h1>
          <p className="text-gray-500 mt-1">Xem và khôi phục các phiên bản trước của sản phẩm</p>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {versions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử phiên bản</h3>
          <p className="text-gray-500">Lịch sử sẽ được tạo khi bạn cập nhật sản phẩm</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <Card key={version.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index === 0 ? 'Phiên bản hiện tại' : `Phiên bản #${versions.length - index}`}
                    </span>
                    {version.changeReason && (
                      <span className="text-xs text-gray-500">- {version.changeReason}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(version.createdAt)}</span>
                    <span>•</span>
                    <span>Thay đổi bởi: {version.changedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewVersion(version)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem chi tiết
                  </Button>

                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setRollingBack(version.id);
                        setShowRollbackConfirm(true);
                      }}
                      disabled={rollingBack === version.id}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Khôi phục
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Version Detail Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedVersion.id === versions[0]?.id ? 'Phiên bản hiện tại' : 'Chi tiết phiên bản'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedVersion.createdAt)} - {selectedVersion.changeReason || 'Không có lý do'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedVersion(null);
                  setDiffs([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current version snapshot */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dữ liệu phiên bản</h3>
                  <div className="space-y-3">
                    {selectedVersion.productSnapshot && Object.entries(selectedVersion.productSnapshot).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">{getChangeLabel(key)}</div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">{formatValue(value, key)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Previous version for comparison */}
                {selectedVersion.id !== versions[0]?.id && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Phiên bản trước đó</h3>
                    <div className="space-y-3">
                      {selectedVersion.productSnapshot && Object.entries(selectedVersion.productSnapshot).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">{getChangeLabel(key)}</div>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{formatValue(value, key)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rollback confirmation modal */}
      {showRollbackConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Khôi phục phiên bản?</h3>
              <p className="text-gray-500">
                Hành động này sẽ khôi phục sản phẩm về trạng thái của phiên bản đã chọn. Thao tác này có thể không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRollbackConfirm(false)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => rollingBack && handleRollback(rollingBack)}
                disabled={!rollingBack}
              >
                Khôi phục
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
