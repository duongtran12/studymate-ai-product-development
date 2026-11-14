package com.tritagon.studymate.document;

import java.util.List;

public record DocumentPreviewResponse(Long documentId, String processingStatus, long chunkCount, List<String> excerpts) {
}
