# Restaurant Website

Trang web nhà hàng tích hợp đầy đủ tính năng đặt bàn và đặt món online, bao gồm hệ thống quản lý (Backend) và giao diện người dùng (Frontend).

## 📋 Yêu cầu hệ thống (Prerequisites)

Trước khi cài đặt dự án, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

1. **Git** (Quản lý mã nguồn)
   - Tải về: [git-scm.com](https://git-scm.com/downloads)
   - Kiểm tra: `git --version`

2. **Node.js** & **npm** (Môi trường chạy JavaScript)
   - Tải về: [nodejs.org](https://nodejs.org/) (Khuyên dùng bản LTS)
   - Kiểm tra: `node -v` và `npm -v`

3. **MySQL** (Cơ sở dữ liệu)
   - Tải về: [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) hoặc sử dụng XAMPP/WAMP/Docker.
   - **Lưu ý:** Đảm bảo MySQL Service đang chạy trước khi thực hiện các bước tiếp theo.

## 🚀 Hướng dẫn Cài đặt & Chạy

### 1. Clone Repository

Mở terminal (CMD/PowerShell/Terminal) và chạy lệnh sau để tải mã nguồn về máy:

```bash
git clone https://github.com/haiquanbg1/ushi.git
cd ushi
````

-----

### 2\. Cài đặt Backend (Server & Database)

Mở terminal, di chuyển vào thư mục `backend`:

```bash
cd backend
```

#### Bước 2.1: Cài đặt thư viện

```bash
npm install
```

#### Bước 2.2: Cấu hình biến môi trường

Copy file cấu hình mẫu và đổi tên thành `.env`:

```bash
cp .env.example .env
# Trên Windows (Command Prompt): copy .env.example .env
```

> **Quan trọng:** Mở file `.env` vừa tạo bằng text editor và cập nhật thông tin kết nối MySQL của bạn (DB\_USERNAME, DB\_PASSWORD, DB\_NAME, DB\_HOST...).

#### Bước 2.3: Khởi tạo Database (Sequelize CLI)

Chạy lần lượt các lệnh sau để tạo cấu trúc cơ sở dữ liệu và dữ liệu mẫu:

1.  **Tạo Database:**
    ```bash
    npx sequelize-cli db:create
    ```
2.  **Tạo bảng (Migrations):**
    ```bash
    npx sequelize-cli db:migrate
    ```
3.  **Thêm dữ liệu mẫu (Seeding):**
    ```bash
    npx sequelize-cli db:seed:all
    ```

#### Bước 2.4: Chạy Server

```bash
npm run dev
```

> Server sẽ chạy tại địa chỉ được cấu hình (`http://localhost:8080`).

-----

### 3\. Cài đặt Frontend (Client Interface)

Mở một **terminal mới** (giữ terminal backend đang chạy), từ thư mục gốc dự án, đi vào `frontend`:

```bash
cd frontend
```

#### Bước 3.1: Cài đặt thư viện

```bash
npm install
```

#### Bước 3.2: Cấu hình biến môi trường

Copy file cấu hình mẫu:

```bash
cp .env.local.example .env.local
# Trên Windows: copy .env.local.example .env.local
```

> Kiểm tra file `.env.local` để đảm bảo API URL trỏ đúng về port của Backend (Ví dụ: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`).

#### Bước 3.3: Chạy Development Server

```bash
npm run dev
```

#### Bước 3.4: Truy cập Website

Mở trình duyệt và vào địa chỉ: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

-----

## ✨ Tính năng

### Frontend

  - ✅ Trang chủ responsive, giao diện hiện đại
  - ✅ Popup đăng ký / đăng nhập
  - ✅ Authentication với Cookie/JWT
  - ✅ Đặt món và giỏ hàng
  - ✅ Đặt bàn trực tuyến
  - ✅ Form validation & Error handling
  - ✅ Loading states

### Backend

  - ✅ RESTful API với ExpressJS
  - ✅ Tương tác MySQL thông qua Sequelize ORM
  - ✅ Quản lý Database (Create, Migrate, Seed)
  - ✅ Hệ thống xác thực (Authentication & Authorization)
  - ✅ CRUD dữ liệu (User, Product, Order, Reservation)

## 🛠️ Tech Stack

  - **Frontend:** ReactJS / Next.js, CSS Modules / TailwindCSS
  - **Backend:** Node.js, ExpressJS
  - **Database:** MySQL, Sequelize ORM

<!-- end list -->

```
```
