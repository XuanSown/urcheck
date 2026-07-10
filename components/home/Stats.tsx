'use client';
import { motion, useReducedMotion } from 'framer-motion';

const stats = [
  { v: '10.000+', l: 'Sản phẩm đã xác thực' },
  { v: '99,9%', l: 'Độ chính xác đối soát' },
  { v: '24/7', l: 'Giám sát nguồn gốc' },
  { v: '0', l: 'Hàng giả được phát hiện' },
];

export function Stats() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-gray-900 dark:bg-gray-950 py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.08 }}>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{s.v}</div>
            <div className="mt-2 text-sm text-gray-400">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
