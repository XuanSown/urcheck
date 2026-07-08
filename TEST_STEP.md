# HAND-DO HƯỚNG DẪN TEST THỦ CÔNG

> Chạy: `npm run dev` → http://localhost:3000
> Mỗi mục ghi rõ **kết quả đúng** và **lỗi thường gặp**.

---

## Auth

| # | Bước | Kết quả đúng | Lỗi thường gặp |
|---|------|-------------|----------------|
| 1 | Mở `/customer/register` | Hiện form đăng ký | Lỗi: 500 nếu DB chưa chạy |
| 2 | Để trống email/password → Submit | Hiện lỗi: "Email không hợp lệ" / "Mật khẩu cần ít nhất 8 ký tự" | Lỗi: 400 nhưng không có message → Zod chưa hoạt động |
| 3 | Email đã tồn tại → Submit | Hiện lỗi: "Email này đã được đăng ký" | Nếu hiện "Đăng ký thành công" → bug duplicate email |
| 4 | Đăng ký mới → Submit thành công | Redirect về `/`, cookie `customer_session` được set, header hiện email user | Không redirect → check console log |
| 5 | Thử đăng ký > 3 lần trong 1 giờ (cùng IP) | Thử thứ 4+: hiện lỗi 429 "Quá nhiều lần đăng ký. Thử lại sau X phút" | Nếu không bị chặn → rate limit chưa hoạt động |
| 6 | Mở `/customer/login` | Hiện form đăng nhập | — |
| 7 | Sai password > 5 lần trong 15 phút | Thử thứ 6+ (dù đúng pass): 429 "Quá nhiều lần đăng nhập thất bại. Thử lại sau X phút" | Nếu không bị chặn → bug |
| 8 | Đăng nhập đúng | Cookie được set, header hiện email + menu | Nếu login thành công nhưng header vẫn hiện nút Login → check session |
| 9 | Click "Đăng xuất" | Cookie bị xóa, header về trạng thái logged-out | Không đăng xuất được → check x-requested-with header |
| 10 | Mở `/customer/forgot-password` | Nhập email → "Nếu email tồn tại, mã OTP đã được gửi" | Nếu hiện khác nhau tùy email tồn tại → info leak |
| 11 | Nhập OTP sai 5 lần trong 15 phút | Lần thứ 6+: hiện lỗi 429 "Quá nhiều lần thử. Vui lòng thử lại sau X phút" | Nếu không bị chặn → bug |
| 12 | Nhập OTP đúng + password mới → Submit | "Đổi mật khẩu thành công" → đăng nhập bằng pass mới được | Lỗi: 500 → check bcrypt |

**Kiểm tra cookie (DevTools → Application → Cookies):**
- `customer_session`: HttpOnly = true, Secure = true (production), SameSite = lax
- `admin_session`: HttpOnly = true, Secure = true (production)

---

## Routines

| # | Bước | Kết quả đúng | Lỗi thường gặp |
|---|------|-------------|----------------|
| 1 | Mở `/customer/routines` (chưa login) | Redirect về `/customer/login` | Không redirect → proxy chưa hoạt động |
| 2 | Mở `/customer/routines` (đã login) | Hiện danh sách routines (nếu có), nút "Tạo lịch trình" | Lỗi: 401 → check cookie |
| 3 | Tạo routine thiếu `title` → Submit | Lỗi 400: "Tiêu đề không được để trống" | Nếu tạo được → Zod chưa validate |
| 4 | Gửi `items` rỗng hoặc không phải array | Lỗi 400: "Routine phải có ít nhất 1 sản phẩm" | |
| 5 | Gửi `timeOfDay` = "midnight" (không hợp lệ) | Lỗi 400: Zod error, `timeOfDay` phải là morning/afternoon/evening/night | Nếu lưu được → bug accept invalid enum |
| 6 | Gửi `imageUrl` = `javascript:alert(1)` | Lỗi 400: "imageUrl không hợp lệ" | Nếu lưu được → chưa có URL validation (XSS risk) |
| 7 | Gửi `imageUrl` = `not-a-url` | Lỗi 400: "imageUrl không hợp lệ" | |
| 8 | Tạo routine với > 20 items | Lỗi 400: Zod error "Too many items" | Nếu lưu được → thiếu giới hạn |
| 9 | Tạo routine thành công | Hiện trong list, đúng thứ tự `order` | Sản phẩm sai thứ tự → check order logic |
| 10 | Sửa routine, xóa 1 item → Save | Item bị xóa CUỐNG khỏi DB | Item vẫn còn → bug transaction |
| 11 | Xóa routine | Routine biến mất khỏi list | Không xóa được → check route handler |
| 12 | Sửa/xóa routine của user khác | Lỗi 404: "Không tìm thấy routine" | Nếu sửa được → thiếu ownership check (bug nghiêm trọng) |

---

## CSRF

| # | Bước | Kết quả đúng | Lỗi thường gặp |
|---|------|-------------|----------------|
| 1 | Mở `/customer/logout` trực tiếp bằng browser (GET) | Lỗi 405 Method Not Allowed | Nếu logout được → chưa giới hạn method |
| 2 | Mở DevTools Console → gửi POST không có header | Lỗi 403: "Yêu cầu không hợp lệ" | Nếu logout được → CSRF chưa hoạt động |
| 3 | Gửi POST có `x-requested-with: XMLHttpRequest` → Logout | Thành công (200) | Lỗi: 403 → check header |

---

## Headers (kiểm tra bằng curl)

```bash
# 1. Security headers
curl -sI http://localhost:3000/ | grep -E "Content-Security-Policy|X-Frame-Options|X-Content-Type-Options"

# Kỳ vọng thấy đủ 3 headers

# 2. CORS — từ origin không hợp lệ
curl -sI http://localhost:3000/api/customer/login \
  -H "Origin: http://evil.com" \
  -X OPTIONS

# Kỳ vọng: KHông thấy Access-Control-Allow-Origin → bị chặn

# 3. Rate limit — gửi 6 lần login sai cùng IP
for i in $(seq 1 6); do
  curl -s -X POST http://localhost:3000/api/customer/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# Kỳ vọng: Lần 1-5 → 401, lần 6 → 429
```

---

## XSS (kiểm tra thủ công)

| # | Test | Kết quả đúng |
|---|------|-------------|
| 1 | Tạo routine có `productName: "<script>alert(1)</script>"` | Lưu thành công, hiện text `<script>alert(1)</script>` (KHÔNG execute popup) |
| 2 | Tạo routine có `notes: "'; DROP TABLE routines; --"` | Lưu thành công, hiện text gốc (không SQL error) |
| 3 | Tạo routine có `imageUrl: "javascript:alert(1)"` | Lỗi 400: "imageUrl không hợp lệ" |
| 4 | Tạo routine có `imageUrl: "http://evil.com/xss.jpg"` | Lưu thành công (http URL hợp lệ) |
| 5 | Kiểm tra DevTools → Console sau khi tạo routine có `<script>` | Không thấy `alert(1)` chạy → XSS blocked |

---

## Checklist chung sau khi test xong

- [ ] Build pass: `npm run build` → exit code 0
- [ ] Login/Logout hoạt động đúng
- [ ] Rate limit hoạt động (test bằng cách gửi nhiều request)
- [ ] CORS reject origin lạ
- [ ] Routine: create/edit/delete + ownership check
- [ ] Routine: Zod validation reject input lỗi
- [ ] Routine: imageUrl chỉ nhận URL hợp lệ
- [ ] CSRF: logout từ curl không header → 403
- [ ] Cookie: HttpOnly = true, SameSite = lax
- [ ] Không có alert/popup khi tạo routine có `<script>` payload
