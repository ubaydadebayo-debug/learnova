import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

async function requireEnrollment(studentId, courseId) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, courseId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    select: { id: true },
  });
  if (!enrollment) throw ApiError.forbidden('Enroll in this course before taking the quiz');
  return enrollment;
}

export async function getQuiz(studentId, quizId) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, module: { course: { status: 'PUBLISHED' } } },
    select: {
      id: true, title: true, description: true, passingScore: true,
      timeLimitMinutes: true, maxAttempts: true, allowRetake: true,
      module: { select: { courseId: true, course: { select: { title: true } } } },
      questions: {
        orderBy: { position: 'asc' },
        select: {
          id: true, type: true, prompt: true, points: true, position: true,
          options: { orderBy: { position: 'asc' }, select: { id: true, text: true, position: true } },
        },
      },
      attempts: {
        where: { studentId, submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        select: { id: true, score: true, maxScore: true, percentage: true, passed: true, submittedAt: true },
      },
    },
  });
  if (!quiz) throw ApiError.notFound('Quiz not found');
  await requireEnrollment(studentId, quiz.module.courseId);
  const { module, ...safeQuiz } = quiz;
  return { quiz: { ...safeQuiz, courseTitle: module.course.title }, attempts: quiz.attempts };
}

function normalizeQuestionOptions(type, options) {
  if (!Array.isArray(options)) {
    throw ApiError.badRequest('Each question needs at least two options, one marked correct');
  }

  const cleaned = options.map((option, index) => ({
    text: typeof option.text === 'string' ? option.text.trim() : '',
    isCorrect: Boolean(option.isCorrect),
    position: index,
  }));

  if (cleaned.some((option) => !option.text)) {
    throw ApiError.badRequest('Option text is required for every option');
  }

  if (type === 'TRUE_FALSE') {
    if (cleaned.length !== 2) {
      throw ApiError.badRequest('True/false questions must have exactly two options');
    }
  } else if (cleaned.length < 2) {
    throw ApiError.badRequest('Each multiple choice question needs at least two options');
  }

  if (!cleaned.some((option) => option.isCorrect)) {
    throw ApiError.badRequest('Each question must have at least one correct option');
  }

  return cleaned;
}

export async function createQuiz(moduleId, data) {
  const last = await prisma.quiz.findFirst({
    where: { moduleId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  return prisma.quiz.create({
    data: {
      moduleId,
      title: data.title,
      description: data.description ?? null,
      passingScore: data.passingScore ?? 60,
      timeLimitMinutes: data.timeLimitMinutes ?? null,
      maxAttempts: data.maxAttempts ?? null,
      allowRetake: data.allowRetake ?? true,
      position,
    },
    select: {
      id: true, moduleId: true, title: true, description: true,
      passingScore: true, timeLimitMinutes: true, maxAttempts: true,
      allowRetake: true, position: true,
    },
  });
}

export async function updateQuiz(quizId, data) {
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description ?? null;
  if (data.passingScore !== undefined) patch.passingScore = data.passingScore;
  if (data.timeLimitMinutes !== undefined) patch.timeLimitMinutes = data.timeLimitMinutes ?? null;
  if (data.maxAttempts !== undefined) patch.maxAttempts = data.maxAttempts ?? null;
  if (data.allowRetake !== undefined) patch.allowRetake = data.allowRetake;

  return prisma.quiz.update({
    where: { id: quizId },
    data: patch,
    select: {
      id: true, moduleId: true, title: true, description: true,
      passingScore: true, timeLimitMinutes: true, maxAttempts: true,
      allowRetake: true, position: true,
    },
  });
}

export async function deleteQuiz(quizId) {
  await prisma.quiz.delete({ where: { id: quizId } });
}

export async function createQuestion(quizId, data) {
  const last = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;
  const type = data.type === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE';
  const options = normalizeQuestionOptions(type, data.options);

  return prisma.question.create({
    data: {
      quizId,
      type,
      prompt: data.prompt,
      explanation: data.explanation ?? null,
      points: data.points ?? 1,
      position,
      options: { create: options },
    },
    select: {
      id: true, quizId: true, type: true, prompt: true, explanation: true,
      points: true, position: true,
      options: {
        orderBy: { position: 'asc' },
        select: { id: true, text: true, isCorrect: true, position: true },
      },
    },
  });
}

export async function updateQuestion(questionId, data) {
  const patch = {};
  if (data.type !== undefined) patch.type = data.type === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE';
  if (data.prompt !== undefined) patch.prompt = data.prompt;
  if (data.explanation !== undefined) patch.explanation = data.explanation ?? null;
  if (data.points !== undefined) patch.points = data.points;

  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, type: true },
  });
  if (!existing) throw ApiError.notFound('Question not found');

  const type = data.type !== undefined ? patch.type : existing.type;
  if (data.options !== undefined) {
    const options = normalizeQuestionOptions(type, data.options);
    await prisma.$transaction([
      prisma.questionOption.deleteMany({ where: { questionId } }),
      prisma.questionOption.createMany({ data: options.map((option) => ({ ...option, questionId })) }),
    ]);
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: patch,
    select: {
      id: true, quizId: true, type: true, prompt: true, explanation: true,
      points: true, position: true,
      options: {
        orderBy: { position: 'asc' },
        select: { id: true, text: true, isCorrect: true, position: true },
      },
    },
  });
  return updated;
}

export async function deleteQuestion(questionId) {
  await prisma.question.delete({ where: { id: questionId } });
}

export async function submitQuiz(studentId, quizId, answers) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, module: { course: { status: 'PUBLISHED' } } },
    select: {
      id: true, title: true, passingScore: true, maxAttempts: true, allowRetake: true,
      module: { select: { courseId: true } },
      questions: {
        orderBy: { position: 'asc' },
        select: {
          id: true, prompt: true, explanation: true, points: true,
          options: { orderBy: { position: 'asc' }, select: { id: true, text: true, isCorrect: true } },
        },
      },
    },
  });
  if (!quiz) throw ApiError.notFound('Quiz not found');
  const enrollment = await requireEnrollment(studentId, quiz.module.courseId);
  const previousAttempts = await prisma.quizAttempt.count({ where: { quizId, studentId, submittedAt: { not: null } } });
  if (!quiz.allowRetake && previousAttempts > 0) throw ApiError.conflict('Retakes are not allowed for this quiz');
  if (quiz.maxAttempts !== null && previousAttempts >= quiz.maxAttempts) throw ApiError.conflict('You have reached the maximum number of attempts');

  const questionMap = new Map(quiz.questions.map((question) => [question.id, question]));
  const submitted = new Map();
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) throw ApiError.badRequest('An answer references a question outside this quiz');
    if (submitted.has(answer.questionId)) throw ApiError.badRequest('Each question can only be answered once');
    if (answer.optionId && !question.options.some((option) => option.id === answer.optionId)) throw ApiError.badRequest('An answer references an option outside its question');
    submitted.set(answer.questionId, answer.optionId || null);
  }

  const maxScore = quiz.questions.reduce((sum, question) => sum + question.points, 0);
  const evaluated = quiz.questions.map((question) => {
    const optionId = submitted.get(question.id) || null;
    const selected = question.options.find((option) => option.id === optionId);
    return { question, optionId, selected, correct: question.options.find((option) => option.isCorrect), isCorrect: Boolean(selected?.isCorrect) };
  });
  const score = evaluated.reduce((sum, answer) => sum + (answer.isCorrect ? answer.question.points : 0), 0);
  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  const passed = percentage >= quiz.passingScore;
  const submittedAt = new Date();
  const attempt = await prisma.$transaction((tx) => tx.quizAttempt.create({
    data: {
      quizId, studentId, score, maxScore, percentage, passed, startedAt: submittedAt, submittedAt,
      answers: { create: evaluated.map(({ question, optionId, isCorrect }) => ({ questionId: question.id, optionId, isCorrect })) },
    },
    select: { id: true, score: true, maxScore: true, percentage: true, passed: true, submittedAt: true },
  }));

  return {
    attempt,
    quiz: { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore },
    review: evaluated.map(({ question, optionId, correct, isCorrect }) => ({ questionId: question.id, prompt: question.prompt, selectedOptionId: optionId, correctOptionId: correct?.id ?? null, isCorrect, explanation: question.explanation })),
    enrollmentId: enrollment.id,
  };
}