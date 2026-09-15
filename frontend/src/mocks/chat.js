export const readyDocuments = [
  { id: "react-hooks", name: "Slide React Hooks tuần 5.pdf", detail: "Trang 12–24" },
  { id: "state-notes", name: "Bài tập State Management.docx", detail: "Phần 2" },
];

export const initialMessages = [
  { id: 1, role: "user", text: "Khi nào nên dùng useEffect?", time: "20:16" },
  {
    id: 2,
    role: "assistant",
    text: "Theo slide đã chọn, useEffect phù hợp khi component cần đồng bộ với một hệ thống bên ngoài, chẳng hạn đăng ký sự kiện hoặc gọi API. Nếu chỉ cần tính giá trị từ props và state, hãy tính trực tiếp trong lúc render.",
    time: "20:16",
    confidence: "Dựa trên 1 nguồn",
    citations: [{ document: "Slide React Hooks tuần 5.pdf", location: "Trang 18", excerpt: "Effects let a component synchronize with an external system." }],
  },
];
