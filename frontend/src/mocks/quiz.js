export const multipleChoiceQuestions = [
  {
    id: "q1",
    type: "multiple-choice",
    prompt: "Mục đích phù hợp nhất của useEffect là gì?",
    options: ["Tính mọi giá trị hiển thị", "Đồng bộ component với hệ thống bên ngoài", "Thay thế toàn bộ event handler", "Khai báo component con"],
    answer: "Đồng bộ component với hệ thống bên ngoài",
    explanation: "Effect dùng cho việc đồng bộ với hệ thống bên ngoài. Giá trị có thể suy ra từ props và state thường nên được tính trong lúc render.",
    citation: "Slide React Hooks tuần 5.pdf · Trang 18",
  },
  {
    id: "q2",
    type: "multiple-choice",
    prompt: "Khi hai component con cần cùng một state, nên đặt state ở đâu?",
    options: ["Trong cả hai component", "Trong biến toàn cục bất kỳ", "Ở component cha chung gần nhất", "Trong file CSS"],
    answer: "Ở component cha chung gần nhất",
    explanation: "Đưa state lên component cha chung gần nhất giúp duy trì một nguồn dữ liệu nhất quán.",
    citation: "Bài tập State Management.docx · Phần 2, đoạn 3",
  },
  {
    id: "q3",
    type: "multiple-choice",
    prompt: "Tài liệu nào có thể dùng để tạo quiz?",
    options: ["Mọi file vừa chọn", "Chỉ file ở trạng thái Sẵn sàng", "Chỉ file DOCX", "Chỉ file dưới 1 MB"],
    answer: "Chỉ file ở trạng thái Sẵn sàng",
    explanation: "StudyMate chỉ dùng nội dung đã trích xuất thành công để bảo đảm câu hỏi có nguồn kiểm chứng.",
    citation: "Slide React Hooks tuần 5.pdf · Trạng thái tài liệu",
  },
];

export const shortAnswerQuestions = [
  { id: "s1", type: "short-answer", prompt: "Nêu một trường hợp nên dùng useEffect.", answer: "đồng bộ với hệ thống bên ngoài", keywords: ["đồng bộ", "bên ngoài"], explanation: "Một câu trả lời đúng cần chỉ ra hoạt động đồng bộ component với hệ thống bên ngoài, ví dụ đăng ký sự kiện hoặc gọi API.", citation: "Slide React Hooks tuần 5.pdf · Trang 18" },
  { id: "s2", type: "short-answer", prompt: "Vì sao cần đưa state dùng chung lên component cha?", answer: "để có một nguồn dữ liệu nhất quán", keywords: ["nguồn", "nhất quán"], explanation: "State dùng chung ở component cha giúp các component con đọc và cập nhật cùng một nguồn dữ liệu.", citation: "Bài tập State Management.docx · Phần 2, đoạn 3" },
];
