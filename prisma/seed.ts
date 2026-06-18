import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.scanLog.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.product.deleteMany();

  // Sample products
  const products = [
    {
      name: 'Serum Vitamin C 10% - The Ordinary',
      description: 'Serum chứa 10% Vitamin C giúp sáng da, giảm thâm và chống lão hóa.',
      sku: 'ORD-VC10-30ML',
      batchNumber: 'B20240615-01',
      manufactureDate: new Date('2024-06-15'),
      expiryDate: new Date('2026-06-15'),
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
      companyName: 'DECIEM Beauty Group Inc.',
      companyAddress: 'Toronto, Ontario, Canada',
      verified: true,
    },
    {
      name: 'Kem chống nắng UV Aqua Gel - Beauty of Joseon',
      description: 'Kem chống nắng phổ rộng SPF50+ PA++++ với kết cấu mỏng nhẹ, dễ thấm.',
      sku: 'BOJ-SUN50-50ML',
      batchNumber: 'KJ20240520-88',
      manufactureDate: new Date('2024-05-20'),
      expiryDate: new Date('2026-05-20'),
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      companyName: 'Beauty of Joseon Co., Ltd.',
      companyAddress: 'Seoul, South Korea',
      verified: true,
    },
    {
      name: 'Tẩy trang dầu - HADA LABO',
      description: 'Tẩy trang dầu nhẹ dịu, không gây kích ứng, phù hợp với da nhạy cảm.',
      sku: 'HL-OILCL-150ML',
      batchNumber: 'HL20240701-12',
      manufactureDate: new Date('2024-07-01'),
      expiryDate: new Date('2026-07-01'),
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
      companyName: 'Rohto Pharmaceutical Co., Ltd.',
      companyAddress: 'Osaka, Japan',
      verified: true,
    },
    {
      name: 'Tinh chất collagen - Torriden',
      description: 'Tinh chất collagen peptide kết hợp acid hyaluronic giúp tăng độ đàn hồi cho da.',
      sku: 'TRD-COL-30ML',
      batchNumber: 'TR20240601-45',
      manufactureDate: new Date('2024-06-01'),
      expiryDate: new Date('2024-12-01'),
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
      companyName: 'Torriden Inc.',
      companyAddress: 'Seoul, South Korea',
      verified: true,
    },
  ];

  // Create products with QR codes
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Generate QR code (simulated - in production this would be a real QR code)
    const qrCode = `UR-${product.sku}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await prisma.qrCode.create({
      data: {
        code: qrCode,
        productId: product.id,
        scanCount: 0,
      },
    });

    console.log(`Created product: ${product.name} with QR code: ${qrCode}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log(`Total products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
