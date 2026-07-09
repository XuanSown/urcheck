-- ============================================================
-- Tạo admin user mặc định (admin / admin123)
-- Chạy trên Supabase SQL Editor. Chạy lại an toàn (ON CONFLICT).
-- ============================================================

INSERT INTO "AdminUser" ("id", "username", "password", "email", "role", "isActive", "createdAt", "updatedAt")
VALUES (
  'cladmin000000000000000001',
  'admin',
  '$2b$10$8CZ0tpv3rufVCArfHZWZreW0F9UL.FImzWCXh2OojScxnPHfjlYm2',
  'admin@urcheck.vn',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;
