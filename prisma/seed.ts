import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Predefined EAN barcodes for seed products
const SEED_BARCODES: Record<string, string> = {
  'ORD-VC10-30ML': '8934012345670',    // EAN-13 (VN prefix)
  'BOJ-SUN50-50ML': '8801234567893',    // EAN-13 (KR prefix)
  'HL-OILCL-150ML': '4987176456786',    // EAN-13 (JP prefix)
  'TRD-COL-30ML': '88012346',           // EAN-8 (KR, smaller product)
};

// Helper: ngày hợp lệ trong tương lai (số tháng từ hôm nay)
function futureDate(monthsAhead: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d;
}

// Helper: ngày hợp lệ trong quá khứ
function pastDate(monthsAgo: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

async function main() {
  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Clear existing data
  await prisma.scanLog.deleteMany();
  await prisma.barcode.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVersion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();

  // Create default admin user
  await prisma.adminUser.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@urcheck.vn',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user: admin / admin123');

  // Sample products — ngày tính tương đối so với hiện tại
  const products = [
    {
      // 1. VALID: sản xuất gần đây, HSD còn 2 năm
      name: 'Serum Vitamin C 10% - The Ordinary',
      description: 'Serum chứa 10% Vitamin C giúp sáng da, giảm thâm và chống lão hóa.',
      sku: 'ORD-VC10-30ML',
      batchNumber: 'B20240615-01',
      manufactureDate: pastDate(12),  // 12 tháng trước
      expiryDate: futureDate(24),     // 24 tháng tới
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
      companyName: 'DECIEM Beauty Group Inc.',
      companyAddress: 'Toronto, Ontario, Canada',
      pros: ['Giá phải chăng', 'Hiệu quả sáng da rõ rệt', 'Kết cấu nhẹ, thấm nhanh'],
      cons: ['Có thể gây châm chích trên da nhạy cảm'],
      tags: ['serum', 'vitamin-c', 'sáng-da', 'chống-lão-hóa'],
      verified: true,
    },
    {
      // 2. VALID: mới sản xuất, HSD còn ~2 năm
      name: 'Kem chống nắng UV Aqua Gel - Beauty of Joseon',
      description: 'Kem chống nắng phổ rộng SPF50+ PA++++ với kết cấu mỏng nhẹ, dễ thấm.',
      sku: 'BOJ-SUN50-50ML',
      batchNumber: 'KJ20240520-88',
      manufactureDate: pastDate(8),
      expiryDate: futureDate(28),
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      companyName: 'Beauty of Joseon Co., Ltd.',
      companyAddress: 'Seoul, South Korea',
      pros: ['SPF50+ PA++++', 'Không nhờn rít', 'Phù hợp da nhạy cảm'],
      cons: ['Cần apply lại sau 2-3 tiếng'],
      tags: ['chống-nắng', 'spf50', 'korean-skincare'],
      verified: true,
    },
    {
      // 3. VALID: HSD còn ~1 năm
      name: 'Tẩy trang dầu - HADA LABO',
      description: 'Tẩy trang dầu nhẹ dịu, không gây kích ứng, phù hợp với da nhạy cảm.',
      sku: 'HL-OILCL-150ML',
      batchNumber: 'HL20240701-12',
      manufactureDate: pastDate(6),
      expiryDate: futureDate(18),
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
      companyName: 'Rohto Pharmaceutical Co., Ltd.',
      companyAddress: 'Osaka, Japan',
      pros: ['Làm sạch sâu', 'Không gây khô da', 'Không mùi'],
      cons: ['Đóng gói chai thủy tinh dễ vỡ'],
      tags: ['tẩy-trang', 'dầu-tẩy-trang', 'japanese-skincare'],
      verified: true,
    },
    {
      // 4. EXPIRED (cố ý): để test luồng "hết hạn"
      name: 'Tinh chất collagen - Torriden',
      description: 'Tinh chất collagen peptide kết hợp acid hyaluronic giúp tăng độ đàn hồi cho da.',
      sku: 'TRD-COL-30ML',
      batchNumber: 'TR20240601-45',
      manufactureDate: pastDate(24),   // sx 2 năm trước
      expiryDate: pastDate(6),         // hết hạn 6 tháng trước
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
      companyName: 'Torriden Inc.',
      companyAddress: 'Seoul, South Korea',
      pros: ['Công thức nhẹ nhàng'],
      cons: ['Đã hết hạn sử dụng'],
      tags: ['collagen', 'serum', 'expired-test'],
      verified: true,
    },
  ];

  // Create products with barcodes
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Assign barcode (EAN-13 or EAN-8 format)
    const barcodeValue = SEED_BARCODES[product.sku];

    await prisma.barcode.create({
      data: {
        code: barcodeValue,
        productId: product.id,
        scanCount: 0,
      },
    });

    const expired = product.expiryDate < new Date();
    console.log(
      `Created product: ${product.name}\n` +
      `  barcode: ${barcodeValue} | status: ${expired ? '❌ EXPIRED' : '✅ VALID'}`
    );
  }

  console.log('\n✅ Seed completed successfully!');
  console.log(`Total products: ${products.length}`);
  console.log(`\n📋 Test barcodes:`);
  console.log(`  - 8934012345670  → Serum Vitamin C (VALID)`);
  console.log(`  - 8801234567893  → Kem chống nắng BOJ (VALID)`);
  console.log(`  - 4987176456786  → Tẩy trang HADA LABO (VALID)`);
  console.log(`  - 88012346       → Collagen Torriden (EXPIRED - để test)`);
  console.log(`\n🔑 Admin login: admin / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
