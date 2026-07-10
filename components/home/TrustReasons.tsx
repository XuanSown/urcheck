'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from './Section';

const items = [
  { t: 'Mã QR duy nhất', d: 'Mỗi sản phẩm được gắn một mã QR không thể sao chép, liên kết trực tiếp với hồ sơ gốc.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0 3.517-1.009 6.799-3 9.5M5.5 5.5S7 4 9 4s3 1.5 3 1.5m0 0S12.5 7 14.5 7 17 5.5 17 5.5M9 4c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" /></svg>) },
  { t: 'Minh bạch nguồn gốc', d: 'Truy xuất đầy đủ thông tin xuất xứ, lô sản xuất và hạn sử dụng.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
  { t: 'Cộng đồng kiểm chứng', d: 'Người dùng và thương hiệu cùng tham gia báo cáo, xây dựng hệ sinh thái tin cậy.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>) },
];

export function TrustReasons() {
  const reduced = useReducedMotion();
  return (
    <Section title="Tại sao tin tưởng urcheck" subtitle="Nền tảng xác thực được thiết kế để bảo vệ bạn">
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div key={it.t} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.1 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">{it.icon({ className: 'w-6 h-6' })}</div>
            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{it.t}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{it.d}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
