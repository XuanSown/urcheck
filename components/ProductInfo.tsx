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
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square sm:aspect-[4/3] bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-gray-300"
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
          <div className="absolute top-4 right-4">
            <Badge variant={isVerified ? 'success' : 'error'} className="shadow-lg">
              {isVerified ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
        </div>

        {/* Product Details */}
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">{product.name}</h2>

          {product.description && (
            <p className="text-gray-600 mb-6">{product.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Batch Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Số lô / Batch</p>
              <p className="font-semibold text-primary-700 text-lg">{product.batchNumber}</p>
            </div>

            {/* SKU */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Mã sản phẩm (SKU)</p>
              <p className="font-semibold text-primary-700 text-lg">{product.sku}</p>
            </div>

            {/* Manufacture Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Ngày sản xuất</p>
              <p className="font-semibold text-primary-700">{formatDate(product.manufactureDate)}</p>
            </div>

            {/* Expiry Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Hạn sử dụng</p>
              <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-primary-700'}`}>
                {formatDate(product.expiryDate)}
              </p>
            </div>
          </div>

          {/* Company Info */}
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="font-semibold text-primary-900 mb-3">Thông tin nhà sản xuất</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Công ty:</span> {product.companyName}
              </p>
              {product.companyAddress && (
                <p className="text-gray-700">
                  <span className="font-medium">Địa chỉ:</span> {product.companyAddress}
                </p>
              )}
            </div>
          </div>

          {/* Verification Info */}
          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              {isVerified ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sản phẩm đã được xác minh là chính hãng và còn trong thời hạn sử dụng.
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
          </div>
        </CardContent>
      </Card>

      {/* Scan another button */}
      <div className="mt-8 text-center">
        <Link href="#scanner">
          <Button size="lg" className="shadow-lg">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Quét mã khác
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
