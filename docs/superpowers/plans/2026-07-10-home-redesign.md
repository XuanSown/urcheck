# Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp trang chủ khách hàng (home) thành chuẩn "$10k SaaS" theo phong cách Editorial Trust (tin cậy + sang đẹp), giữ nguyên palette brand và logic verify.

**Architecture:** Tái cấu trúc `app/page.tsx` thành các section component trong `components/home/`. Verify flow (state, API, QrScanner, ProductInfo) giữ nguyên, chỉ được bọc vào section. Thêm Hero 2 cột, HowItWorks, Stats, TrustReasons, FinalCta. Dùng `next/image` cho Unsplash, SVG icons, framer-motion `useReducedMotion`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, framer-motion v12, next/image, i18n (lib/i18n.ts vi/en).

## Global Constraints

- Giữ palette brand (`primary-*`, `accent-stone`) đã dùng; KHÔNG đổi schema/API/auth.
- Motion 150–300ms, dùng `useReducedMotion()` cho mọi animation lặp/scroll.
- Icons: SVG inline (Heroicons-style), không emoji (hiện Hero có emoji `✓⚡🔒` → thay bằng SVG trong Task 1).
- Ảnh Unsplash: link `images.unsplash.com/photo-...?auto=format&fit=crop&w=...&q=80`, qua `next/image` + `sizes` để chống CLS.
- Responsive: 375 / 768 / 1024 / 1440.
- Contrast 4.5:1 light & dark; focus-visible rings.
- Nội dung tiếng Việt placeholder tự biên, dễ sửa sau.
- Mỗi task: `tsc --noEmit` + `npm run build` xanh trước commit.

---

### Task 1: Hero editorial 2 cột + thay emoji bằng SVG

**Files:**
- Modify: `components/Hero.tsx` (toàn bộ)
- Modify: `lib/i18n.ts` (thêm key `hero_trust_*` SVG thay emoji; giữ key cũ)

**Interfaces:**
- Consumes: `Button` (`@/components/ui/Button`), `useLocale` (`@/components/I18nProvider`), `useReducedMotion` từ framaer-motion.
- Produces: component `<Hero onScan={() => void} onExplore={() => void} />` — props mới truyền từ `app/page.tsx`.

- [ ] **Step 1: Thêm i18n keys** vào `lib/i18n.ts` (cả block `vi` và `en`). Giữ `hero_headline_1`, `hero_headline_2`, `hero_subtitle`, `hero_subtitle_highlight`, `hero_cta`. Thêm:
```
hero_trust_1_aria: 'Đã xác minh',
hero_trust_2_aria: 'Nhanh chóng',
hero_trust_3_aria: 'Bảo mật',
```
(Text hiển thị sẽ là label VN/EN có sẵn; chỉ cần aria cho icon. Nếu key chưa có, thêm `hero_trust_1/2/3` tương ứng.)

- [ ] **Step 2: Viết lại `components/Hero.tsx`** thành section 2 cột. Trái: badge verify, headline (giữ 2 dòng gradient), subtitle, 2 CTA (Quét mã QR primary gọi `onScan`; Khám phá outline Link `/discover`). Phải: `next/image` Unsplash skincare + badge "Đã xác minh" góc. Trust indicators dùng SVG (check/shield/bolt) thay emoji. Giữ `useReducedMotion`.

```tsx
'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useLocale } from '@/components/I18nProvider';

export function Hero({ onScan, onExplore }: { onScan?: () => void; onExplore?: () => void }) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const rise = (d = 0.6) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: d, ease: [0.16, 1, 0.3, 1] as const } });
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <motion.span {...rise(0.5)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {t('hero_trust_1')}
          </motion.span>
          <motion.h1 {...rise()} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            <span className="block">{t('hero_headline_1')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400">{t('hero_headline_2')}</span>
          </motion.h1>
          <motion.p {...rise(0.7)} className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
            {t('hero_subtitle')}<span className="hidden sm:inline">{t('hero_subtitle_highlight')}</span>
          </motion.p>
          <motion.div {...rise(0.8)} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button size="xl" onClick={onScan} className="w-full sm:w-auto shadow-xl hover:shadow-primary-500/20">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {t('hero_cta')}
            </Button>
            <Link href="/discover" onClick={onExplore} className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">{t('hero_explore') ?? 'Khám phá sản phẩm'}</Button>
            </Link>
          </motion.div>
        </div>
        <motion.div {...rise(0.9)} className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-square">
            <Image src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" alt="Mỹ phẩm chính hãng được xác thực" fill sizes="(max-width:1024px) 90vw, 45vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 dark:text-white">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Đã xác minh
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Chạy typecheck/build**
```
cd D:\Thực tập\urcheck\urcheck; npx tsc --noEmit; npm run build 2>&1 | Select-Object -Last 6
```
Expected: không lỗi.

- [ ] **Step 4: Commit**
```bash
git add components/Hero.tsx lib/i18n.ts
git commit -m "feat(home): hero editorial 2-col, SVG icons, Unsplash image, onScan/onExplore props"
```

---

### Task 2: Section wrapper + HowItWorks (3 bước)

**Files:**
- Create: `components/home/Section.tsx`
- Create: `components/home/HowItWorks.tsx`

**Interfaces:**
- `Section`: `<Section id? title subtitle children />` — wrapper tiêu đề + motion reveal (`useReducedMotion`, `whileInView once`).
- `HowItWorks`: không prop, hardcode 3 bước VN.

- [ ] **Step 1: Tạo `components/home/Section.tsx`**
```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

export function Section({ id, title, subtitle, children, className = '' }: { id?: string; title?: string; subtitle?: string; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <section id={id} className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-10 sm:mb-14">
            {title && <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>}
            {subtitle && <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Tạo `components/home/HowItWorks.tsx`** — 3 bước grid, số 01/02/03, icon SVG.
```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from './Section';

const steps = [
  { n: '01', title: 'Quét mã QR', desc: 'Mỗi sản phẩm urcheck có mã QR duy nhất. Dùng camera hoặc nhập mã để bắt đầu.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  { n: '02', title: 'Hệ thống xác thực', desc: 'urcheck đối soát mã với nguồn gốc sản phẩm theo thời gian thực, chỉ trong vài giây.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
  { n: '03', title: 'An tâm sử dụng', desc: 'Xem thông tin xuất xứ, hạn dùng và xác nhận chính hãng ngay trên màn hình.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>) },
];

export function HowItWorks() {
  const reduced = useReducedMotion();
  return (
    <Section id="how" title="Cách thức hoạt động" subtitle="Ba bước đơn giản để xác thực mọi sản phẩm">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 hover:shadow-xl transition-shadow">
            <span className="text-4xl font-bold text-primary-500/30 dark:text-primary-400/30">{s.n}</span>
            <div className="mt-3 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              {s.icon({ className: 'w-6 h-6' })}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: typecheck/build** (như Task 1 Step 3). Expected: xanh.

- [ ] **Step 4: Commit**
```bash
git add components/home/Section.tsx components/home/HowItWorks.tsx
git commit -m "feat(home): add Section wrapper + HowItWorks 3-step"
```

---

### Task 3: Stats band + TrustReasons

**Files:**
- Create: `components/home/Stats.tsx`
- Create: `components/home/TrustReasons.tsx`

**Interfaces:** không prop, hardcode nội dung placeholder.

- [ ] **Step 1: Tạo `components/home/Stats.tsx`** — band tương phản tối.
```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';

const stats = [
  { v: '10.000+', l: 'Sản phẩm đã xác thực' },
  { v: '99,9%', l: 'Độ chính xác đối soát' },
  { v: '24/7', l: 'Giám sát nguồn gốc' },
  { v: '0', l: 'Hàng giả được phát hiện' },
];

export function Stats() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-gray-900 dark:bg-gray-950 py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.08 }}>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{s.v}</div>
            <div className="mt-2 text-sm text-gray-400">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Tạo `components/home/TrustReasons.tsx`** — 3 card.
```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from './Section';

const items = [
  { t: 'Mã QR duy nhất', d: 'Mỗi sản phẩm được gắn một mã QR không thể sao chép, liên kết trực tiếp với hồ sơ gốc.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0 3.517-1.009 6.799-3 9.5M5.5 5.5S7 4 9 4s3 1.5 3 1.5m0 0S12.5 7 14.5 7 17 5.5 17 5.5M9 4c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" /></svg>) },
  { t: 'Minh bạch nguồn gốc', d: 'Truy xuất đầy đủ thông tin xuất xứ, lô sản xuất và hạn sử dụng.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
  { t: 'Cộng đồng kiểm chứng', d: 'Người dùng và thương hiệu cùng tham gia báo cáo, xây dựng hệ sinh thái tin cậy.', icon: (p: any) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>) },
];

export function TrustReasons() {
  const reduced = useReducedMotion();
  return (
    <Section title="Tại sao tin tưởng urcheck" subtitle="Nền tảng xác thực được thiết kế để bảo vệ bạn">
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div key={it.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.1 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">{it.icon({ className: 'w-6 h-6' })}</div>
            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{it.t}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{it.d}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: typecheck/build** → xanh.

- [ ] **Step 4: Commit**
```bash
git add components/home/Stats.tsx components/home/TrustReasons.tsx
git commit -m "feat(home): add Stats band + TrustReasons cards"
```

---

### Task 4: FinalCta + ghép toàn bộ vào app/page.tsx

**Files:**
- Create: `components/home/FinalCta.tsx`
- Modify: `app/page.tsx` (HomeInner) — bọc verify vào Section, thêm Hero/HowItWorks/Stats/TrustReasons/FinalCta.

**Interfaces:**
- `FinalCta`: prop `onScan: () => void`.

- [ ] **Step 1: Tạo `components/home/FinalCta.tsx`**
```tsx
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function FinalCta({ onScan }: { onScan: () => void }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 sm:px-12 py-10 sm:py-14 text-center shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Sẵn sàng xác thực sản phẩm?</h2>
        <p className="mt-3 text-primary-50 max-w-xl mx-auto">Quét mã QR trên bao bì hoặc nhập mã để biết ngay sản phẩm có chính hãng hay không.</p>
        <Button size="xl" variant="secondary" onClick={onScan} className="mt-6 bg-white text-primary-700 hover:bg-gray-100">Quét mã QR ngay</Button>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Sửa `app/page.tsx`** — import các component mới; truyền `onScan={() => setShowScanner(true)}` cho Hero/FinalCta; bọc verify block vào `<Section id="verify" title={t('verify_title')} subtitle={t('verify_subtitle')}>`. Thay `<Hero />` thành `<Hero onScan={() => setShowScanner(true)} />`. Giữ nguyên state + hàm verify + QrScanner + ProductInfo. Thứ tự: Header → Hero → Section(verify) → HowItWorks → Stats → TrustReasons → FinalCta → Footer → QrScanner.

Import block (thêm vào đầu, sau import có sẵn):
```tsx
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Stats } from '@/components/home/Stats';
import { TrustReasons } from '@/components/home/TrustReasons';
import { FinalCta } from '@/components/home/FinalCta';
import { Section } from '@/components/home/Section';
```
(thay import Hero cũ — đã có `import { Hero } from '@/components/Hero';`, giữ nguyên).

Bọc verify: đổi
```
<section id="verify" className="py-10 ..."> ... </section>
```
thành dùng `<Section id="verify" title={t('verify_title')} subtitle={t('verify_subtitle')}>` bao lấy card verify (bỏ tiêu đề cũ bên trong). Đảm bảo `max-w-4xl mx-auto` nằm trong children.

- [ ] **Step 3: typecheck/build** → xanh.

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx components/home/FinalCta.tsx
git commit -m "feat(home): assemble redesigned home (hero, verify, how, stats, trust, cta)"
```

---

### Task 5: Verify end-to-end + lint

**Files:** none mới (kiểm thử).

- [ ] **Step 1: Chạy lint trên file thay đổi**
```
cd D:\Thực tập\urcheck\urcheck; npx next lint --file app/page.tsx --file components/Hero.tsx --file components/home/HowItWorks.tsx --file components/home/Stats.tsx --file components/home/TrustReasons.tsx --file components/home/FinalCta.tsx --file components/home/Section.tsx 2>&1 | Select-Object -Last 15
```
Expected: 0 error / 0 warning (trong các file này).

- [ ] **Step 2: Build lần cuối**
```
npm run build 2>&1 | Select-Object -Last 6
```
Expected: thành công.

- [ ] **Step 3: Commit (nếu có fix lint)**
```bash
git add -A
git commit -m "style(home): lint fixes"
```
(nếu không có thay đổi thì bỏ qua).

- [ ] **Step 4: Push main**
```bash
git push origin main
```

---

## Self-Review (tác giả plan)
1. **Spec coverage:** Hero(A+B) ✓ Task1; Verify giữ logic ✓ Task4; HowItWorks ✓ Task2; Stats ✓ Task3; TrustReasons ✓ Task3; FinalCta+Footer ✓ Task4; CTA Hero → /discover ✓ Task1; ảnh Unsplash next/image ✓ Task1; SVG thay emoji ✓ Task1; reduced-motion ✓ mọi task; responsive ✓.
2. **Placeholder scan:** không có TBD; mọi step có code/command.
3. **Type consistency:** `Hero` props `onScan/onExplore` khai báo Task1, dùng Task4. `Section/HowItWorks/Stats/TrustReasons/FinalCta` tên khớp giữa tạo và import. `onScan` truyền nhất quán. OK.
