# Restaurant Website

Trang web nhà hàng với tính năng đặt bàn và đặt món online.

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd restaurant-website
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file environment variables:
```bash
cp .env.local.example .env.local
```

4. Cập nhật thông tin API trong `.env.local`

5. Chạy development server:
```bash
npm run dev
```

6. Mở [http://localhost:3000](http://localhost:3000) để xem website.

## Tính năng

- ✅ Trang chủ responsive
- ✅ Popup đăng ký/đăng nhập
- ✅ Tích hợp với backend API
- ✅ Authentication với cookie
- ✅ Quản lý state người dùng
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling