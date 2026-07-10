'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function FinalCta({ onScan }: { onScan: () => void }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 sm:px-12 py-10 sm:py-14 text-center shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Sẵn sàng xác thực sản phẩm?</h2>
        <p className="mt-3 text-primary-50 max-w-xl mx-auto">Quét mã QR trên bao bì hoặc nhập mã để biết ngay sản phẩm có chính hãng hay không.</p>
        <Button size="xl" variant="secondary" onClick={onScan} className="mt-6 bg-white text-primary-700 hover:bg-gray-100">Quét mã QR ngay</Button>
      </motion.div>
    </section>
  );
}
