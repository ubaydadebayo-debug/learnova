-- CreateIndex
CREATE INDEX "AIConversation_lessonId_idx" ON "AIConversation"("lessonId");

-- CreateIndex
CREATE INDEX "AIConversation_courseId_idx" ON "AIConversation"("courseId");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
