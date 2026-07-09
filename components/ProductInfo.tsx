'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';
import { primaryImageUrl } from '@/lib/product-utils';

interface ProductInfoProps {
  product: Product;
}

function formatDate(date: string | Date | null | undefined, unknownText: string): string {
  if (!date) return unknownText;
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { t } = useLocale();
  const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
  const isVerified = product.verified && !isExpired;

  // Handle multiple images
  const images = product.images && product.images.length > 0
    ? product.images
    : primaryImageUrl(product.images) ? [{ id: '1', url: primaryImageUrl(product.images)!, isPrimary: true, sortOrder: 0, productId: product.id, createdAt: new Date().toISOString() }] : [];
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto pb-8"
    >
      <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* Verification Status Banner */}
        <div className={`px-6 py-4 flex items-center justify-center gap-3 backdrop-blur-md ${isVerified ? 'bg-green-500/10 border-b border-green-500/20' : 'bg-red-500/10 border-b border-red-500/20'}`}>
           <span className="relative flex h-3 w-3">
            {isVerified && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span className={`font-semibold tracking-wide uppercase text-sm ${isVerified ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {isVerified ? t('product_status_authentic') : (isExpired ? t('product_status_expired') : t('product_status_invalid'))}
          </span>
        </div>

        <div className="flex flex-col md:flex-row">
          
          {/* Left: Image Gallery */}
          <div className="md:w-5/12 p-4 md:p-6 flex flex-col gap-4 animate-fade-up delay-100">
            <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden glass shadow-inner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  {images.length > 0 ? (
                    <Image
                      src={images[activeImageIndex].url}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:bg-white/50'}`}
                  >
                    <Image src={img.url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="md:w-7/12 p-4 md:p-6 md:pl-0 flex flex-col gap-4 sm:gap-6 animate-fade-up delay-200">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">{product.name}</h1>
              <p className="text-primary-600 dark:text-primary-400 font-medium text-sm tracking-wide uppercase">{product.brandName}</p>
            </div>

            {product.description && (
              <div className="glass glass-hover p-5 rounded-2xl animate-fade-up delay-300">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Date Cards */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up delay-400">
              <div className="glass glass-hover p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('product_mfg_date')}</span>
                <span className="font-extrabold text-gray-800 dark:text-gray-200">{formatDate(product.manufactureDate, t('product_unknown_date'))}</span>
              </div>
              <div className="glass glass-hover p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('product_exp_date')}</span>
                <span className={`font-extrabold ${isExpired ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>{formatDate(product.expiryDate, t('product_unknown_date'))}</span>
              </div>
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up delay-500">
              {(product.skinType || product.suitableFor) && (
                <div className="space-y-4 col-span-2 sm:col-span-1 glass glass-hover p-5 rounded-2xl">
                  {product.skinType && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">{t('product_skin_type')}</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{product.skinType}</p>
                    </div>
                  )}
                  {product.suitableFor && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">{t('product_suitable_for')}</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{product.suitableFor}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Usages & Instructions */}
              {(product.usages?.length > 0 || product.usageInstructions?.length > 0) && (
                <div className="space-y-4 col-span-2 sm:col-span-1 glass glass-hover p-5 rounded-2xl">
                  {product.usages?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-green-600 uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t('product_usages')}</span>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 mt-1 space-y-1">
                        {product.usages.map((usage, i) => <li key={i} className="flex items-start before:content-['•'] before:mr-1 before:text-green-500">{usage}</li>)}
                      </ul>
                    </div>
                  )}
                  {product.usageInstructions?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-primary-500 uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {t('product_usage_instructions')}</span>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 mt-1 space-y-1">
                        {product.usageInstructions.map((instruction, i) => <li key={i} className="flex items-start before:content-['•'] before:mr-1 before:text-primary-400">{instruction}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ingredient Analysis */}
            {product.ingredientAnalysis && (
              <div className="glass glass-hover p-5 rounded-2xl animate-fade-up delay-600">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">{t('product_ingredients')}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.ingredientAnalysis}</p>
              </div>
            )}
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-up delay-700">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 glass text-gray-700 dark:text-gray-200 font-medium text-xs rounded-full shadow-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Purchase Links */}
            {product.purchaseLinks && product.purchaseLinks.length > 0 && (
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-fade-up delay-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">{t('product_buy_at')}</span>
                <div className="flex flex-wrap gap-3">
                  {product.purchaseLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                      <Button variant="primary" size="lg" className="group">
                        {link.platform}
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 0 00-2 2v10a2 0 002 2h10a2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
