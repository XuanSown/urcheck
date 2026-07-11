'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AdminAccount {
  id: string;
  username: string;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface AccountFormData {
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    username: '',
    email: '',
    password: '',
    isActive: true,
  });

  const fetchAccounts = useCallback(() => {
    fetch('/api/admin/accounts')
      .then((res) => res.json())
      .then((data: { success: boolean; data?: AdminAccount[]; error?: string }) => {
        setError(null);
        if (data.success) {
          setAccounts(data.data ?? []);
        } else {
          setError(data.error ?? 'Đã xảy ra lỗi');
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        // Remove from list
        setAccounts(accounts.filter(acc => acc.id !== id));
      } else {
        alert(data.error);
      }
    } catch {
      alert('Đã xảy ra lỗi khi xóa tài khoản');
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ username: '', email: '', password: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (account: AdminAccount) => {
    setEditingId(account.id);
    setFormData({
      username: account.username,
      email: account.email || '',
      password: '', // don't load existing password
      isActive: account.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingId ? `/api/admin/accounts/${editingId}` : '/api/admin/accounts';
      const method = editingId ? 'PUT' : 'POST';
      
      const payload: AccountFormData = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchAccounts(); // Refresh list
      } else {
        alert(data.error);
      }
    } catch {
      alert('Đã xảy ra lỗi khi lưu tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Thêm, sửa, xóa tài khoản quản trị viên
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm tài khoản
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài khoản</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đăng nhập lần cuối</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{account.username}</div>
                      {account.email && <div className="text-xs text-gray-500">{account.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        account.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {account.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {account.lastLogin ? new Date(account.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(account.id, account.username)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Chưa có tài khoản nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản Admin'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên đăng nhập {editingId ? '' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required={!editingId}
                  disabled={!!editingId}
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu {editingId ? <span className="text-xs text-gray-500 font-normal">(bỏ trống nếu không đổi)</span> : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
                  placeholder={editingId ? "Nhập mật khẩu mới" : "Nhập mật khẩu"}
                />
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Khóa tài khoản</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo tài khoản')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
