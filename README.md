<div align="center">

# urcheck

### Verify the origin of cosmetic products — instantly, privately, for free.

[![Version](https://img.shields.io/badge/version-1.0.0-success.svg)](https://github.com/XuanSown/urcheck/releases/tag/v1.0.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](#license)
![Deploy](https://img.shields.io/badge/deployed-Vercel-black)

**urcheck** lets anyone scan a product barcode (EAN‑13 / EAN‑8) and verify
its authenticity, batch number, manufacturer, and shelf life in seconds —
no account required.

[🌐 Live demo](https://urcheck.vercel.app) · [📘 Docs](#getting-started) · [🐛 Report issue](https://github.com/XuanSown/urcheck/issues)

</div>

---

## ✨ Features

- **Instant barcode scanning** — Use your camera or upload an image to decode EAN‑13 / EAN‑8 codes.
- **Real‑time verification** — Check a product's validity in a couple of seconds.
- **Rich product details** — Batch number, SKU, manufacture date, expiry, and manufacturer info.
- **Customer accounts** — Save verification history, earn authenticity badges, and build skincare routines.
- **Admin console** — Manage products, blog posts, and support articles with versioned history & rollback.
- **Internationalized** — Built‑in Vietnamese / English locale switching.
- **Accessible motion** — Every animation respects `prefers-reduced-motion`.
- **Responsive & premium** — Glassmorphism, scroll reveals, and a refined dark mode across all devices.

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| 3D / Visual | React Three Fiber · drei · three |
| Scanner | `html5-qrcode` · `qrcode.react` |
| Database | Prisma 5 + PostgreSQL (Supabase) |
| Auth | `jose` (JWT) · `bcrypt` |
| Validation | Zod |
| Email | Nodemailer |

## 🎨 Design System

The product is built around a single monospace voice and a warm amber accent.

### Typography

The entire UI uses **JetBrains Mono** — no system UI fonts.

```css
font-family: var(--font-jetbrains-mono), "JetBrains Mono", monospace;
```

### Color Palette

| Token | Hex | Use |
| --- | --- | --- |
| `--primary-400` | `#6f92c4` | Navy light |
| `--primary-500` | `#4d72ad` | Navy main |
| `--primary-600` | `#2c4c7e` | Navy dark *(brand)* |
| `--primary-700` | `#244068` | Navy deeper |
| `--accent-stone` | `#78716c` | Stone accent |

### Motion & Texture

- **Liquid glass** — `backdrop-filter: blur()` + translucent surfaces
- **Hover tilt / lift** — cards respond subtly to the pointer
- **Scroll reveals** — elements fade in on scroll
- **Grain overlay** — a fine texture for a premium feel
- **Reduced motion** — all effects disabled when requested by the OS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn / bun
- A PostgreSQL database (Supabase recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/XuanSown/urcheck.git
cd urcheck

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, Supabase keys, JWT secret, SMTP, etc.

# Generate the Prisma client and apply migrations
npx prisma generate
npx prisma migrate deploy

# (Optional) Seed the database with an admin user and sample content
npm run seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production server |
| `npm run lint` | Lint the codebase |
| `npm run seed` | Seed the database |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply migrations to the database |

## 📁 Project Structure

```
urcheck/
├── app/                 # Next.js App Router
│   ├── api/             # API routes (admin, customer, qr, health)
│   ├── admin/           # Admin console (products, blog, support)
│   ├── blog/            # Public blog
│   ├── support/         # Support center
│   ├── customer/        # Customer portal
│   └── (marketing)/     # about, faq, brands, integrations…
├── components/          # React components grouped by feature
│   └── ui/              # Shared UI primitives
├── lib/                 # Utilities, auth, i18n, session helpers
├── prisma/              # Schema, migrations, seed
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## ☁️ Deployment

Deploy to [Vercel](https://vercel.com) in one click:

```bash
npm run build
```

Make sure the environment variables from `.env.example` are set in your
Vercel project settings. The app ships a `/api/health` endpoint you can use
as a deploy hook health check.

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss changes before
submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: ..."`)
4. Push and open a pull request

## 📄 License

Proprietary © 2026 urcheck. All rights reserved.

Built with care in 🇻🇳 Vietnam.
