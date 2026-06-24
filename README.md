# ur check — Xác minh nguồn gốc sản phẩm mỹ phẩm

> Nền tảng quét mã vạch (barcode) để kiểm tra tính hợp lệ, ngày sản xuất, hạn sử dụng và thông tin nhà sản xuất mỹ phẩm. Nhanh chóng, miễn phí, không cần đăng ký.

## ✨ Tính năng

- **Quét mã vạch** — Sử dụng camera hoặc upload ảnh để quét mã vạch (EAN-13, EAN-8) trên sản phẩm
- **Xác minh tức thì** — Kiểm tra tính hợp lệ sản phẩm trong vài giây
- **Thông tin chi tiết** — Hiển thị số lô, SKU, ngày sản xuất, hạn sử dụng, nhà sản xuất
- **Responsive** — Tối ưu trải nghiệm trên mọi thiết bị (mobile, tablet, desktop)
- **Hiệu ứng premium** — Glassmorphism, micro-animations, scroll-triggered reveals

## 🛠 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Ngôn ngữ | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Barcode Scanner | html5-qrcode |
| Database | Prisma + Supabase (PostgreSQL) |
| Font | **JetBrains Mono** (duy nhất) |

## 🎨 Design System

### Font

Toàn bộ ứng dụng sử dụng **JetBrains Mono** — không sử dụng bất kỳ font phổ biến nào khác (Inter, Roboto, Segoe UI, Google Sans, Aptos...).

```css
font-family: var(--font-jetbrains-mono), "JetBrains Mono", monospace;
```

### Bảng màu (Primary Palette)

| Token | Mã màu | Mô tả |
|---|---|---|
| `--primary-400` | `#fb923c` | Orange Light |
| `--primary-500` | `#f97316` | Orange Main |
| `--primary-600` | `#ea580c` | Orange Dark |
| `--primary-700` | `#c2410c` | Orange Deeper |
| `--accent-stone` | `#78716c` | Stone Accent |

### Hiệu ứng

- **Glassmorphism** — `backdrop-filter: blur()` + semi-transparent backgrounds
- **Glass hover** — Hiệu ứng mờ kính khi di chuột
- **Hover lift** — Cards nổi lên khi hover
- **Scroll reveals** — Phần tử xuất hiện mượt mà khi cuộn
- **Grain texture** — Lớp texture tinh tế cho cảm giác premium

## 🚀 Bắt đầu

### Yêu cầu

- Node.js 18+
- npm / yarn / pnpm / bun

### Cài đặt

```bash
# Clone repository
git clone https://github.com/XuanSown/urcheck.git
cd urcheck

# Cài đặt dependencies
npm install

# Thiết lập biến môi trường
cp .env.example .env.local
# Sau đó điền giá trị thật cho DATABASE_URL, DIRECT_URL, SUPABASE keys

# Khởi tạo database
npx prisma generate
npx prisma migrate deploy

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📁 Cấu trúc dự án

```
urcheck/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Trang chủ
├── components/            # React Components
│   ├── ui/               # UI primitives (Button, Card, Badge...)
│   ├── Header.tsx        # Navigation header
│   ├── Hero.tsx          # Hero section
│   ├── Footer.tsx        # Footer
│   ├── BarcodeScanner.tsx # Barcode scanner (EAN-13, EAN-8)
│   └── ProductInfo.tsx   # Hiển thị thông tin sản phẩm
├── lib/                   # Utilities & database
├── prisma/               # Database schema & migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🌐 Deploy

Deploy lên [Vercel](https://vercel.com):

```bash
npm run build
```

## 📄 License

© 2026 ur check. Bảo lưu mọi quyền.

Phát triển tại 🇻🇳 Việt Nam.
