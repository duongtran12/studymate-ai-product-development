package com.tritagon.studymate.study;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;

@Service
public class MockGroundedAnswerGenerator implements GroundedAnswerGenerator {

	private static final String INSUFFICIENT_CONTEXT_MESSAGE =
			"Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này.";

	private final CourseDocumentRepository documentRepository;

	public MockGroundedAnswerGenerator(CourseDocumentRepository documentRepository) {
		this.documentRepository = documentRepository;
	}

	@Override
	public GroundedAnswer generate(GroundedAnswerRequest request) {
		if (request.documentIds().isEmpty()) {
			return new GroundedAnswer(INSUFFICIENT_CONTEXT_MESSAGE, GroundingStatus.INSUFFICIENT_CONTEXT, List.of());
		}

		Long documentId = request.documentIds().getFirst();
		CourseDocument document = documentRepository.findByIdAndCourseId(documentId, request.courseId())
				.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
		CitationResponse citation = new CitationResponse(
				document.id(),
				document.fileName(),
				"Tài liệu đã chọn",
				"Citation mô phỏng; nội dung tài liệu chưa được trích xuất ở Chương 6.");
		return new GroundedAnswer(
				"Đây là phản hồi mô phỏng cho giai đoạn lưu lịch sử hội thoại. "
						+ "Nội dung AI/RAG sẽ được bổ sung ở giai đoạn tiếp theo.",
				GroundingStatus.SUPPORTED,
				List.of(citation));
	}
}
