# StudyMate - Product Requirements Document

**Phiên bản:** 0.1  
**Ngày:** 2026-09-08  
**Trạng thái:** Draft  
**Chủ sở hữu:** Nhóm StudyMate

## 1. Tổng quan

StudyMate là trợ lý học tập cá nhân giúp sinh viên học từ chính tài liệu môn học. Người dùng có thể tải tài liệu lên, xem nội dung đã được xử lý, đặt câu hỏi theo ngữ cảnh tài liệu và ôn tập qua các câu hỏi được tạo tự động.

## 2. Vấn đề cần giải quyết

Sinh viên thường phải đọc nhiều loại tài liệu rời rạc như slide, giáo trình và đề cương. Việc tìm lại thông tin, hiểu khái niệm và tự tạo nội dung ôn tập tốn thời gian. Các công cụ AI chung không luôn trả lời đúng theo tài liệu môn học và khó kiểm chứng nguồn trả lời.

## 3. Người dùng mục tiêu

- Sinh viên cần đọc nhanh và nắm nội dung môn học.
- Sinh viên muốn hỏi đáp dựa trên tài liệu của cá nhân hoặc nhóm.
- Nhóm học tập cần chia sẻ tài liệu và bộ câu hỏi ôn tập.

## 4. Mục tiêu MVP

1. Người dùng có thể đăng ký, đăng nhập và quản lý phiên học.
2. Người dùng có thể tải lên và quản lý tài liệu môn học.
3. Hệ thống có thể xử lý tài liệu văn bản thành nội dung có thể tìm kiếm.
4. Người dùng có thể đặt câu hỏi và nhận câu trả lời dựa trên tài liệu đã tải lên.
5. Câu trả lời hiển thị nguồn tham chiếu để người dùng kiểm chứng.
6. Người dùng có thể tạo và làm bộ câu hỏi ôn tập cơ bản.

## 5. Yêu cầu chức năng

### FR-01: Tài khoản và xác thực

- Đăng ký bằng email và mật khẩu.
- Đăng nhập, đăng xuất.
- Mỗi người dùng chỉ xem và thao tác trên dữ liệu được cấp quyền.

### FR-02: Quản lý tài liệu

- Tải lên tài liệu được hỗ trợ, ưu tiên PDF và DOCX.
- Xem tên, loại, kích thước, thời điểm tải lên và trạng thái xử lý.
- Xóa tài liệu của chính người dùng.
- Thông báo lỗi khi file không hợp lệ hoặc vượt giới hạn dung lượng.

### FR-03: Hỏi đáp theo tài liệu

- Chọn một hoặc nhiều tài liệu làm phạm vi hỏi đáp.
- Gửi câu hỏi bằng tiếng Việt hoặc tiếng Anh.
- Hiển thị câu trả lời, trạng thái xử lý và lịch sử hội thoại.
- Hiển thị đoạn trích hoặc tên tài liệu làm nguồn tham chiếu.
- Thông báo rõ khi không tìm thấy thông tin phù hợp thay vì tự suy đoán.

### FR-04: Ôn tập

- Tạo bộ câu hỏi từ một tài liệu hoặc nhóm tài liệu.
- Hỗ trợ tối thiểu dạng trắc nghiệm và câu hỏi trả lời ngắn.
- Hiển thị đáp án, giải thích ngắn và kết quả sau khi nộp.
- Lưu lịch sử các lần làm bài.

### FR-05: Quản lý phiên học

- Tạo, xem và tiếp tục một phiên học.
- Mỗi phiên học lưu tài liệu và lịch sử hỏi đáp liên quan.

## 6. Yêu cầu phi chức năng

- **Bảo mật:** Mật khẩu phải được băm; API phải kiểm tra quyền truy cập tài nguyên.
- **Tin cậy:** Không trả lời như sự thật khi không có bằng chứng trong tài liệu.
- **Hiệu năng:** API thông thường phản hồi trong tối đa 2 giây, không tính thời gian xử lý AI dài.
- **Khả năng mở rộng:** Tách các bước tải file, trích xuất nội dung và hỏi đáp thành các service/module rõ ràng.
- **Khả năng sử dụng:** Giao diện responsive, thông báo lỗi dễ hiểu, hỗ trợ tiếng Việt.
- **Theo dõi:** Ghi log lỗi và trạng thái xử lý, không ghi log mật khẩu hoặc nội dung nhạy cảm.

## 7. Phạm vi ngoài MVP

- Đồng bộ Google Drive hoặc OneDrive.
- Chia sẻ tài liệu công khai giữa nhiều nhóm.
- Trợ lý giọng nói và đọc văn bản.
- Ứng dụng mobile native.
- Phân tích tiến độ học tập nâng cao.

## 8. Tiêu chí nghiệm thu MVP

- Người dùng mới đăng ký và đăng nhập thành công.
- File hợp lệ được tải lên, xử lý và hiển thị trạng thái hoàn tất.
- Câu hỏi có thể được trả lời dựa trên nội dung tài liệu và có nguồn tham chiếu.
- Câu hỏi ngoài phạm vi tài liệu được hệ thống thông báo rõ.
- Người dùng tạo và hoàn thành được một bộ câu hỏi ôn tập.
- Người dùng không thể truy cập tài liệu hoặc lịch sử của tài khoản khác.
- Có test cho các luồng xác thực, upload tài liệu, hỏi đáp và chấm điểm.

## 9. Định hướng kỹ thuật ban đầu

- **Backend:** Spring Boot, Java 21, REST API.
- **Frontend:** React.
- **Dữ liệu:** Cơ sở dữ liệu quan hệ cho người dùng, tài liệu, phiên học và kết quả.
- **AI/RAG:** Trích xuất nội dung, chia đoạn, tìm kiếm theo ngữ nghĩa và sinh câu trả lời có ngữ cảnh.
- **Triển khai:** Docker hóa các thành phần khi hệ thống ổn định.

## 10. Chỉ số thành công ban đầu

- Tối thiểu 80% câu hỏi thử nghiệm có câu trả lời được dẫn nguồn đúng.
- Thời gian hoàn tất một phiên hỏi đáp thông thường dưới 10 giây, không tính hàng đợi xử lý tài liệu.
- Tối thiểu 90% luồng MVP hoàn thành không cần hướng dẫn trực tiếp.
- Không có lỗi phân quyền nghiêm trọng trong các kịch bản kiểm thử.
