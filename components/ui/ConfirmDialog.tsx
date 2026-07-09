import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion() ? 0 : 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !loading && onCancel()}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? 'confirm-dialog-desc' : undefined}
            className={cn(
              'relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800',
              'p-6'
            )}
            initial={prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion() ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion() ? 0 : 0.2, ease: 'easeOut' }}
          >
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {description && (
              <p id="confirm-dialog-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                ref={cancelRef}
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="min-h-[44px]"
              >
                {cancelLabel}
              </Button>
              <Button
                ref={confirmRef}
                variant={danger ? 'danger' : 'primary'}
                onClick={() => onConfirm()}
                loading={loading}
                className="min-h-[44px]"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
