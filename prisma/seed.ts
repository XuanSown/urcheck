import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

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

// Seed QR helpers (mirror lib/qr-utils.ts so seed works without env vars).
function seedGenerateQrCode(productName: string, salt: string): string {
  const hash = createHash('sha256')
    .update(`${productName}::${salt}::${randomBytes(4).toString('hex')}`)
    .digest('hex')
    .toUpperCase();
  return hash.substring(0, 6).replace(/[^A-Z0-9]/g, 'X');
}

async function main() {
  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Clear existing data (preserve schema order to avoid FK issues)
  await prisma.scanLog.deleteMany();
  await prisma.qrCode.deleteMany();
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

  // Create products with QR codes
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Auto-generate QR code (active flow)
    const qrCodeValue = seedGenerateQrCode(product.name, product.id);
    const qrUrl = `http://localhost:3000/?q=${qrCodeValue}`;
    await prisma.qrCode.create({
      data: {
        code: qrCodeValue,
        url: qrUrl,
        productId: product.id,
        scanCount: 0,
        isActive: true,
      },
    });

    const expired = product.expiryDate ? product.expiryDate < new Date() : false;
    console.log(
      `Created product: ${product.name}\n` +
      `  status: ${expired ? '❌ EXPIRED' : '✅ VALID'}\n` +
      `  QR:      ${qrCodeValue}  →  ${qrUrl}`
    );
  }

  console.log('\n✅ Seed completed successfully!');
  console.log(`Total products: ${products.length}`);
  console.log(`\n🔑 Admin login: admin / admin123`);
  console.log(`\n💡 To find generated QR codes, look at the seed output above or run:`);
  console.log(`   npx prisma studio   →   open "qr_codes" table`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
