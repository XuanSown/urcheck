'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">ur check</span>
            </Link>
            <p className="text-gray-300 text-sm">
              Giải pháp kiểm tra nguồn gốc sản phẩm mỹ phẩm thông minh, nhanh chóng và tin cậy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#how-it-works"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Cách hoạt động
                </Link>
              </li>
              <li>
                <Link
                  href="#support"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Thông tin pháp lý</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#terms"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="#privacy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} ur check. Tất cả các quyền được bảo lưu.
          </p>
          <p className="text-gray-400 text-sm mt-2 sm:mt-0">
            Phát triển với ❤️ tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
