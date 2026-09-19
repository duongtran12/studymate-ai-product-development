export const initialDocuments = [
  { id: 1, name: "Slide React Hooks tuần 5.pdf", type: "PDF", size: "2,4 MB", uploadedAt: "14/09/2026", status: "ready" },
  { id: 2, name: "Bài tập State Management.docx", type: "DOCX", size: "860 KB", uploadedAt: "14/09/2026", status: "processing" },
  { id: 3, name: "Ghi chú buổi thực hành.pdf", type: "PDF", size: "1,1 MB", uploadedAt: "13/09/2026", status: "failed" },
];

export const documentStatuses = {
  pending: { label: "Đang chờ", detail: "Tài liệu đang chờ tới lượt xử lý." },
  processing: { label: "Đang xử lý", detail: "Đang trích xuất nội dung để chuẩn bị hỏi đáp." },
  ready: { label: "Sẵn sàng", detail: "Có thể dùng trong chat và quiz." },
  failed: { label: "Xử lý thất bại", detail: "Thử lại hoặc thay bằng một file khác." },
};
