import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTutorResponse, buildStudyPlan, buildTutorPrompt } from './ai.service.js';

test('buildTutorResponse explains lesson concepts with course context', () => {
  const result = buildTutorResponse({
    message: 'Explain recursion in simple terms',
    context: { courseTitle: 'JavaScript Basics', lessonTitle: 'Functions and recursion' },
  });

  assert.match(result.content, /recursion|function/i);
  assert.match(result.content, /JavaScript Basics|Functions and recursion/i);
});

test('buildTutorResponse creates practice questions when asked to quiz', () => {
  const result = buildTutorResponse({
    message: 'Quiz me on variables',
    context: { courseTitle: 'JavaScript Basics', lessonTitle: 'Variables and scope' },
  });

  assert.match(result.content, /Question 1|Practice/i);
  assert.match(result.content, /variables|scope/i);
});

test('buildStudyPlan creates a concise plan', () => {
  const plan = buildStudyPlan({
    courseTitle: 'JavaScript Basics',
    topic: 'arrays and loops',
  });

  assert.match(plan, /Day 1|Day 2|Day 3/i);
  assert.match(plan, /arrays|loops/i);
});

test('buildTutorPrompt includes course, lesson content and history', () => {
  const prompt = buildTutorPrompt({
    message: 'Explain closures',
    course: { title: 'JavaScript Basics', description: 'Learn modern JavaScript.', outcomes: ['Write clean code', 'Debug programs'] },
    lesson: { title: 'Closures', content: 'A closure is a function that remembers its lexical scope.', module: { title: 'Functions' } },
    history: [{ role: 'USER', content: 'Hi' }, { role: 'ASSISTANT', content: 'Hello!' }],
  });

  assert.match(prompt, /JavaScript Basics/);
  assert.match(prompt, /Write clean code/);
  assert.match(prompt, /Closures/);
  assert.match(prompt, /lexical scope/);
  assert.match(prompt, /CONVERSATION HISTORY/);
  assert.match(prompt, /STUDENT QUESTION: Explain closures/);
});