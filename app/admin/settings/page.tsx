'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/Toast';

interface CurrentAdmin {
  id: string;
  username?: string;
  email?: string;
  twoFactorEnabled?: boolean;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const [showEnable, setShowEnable] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    fetch('/api/admin/verify')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setAdmin(d.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const startEnable = async () => {
    setEnabling(true);
    try {
      const res = await fetch('/api/admin/2fa/enable', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi');
      setSecret(data.data.secret);
      setOtpauthUri(data.data.otpauthUri);
      setShowEnable(true);
    } catch (err: any) {
      toast({ type: 'error', title: err.message || 'Lỗi' });
    } finally {
      setEnabling(false);
    }
  };

  const confirmEnable = async () => {
    setEnabling(true);
    try {
      const res = await fetch('/api/admin/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi');
      toast({ type: 'success', title: 'Đã bật xác thực 2 bước' });
      setShowEnable(false);
      setCode('');
      setSecret('');
      setOtpauthUri('');
      if (admin) setAdmin({ ...admin, twoFactorEnabled: true });
    } catch (err: any) {
      toast({ type: 'error', title: err.message || 'Lỗi' });
    } finally {
      setEnabling(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Cài đặt" description="Cấu hình tài khoản quản trị" />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Xác thực 2 bước</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Tăng cường bảo mật bằng mã TOTP (Google Authenticator / Authy).
        </p>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>{' '}
            {admin?.twoFactorEnabled ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Đã bật
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Chưa bật
              </span>
            )}
          </div>
          {!admin?.twoFactorEnabled && (
            <Button onClick={startEnable} loading={enabling}>
              Bật 2FA
            </Button>
          )}
        </div>
      </Card>

      <Modal
        open={showEnable}
        onClose={() => setShowEnable(false)}
        title="Bật xác thực 2 bước"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEnable(false)} disabled={enabling}>
              Hủy
            </Button>
            <Button onClick={confirmEnable} loading={enabling}>
              Xác nhận
            </Button>
          </div>
        }
      >
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Quét mã QR bằng ứng dụng xác thực:</li>
        </ol>
        <code className="block mt-2 mb-3 break-all bg-gray-100 dark:bg-gray-800 text-xs p-3 rounded-lg text-gray-800 dark:text-gray-200">
          {otpauthUri}
        </code>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Hoặc nhập thủ công (base32): <span className="font-mono">{secret}</span>
        </p>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nhập mã 6 số từ ứng dụng
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </Modal>
    </div>
  );
}
