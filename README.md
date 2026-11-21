# StudyMate — Trợ lý học tập từ tài liệu môn học

[![StudyMate CI](https://github.com/duongtran12/studymate-ai-product-development/actions/workflows/ci.yml/badge.svg)](https://github.com/duongtran12/studymate-ai-product-development/actions/workflows/ci.yml)

StudyMate giúp sinh viên tổ chức môn học, tải tài liệu PDF/DOCX, hỏi đáp dựa trên nội dung đã trích xuất, tạo Quiz và theo dõi tiến độ học tập.

## Chức năng chính

- Đăng ký, đăng nhập, chỉnh sửa hồ sơ và đổi mật khẩu an toàn.
- Quản lý môn học, thư viện tài liệu PDF/DOCX và xem trước nội dung trích xuất.
- Phiên học hỏi đáp có căn cứ và nguồn trích dẫn từ tài liệu đã chọn.
- Tạo Quiz thủ công hoặc từ tài liệu, làm bài và xem phản hồi đúng/sai chi tiết.
- Dashboard có thống kê Quiz, mục tiêu học tập, đề xuất việc cần làm và lịch sử hoạt động.

## Công nghệ

- Backend: Spring Boot, Spring Data JDBC, Flyway, PostgreSQL.
- Frontend: React, Vite.
- Quality: JUnit, Vitest, ESLint, GitHub Actions.

## Chạy nhanh

Yêu cầu Java 21, Node.js 20+ và pnpm.

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
.\mvnw.cmd spring-boot:run
```

Ở cửa sổ khác:

```powershell
pnpm --dir frontend install
pnpm --dir frontend dev
```

Mở ứng dụng tại `http://localhost:5173`. Hướng dẫn chi tiết nằm trong [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Kiểm tra chất lượng

Chạy trước khi tạo Pull Request:

```powershell
.\scripts\verify.ps1 -FrontendRunner pnpm
```

GitHub Actions tự chạy cho mọi lần push và Pull Request. Trước khi merge, nhóm cần bảo đảm:

1. Hai job **Backend tests** và **Frontend quality** đều xanh.
2. Pull Request không có xung đột và đã được xem lại.
3. Không có `.env`, secret, `node_modules` hoặc thư mục build trong thay đổi.
4. Nội dung thay đổi được mô tả ngắn, kèm cách kiểm tra nếu có hành vi mới.

Xem lịch sử chạy CI tại [GitHub Actions](https://github.com/duongtran12/studymate-ai-product-development/actions).
