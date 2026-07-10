'use client';
import type { SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from './Section';

const steps = [
  { n: '01', title: 'Quét mã QR', desc: 'Mỗi sản phẩm urcheck có mã QR duy nhất. Dùng camera hoặc nhập mã để bắt đầu.', icon: (p: SVGProps<SVGSVGElement>) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  { n: '02', title: 'Hệ thống xác thực', desc: 'urcheck đối soát mã với nguồn gốc sản phẩm theo thời gian thực, chỉ trong vài giây.', icon: (p: SVGProps<SVGSVGElement>) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
  { n: '03', title: 'An tâm sử dụng', desc: 'Xem thông tin xuất xứ, hạn dùng và xác nhận chính hãng ngay trên màn hình.', icon: (p: SVGProps<SVGSVGElement>) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>) },
];

export function HowItWorks() {
  const reduced = useReducedMotion();
  return (
    <Section id="how" title="Cách thức hoạt động" subtitle="Ba bước đơn giản để xác thực mọi sản phẩm">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 hover:shadow-xl transition-shadow">
            <span className="text-4xl font-bold text-primary-500/30 dark:text-primary-400/30">{s.n}</span>
            <div className="mt-3 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              {s.icon({ className: 'w-6 h-6' })}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
