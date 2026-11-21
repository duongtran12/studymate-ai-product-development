from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.shared import Inches, Pt
from docx.oxml.ns import qn


OUTPUT = Path(__file__).resolve().parents[1] / "docs" / "demo" / "studymate-demo-unit-testing.docx"


def set_font(run, size=None, bold=None):
    run.font.name = "Arial"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
    if size:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold


def add_body(document, text):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.space_after = Pt(8)
    run = paragraph.add_run(text)
    set_font(run, 11)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = Document()
    section = document.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)

    normal = document.styles["Normal"]
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
    normal.font.size = Pt(11)

    title = document.add_paragraph(style="Title")
    title.paragraph_format.space_after = Pt(6)
    set_font(title.add_run("Kiểm thử đơn vị"), 20, True)
    subtitle = document.add_paragraph()
    subtitle.paragraph_format.space_after = Pt(18)
    set_font(subtitle.add_run("Tài liệu minh họa cho buổi demo StudyMate"), 11)

    for heading, paragraphs in [
        ("Mục tiêu", [
            "Kiểm thử đơn vị Unit Test kiểm tra một phần nhỏ và cô lập của chương trình, thường là một hàm hoặc một lớp. Mục tiêu là phát hiện lỗi sớm và xác nhận hành vi của đơn vị đó đúng với yêu cầu.",
            "Một Unit Test tốt cần chạy nhanh, có kết quả lặp lại được và không phụ thuộc vào cơ sở dữ liệu, mạng hoặc thời gian thực nếu những phụ thuộc đó không phải là đối tượng cần kiểm tra.",
        ]),
        ("Cấu trúc Arrange Act Assert", [
            "Arrange chuẩn bị dữ liệu đầu vào và các đối tượng giả lập cần thiết. Act gọi hành vi đang được kiểm tra. Assert so sánh kết quả thực tế với kết quả mong đợi.",
            "Ví dụ, để kiểm tra hàm tính điểm Quiz, Arrange tạo danh sách đáp án, Act gọi hàm chấm điểm, còn Assert xác nhận số câu đúng và phần trăm điểm.",
        ]),
        ("Mock và phạm vi kiểm thử", [
            "Mock được dùng để thay thế một phụ thuộc bên ngoài như repository, email service hoặc API. Nhờ đó Unit Test chỉ đánh giá logic của đơn vị đang kiểm tra.",
            "Không nên dùng Unit Test để kiểm tra toàn bộ luồng giữa nhiều thành phần. Luồng đó phù hợp với Integration Test hoặc End to End Test.",
        ]),
        ("Câu hỏi ôn tập", [
            "1. Unit Test kiểm tra phần nào của phần mềm?\n2. Ba bước trong Arrange Act Assert là gì?\n3. Khi nào nên dùng Mock?",
        ]),
    ]:
        paragraph = document.add_paragraph(style="Heading 1")
        paragraph.paragraph_format.space_before = Pt(12)
        paragraph.paragraph_format.space_after = Pt(6)
        set_font(paragraph.add_run(heading), 14, True)
        for body in paragraphs:
            add_body(document, body)

    document.save(OUTPUT)


if __name__ == "__main__":
    main()
