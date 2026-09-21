import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { generateAiResponse } from './ai.provider.js';

const normalize = (value = '') => value.trim();

export const TUTOR_SYSTEM_PROMPT = `You are the Learnova AI Tutor, an encouraging, friendly study coach for the "Learnova" learning platform.

Follow these rules:
1. Explain clearly and adapt to the learner's level.
2. Prefer the course and lesson context provided below.
3. Encourage understanding and ask guiding questions instead of dumping answers.
4. When asked, generate practice questions or a short multiple-choice quiz.
5. Never claim to know information that is not present in the provided context.
6. Do not complete a student's active graded assignment for them; coach them toward their own solution.
7. Keep responses focused, structured, and reasonably concise.`;

export function buildTutorPrompt({ message = '', course = null, lesson = null, history = [] }) {
  const parts = [];

  if (course) {
    parts.push(`COURSE TITLE: ${course.title}`);
    if (course.description) parts.push(`COURSE DESCRIPTION: ${course.description}`);
    if (Array.isArray(course.outcomes) && course.outcomes.length > 0) {
      parts.push(`COURSE OUTCOMES:\n${course.outcomes.map((outcome) => `- ${outcome}`).join('\n')}`);
    }
  }

  if (lesson) {
    if (lesson.module?.title) parts.push(`MODULE TITLE: ${lesson.module.title}`);
    parts.push(`LESSON TITLE: ${lesson.title}`);
    if (lesson.content) parts.push(`LESSON CONTENT:\n${lesson.content.slice(0, 4000)}`);
  }

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-10);
    parts.push(`CONVERSATION HISTORY:\n${recent.map((entry) => `${entry.role}: ${entry.content}`).join('\n')}`);
  }

  parts.push(`STUDENT QUESTION: ${message}`);

  return parts.filter(Boolean).join('\n\n') || message;
}

export function buildStudyPlan({ courseTitle = 'your course', topic = 'core concepts' }) {
  const safeTopic = normalize(topic) || 'your next topic';
  const safeCourse = normalize(courseTitle) || 'your course';

  return `Here is a 4-day study plan for ${safeCourse} focused on ${safeTopic}:

Day 1: Review the key idea and write 3 short notes in your own words.
Day 2: Practice one mini exercise and explain the answer out loud.
Day 3: Compare two examples and identify where the pattern changes.
Day 4: Teach the concept to someone else or summarize it in a checklist.

Keep the focus on understanding the pattern, not just memorizing steps.`;
}

export function buildTutorResponse({ message = '', context = {} }) {
  const prompt = normalize(message);
  const courseTitle = normalize(context.courseTitle) || 'this course';
  const lessonTitle = normalize(context.lessonTitle) || 'this lesson';
  const lowerPrompt = prompt.toLowerCase();

  if (!prompt) {
    return {
      role: 'ASSISTANT',
      content:
        'I can help explain concepts, quiz you, or make a study plan. Ask me about a lesson, a topic, or a practice question.',
    };
  }

  if (/simplify|simple|plain english|plain-language|easier/.test(lowerPrompt)) {
    return {
      role: 'ASSISTANT',
      content: `Here is the simpler version for ${lessonTitle}: think of the underlying idea as a small pattern you can reuse, not a memorized rule. If a concept feels abstract, break it into one example, one reason it matters, and one common mistake to avoid. In ${courseTitle}, focus on understanding the purpose first, then the syntax or steps.`,
    };
  }

  if (/quiz|practice|question|test me/.test(lowerPrompt)) {
    return {
      role: 'ASSISTANT',
      content: `Practice time for ${lessonTitle} in ${courseTitle}.

Question 1: What is the main purpose of the idea covered in this lesson, and how would you explain it in one sentence?
Question 2: What is one example where this concept would be useful in a real project?
Question 3: What would go wrong if you skipped the core step or made the wrong assumption?

Try answering them before looking for the solution. If you want, I can also turn this into a multiple-choice quiz.`,
    };
  }

  if (/study plan|plan/.test(lowerPrompt)) {
    return {
      role: 'ASSISTANT',
      content: buildStudyPlan({
        courseTitle,
        topic: `${lessonTitle} and related fundamentals`,
      }),
    };
  }

  if (/recursion|function|loop|variable|scope|array|object|array|method/.test(lowerPrompt)) {
    return {
      role: 'ASSISTANT',
      content: `A good way to think about ${lessonTitle} in ${courseTitle} is to connect the idea to a real task. For example, a function or loop becomes easier to understand when you can explain what problem it solves, what input it receives, and what output it produces. The key is to reason about the pattern, not just the syntax. If you want, I can walk through a concrete example step by step.`,
    };
  }

  return {
    role: 'ASSISTANT',
    content: `Here is a clear explanation for ${lessonTitle} in ${courseTitle}: start with the core idea, then connect it to a practical example, and finally test yourself by explaining it without looking at the notes. This helps you remember the concept and use it in real work. If you want a deeper breakdown, ask me to explain a specific step or turn this into a quick quiz.`,
  };
}

async function buildConversationContext(conversation) {
  if (conversation.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: conversation.lessonId },
      select: {
        id: true,
        title: true,
        content: true,
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                outcomes: true,
              },
            },
          },
        },
      },
    });

    if (lesson) {
      return { course: lesson.module?.course ?? null, lesson: { ...lesson, module: lesson.module } };
    }
  }

  if (conversation.courseId) {
    const course = await prisma.course.findFirst({
      where: { id: conversation.courseId },
      select: { id: true, title: true, description: true, outcomes: true },
    });

    if (course) return { course };
  }

  return {};
}

async function resolveConversationTarget(payload = {}) {
  const courseId = payload.courseId || null;
  const lessonId = payload.lessonId || null;

  if (lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId },
      select: { id: true, module: { select: { courseId: true } } },
    });

    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (courseId && lesson.module.courseId !== courseId) {
      throw ApiError.badRequest('Lesson does not belong to the selected course');
    }

    return { courseId: lesson.module.courseId, lessonId };
  }

  if (courseId) {
    const course = await prisma.course.findFirst({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) throw ApiError.notFound('Course not found');
  }

  return { courseId, lessonId };
}

export async function listStudentConversations(userId) {
  return prisma.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      courseId: true,
      lessonId: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { title: true } },
      lesson: { select: { title: true } },
      _count: { select: { messages: true } },
    },
  });
}

export async function getConversationById(userId, conversationId) {
  const conversation = await prisma.aIConversation.findFirst({
    where: { id: conversationId, userId },
    select: {
      id: true,
      title: true,
      courseId: true,
      lessonId: true,
      course: { select: { id: true, title: true } },
      lesson: { select: { id: true, title: true } },
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  return conversation;
}

export async function createStudentConversation(userId, payload = {}) {
  const { courseId, lessonId } = await resolveConversationTarget(payload);

  let title = normalize(payload.title);
  if (!title && lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId },
      select: { title: true },
    });
    title = lesson ? `Ask about ${lesson.title}` : 'New conversation';
  }
  title = title || 'New conversation';

  return prisma.aIConversation.create({
    data: {
      userId,
      title,
      courseId,
      lessonId,
    },
    select: {
      id: true,
      title: true,
      courseId: true,
      lessonId: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { title: true } },
      lesson: { select: { title: true } },
      messages: true,
    },
  });
}

export async function sendStudentMessage(userId, conversationId, payload = {}) {
  const messageText = normalize(payload.message || '');

  if (!messageText) {
    throw ApiError.badRequest('Message is required');
  }

  const conversation = await prisma.aIConversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true, title: true, courseId: true, lessonId: true, createdAt: true },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const context = await buildConversationContext(conversation);

  let assistantText;
  if (env.aiProvider === 'local') {
    const fallback = buildTutorResponse({
      message: messageText,
      context: {
        courseTitle: context.course?.title || 'this course',
        lessonTitle: context.lesson?.title || 'this lesson',
      },
    });
    assistantText = fallback.content;
  } else {
    const previousMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { role: true, content: true },
    });

    assistantText = await generateAiResponse({
      system: TUTOR_SYSTEM_PROMPT,
      user: buildTutorPrompt({
        message: messageText,
        course: context.course,
        lesson: context.lesson,
        history: previousMessages.reverse(),
      }),
    });
  }

  const [userMessage, assistantMessage] = await Promise.all([
    prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messageText,
      },
      select: { id: true, role: true, content: true, createdAt: true },
    }),
    prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: assistantText,
      },
      select: { id: true, role: true, content: true, createdAt: true },
    }),
  ]);

  const updatedConversation = await prisma.aIConversation.update({
    where: { id: conversation.id },
    data: {
      title: conversation.title === 'New conversation' ? messageText.slice(0, 45) + (messageText.length > 45 ? '…' : '') : conversation.title,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      courseId: true,
      lessonId: true,
      course: { select: { title: true } },
      lesson: { select: { title: true } },
      updatedAt: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return {
    conversation: updatedConversation,
    userMessage,
    assistantMessage,
  };
}