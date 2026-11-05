package com.tritagon.studymate.quiz;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseAccessService;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class QuizService {

	private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
	};
	private final CourseAccessService courseAccessService;
	private final QuizRepository quizRepository;
	private final QuizQuestionRepository questionRepository;
	private final QuizAttemptRepository attemptRepository;
	private final QuizAttemptAnswerRepository attemptAnswerRepository;
	private final QuizDocumentSourceRepository documentSourceRepository;
	private final CourseDocumentRepository documentRepository;
	private final ObjectMapper objectMapper;

	public QuizService(CourseAccessService courseAccessService, QuizRepository quizRepository,
			QuizQuestionRepository questionRepository, QuizAttemptRepository attemptRepository,
			QuizAttemptAnswerRepository attemptAnswerRepository, QuizDocumentSourceRepository documentSourceRepository,
			CourseDocumentRepository documentRepository, ObjectMapper objectMapper) {
		this.courseAccessService = courseAccessService;
		this.quizRepository = quizRepository;
		this.questionRepository = questionRepository;
		this.attemptRepository = attemptRepository;
		this.attemptAnswerRepository = attemptAnswerRepository;
		this.documentSourceRepository = documentSourceRepository;
		this.documentRepository = documentRepository;
		this.objectMapper = objectMapper;
	}

	public List<QuizResponse> list(Long userId, Long courseId) {
		courseAccessService.requireOwnedCourse(userId, courseId);
		return quizRepository.findAllByCourseIdOrderByUpdatedAtDesc(courseId).stream().map(this::response).toList();
	}

	public QuizResponse get(Long userId, Long quizId) {
		Quiz quiz = findOwnedQuiz(userId, quizId);
		return response(quiz);
	}

	public List<QuizAttemptHistoryResponse> attempts(Long userId, Long quizId) {
		findOwnedQuiz(userId, quizId);
		return attemptRepository.findAllByQuizIdAndUserIdOrderByCreatedAtDesc(quizId, userId).stream()
				.map(QuizAttemptHistoryResponse::from).toList();
	}

	@Transactional
	public QuizResponse create(Long userId, Long courseId, QuizCreateRequest request) {
		courseAccessService.requireOwnedCourse(userId, courseId);
		validateCreateRequest(request);
		OffsetDateTime now = OffsetDateTime.now();
		Quiz quiz = quizRepository.save(new Quiz(null, courseId, request.title().trim(), now, now));
		List<QuizQuestion> questions = IntStream.range(0, request.questions().size())
				.mapToObj(index -> toQuestion(quiz.id(), request.questions().get(index), index + 1)).toList();
		questionRepository.saveAll(questions);
		saveDocumentSources(quiz.id(), courseId, request.documentIds(), now);
		return response(quiz);
	}

	@Transactional
	public QuizAttemptResponse submit(Long userId, Long quizId, QuizAttemptSubmitRequest request) {
		Quiz quiz = findOwnedQuiz(userId, quizId);
		if (request == null || request.answers() == null) {
			throw badRequest("Quiz answers are required.");
		}
		List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAsc(quiz.id());
		if (questions.isEmpty()) throw badRequest("Quiz must contain at least one question.");
		Map<Long, String> answers = answerMap(request.answers(), questions);
		int correctCount = (int) questions.stream()
				.filter(question -> matches(question.answerText(), answers.get(question.id()))).count();
		BigDecimal score = BigDecimal.valueOf(correctCount * 100.0 / questions.size()).setScale(2, RoundingMode.HALF_UP);
		OffsetDateTime now = OffsetDateTime.now();
		QuizAttempt attempt = attemptRepository.save(new QuizAttempt(null, quiz.id(), userId, "SUBMITTED", score, now, now));
		attemptAnswerRepository.saveAll(questions.stream().map(question -> new QuizAttemptAnswer(null, attempt.id(),
				question.id(), answers.get(question.id()), matches(question.answerText(), answers.get(question.id())), now)).toList());
		return new QuizAttemptResponse(attempt.id(), quiz.id(), attempt.status(), score, correctCount, questions.size(), now);
	}

	private Quiz findOwnedQuiz(Long userId, Long quizId) {
		Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new QuizNotFoundException(quizId));
		courseAccessService.requireOwnedCourse(userId, quiz.courseId());
		return quiz;
	}

	private QuizResponse response(Quiz quiz) {
		return response(quiz, questionRepository.findAllByQuizIdOrderByPositionAsc(quiz.id()));
	}

	private QuizResponse response(Quiz quiz, List<QuizQuestion> questions) {
		List<Long> documentIds = documentSourceRepository.findAllByQuizIdOrderByCreatedAtAsc(quiz.id()).stream()
				.map(QuizDocumentSource::documentId).toList();
		return new QuizResponse(quiz.id(), quiz.courseId(), quiz.title(), questions.stream().map(this::response).toList(), documentIds,
				quiz.createdAt(), quiz.updatedAt());
	}

	private void saveDocumentSources(Long quizId, Long courseId, List<Long> requestedIds, OffsetDateTime createdAt) {
		if (requestedIds == null || requestedIds.isEmpty()) return;
		List<Long> documentIds = requestedIds.stream().distinct().toList();
		for (Long documentId : documentIds) {
			if (documentId == null) throw badRequest("Quiz document IDs must not be null.");
			documentRepository.findByIdAndCourseId(documentId, courseId)
					.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
		}
		documentSourceRepository.saveAll(documentIds.stream()
				.map(documentId -> new QuizDocumentSource(null, quizId, documentId, createdAt)).toList());
	}

	private QuizQuestionResponse response(QuizQuestion question) {
		return new QuizQuestionResponse(question.id(), question.questionText(), options(question.optionsJson()),
				question.explanation(), question.position());
	}

	private QuizQuestion toQuestion(Long quizId, QuizQuestionWriteRequest question, int position) {
		return new QuizQuestion(null, quizId, question.questionText().trim(), "MULTIPLE_CHOICE",
				writeOptions(question.options()), question.answerText().trim(), emptyToNull(question.explanation()), position);
	}

	private void validateCreateRequest(QuizCreateRequest request) {
		if (request == null || request.title() == null || request.title().isBlank()) throw badRequest("Quiz title is required.");
		if (request.title().trim().length() > 200) throw badRequest("Quiz title must not exceed 200 characters.");
		if (request.questions() == null || request.questions().isEmpty()) throw badRequest("Quiz requires at least one question.");
		for (QuizQuestionWriteRequest question : request.questions()) {
			if (question == null || question.questionText() == null || question.questionText().isBlank()
					|| question.answerText() == null || question.answerText().isBlank()) throw badRequest("Every quiz question and answer is required.");
			if (question.options() == null || question.options().size() < 2 || question.options().stream().anyMatch(option -> option == null || option.isBlank())) {
				throw badRequest("Every quiz question requires at least two non-empty options.");
			}
			if (question.options().stream().noneMatch(option -> matches(option, question.answerText()))) {
				throw badRequest("The correct answer must be one of the question options.");
			}
		}
	}

	private Map<Long, String> answerMap(List<QuizAnswerWriteRequest> requests, List<QuizQuestion> questions) {
		Map<Long, String> answers = new LinkedHashMap<>();
		for (QuizAnswerWriteRequest answer : requests) {
			if (answer == null || answer.questionId() == null) throw badRequest("Every submitted answer requires a question ID.");
			if (questions.stream().noneMatch(question -> question.id().equals(answer.questionId()))) throw badRequest("Answer does not belong to this quiz.");
			if (answers.put(answer.questionId(), emptyToNull(answer.answerText())) != null) throw badRequest("Each quiz question may be answered once.");
		}
		return answers;
	}

	private boolean matches(String expected, String actual) {
		return expected != null && actual != null && expected.trim().equalsIgnoreCase(actual.trim());
	}

	private String emptyToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
	private ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }

	private String writeOptions(List<String> options) {
		try { return objectMapper.writeValueAsString(options.stream().map(String::trim).toList()); }
		catch (JacksonException exception) { throw new IllegalStateException("Could not store quiz options.", exception); }
	}

	private List<String> options(String optionsJson) {
		try { return objectMapper.readValue(optionsJson, STRING_LIST); }
		catch (JacksonException exception) { throw new IllegalStateException("Could not read quiz options.", exception); }
	}
}
