'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ProductInfoProps {
  product: Product;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ProductInfo({ product }: ProductInfoProps) {
  const isExpired = new Date(product.expiryDate) < new Date();
  const isVerified = product.verified && !isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500">
        {/* Product Image */}
        <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900">
              <svg
                className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <Badge variant={isVerified ? 'success' : 'error'} className="shadow-lg backdrop-blur-sm bg-white/80 border">
              {isVerified ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hợp lệ
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isExpired ? 'Hết hạn' : 'Không hợp lệ'}
                </span>
              )}
            </Badge>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Product Details */}
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{product.name}</h2>

          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{product.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Batch Number */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Số lô / Batch</p>
              <p className="font-semibold text-primary-600 dark:text-primary-500 text-sm sm:text-lg break-all">{product.batchNumber}</p>
            </motion.div>

            {/* SKU */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Mã SP (SKU)</p>
              <p className="font-semibold text-primary-600 dark:text-primary-500 text-sm sm:text-lg break-all">{product.sku}</p>
            </motion.div>

            {/* Manufacture Date */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Ngày sản xuất</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{formatDate(product.manufactureDate)}</p>
            </motion.div>

            {/* Expiry Date */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Hạn sử dụng</p>
              <p className={`font-semibold text-sm sm:text-base ${isExpired ? 'text-red-500' : 'text-primary-600 dark:text-primary-500'}`}>
                {formatDate(product.expiryDate)}
              </p>
            </motion.div>
          </div>

          {/* Company Info */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wider">Thông tin nhà sản xuất</h3>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                <span className="font-medium text-gray-900 dark:text-white">Công ty:</span> {product.companyName}
              </p>
              {product.companyAddress && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Địa chỉ:</span> {product.companyAddress}
                </p>
              )}
            </div>
          </div>

          {/* Verification Info */}
          <motion.div
            className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl transition-all duration-300 ${isVerified
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className={`text-xs sm:text-sm ${isVerified ? 'text-primary-700 dark:text-primary-400' : 'text-red-700 dark:text-red-400'}`}>
              {isVerified ? (
                <span className="flex items-start sm:items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sản phẩm đã được xác minh là chính hãng và còn trong thời hạn sử dụng.
                </span>
              ) : (
                <span className="flex items-start sm:items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isExpired
                    ? 'Sản phẩm đã quá hạn sử dụng. Không nên sử dụng.'
                    : 'Sản phẩm không được xác minh trong hệ thống.'}
                </span>
              )}
            </p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Scan another button */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="#scanner">
          <Button
            size="lg"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transform hover:scale-[1.03] active:scale-95 transition-all duration-300 group"
          >
            <motion.svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </motion.svg>
            <span>Quét mã QR khác</span>
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
