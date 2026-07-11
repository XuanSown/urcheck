'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/admin/PageHeader';
import { formatDateTime } from '@/lib/format-utils';
import { useToast } from '@/components/ui/Toast';

interface LoginLog {
  id: string;
  username: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface LogsResponse {
  success: boolean;
  data: { logs: LoginLog[] };
}

export default function AdminLoginLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(() => {
    fetch('/api/admin/login-logs')
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }: { response: Response; data: LogsResponse & { error?: string } }) => {
        setError(null);
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Lỗi khi tải dữ liệu');
        }
        setLogs(data.data.logs);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        setError(message);
        toast({ type: 'error', title: message });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký đăng nhập"
        description="Lịch sử các lần đăng nhập quản trị (50 gần nhất)"
      />

      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      {loading ? (
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có nhật ký</h3>
          <p className="text-gray-500 dark:text-gray-400">Chưa có lần đăng nhập nào được ghi nhận</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Tài khoản</th>
                  <th className="px-4 py-3 font-medium">Thành công</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{log.username}</td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Thất bại
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
