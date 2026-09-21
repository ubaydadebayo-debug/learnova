import test from 'node:test';
import assert from 'node:assert/strict';

import { buildVerificationCode, buildCertificateNumber } from './certificate.service.js';

test('buildVerificationCode creates a stable, human-readable verification token', () => {
  const code = buildVerificationCode('student-1', 'course-1');

  assert.match(code, /^CERT-[A-Z0-9-]+$/i);
  assert.ok(code.length > 10);

  assert.equal(buildVerificationCode('student-1', 'course-1'), code);
  assert.notEqual(buildVerificationCode('student-2', 'course-1'), code);
  assert.notEqual(buildVerificationCode('student-1', 'course-2'), code);
});

test('buildCertificateNumber produces a unique-looking certificate number', () => {
  const a = buildCertificateNumber();
  const b = buildCertificateNumber();

  assert.match(a, /^CERT-/i);
  assert.notEqual(a, b);
});