import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ApiError } from '../utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.resolve(__dirname, '../../uploads');
export const assignmentsUploadDir = path.join(uploadsRoot, 'assignments');

fs.mkdirSync(assignmentsUploadDir, { recursive: true });

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
]);

// Minimal magic-byte matchers so a renamed binary cannot slip through as a
// "PDF". Text files have no reliable signature and are accepted by content.
const MAGIC_BY_RULES = [
  { extensions: ['.pdf'], test: (buf) => buf.slice(0, 5).toString('latin1') === '%PDF-' },
  { extensions: ['.png'], test: (buf) => buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a },
  { extensions: ['.jpg', '.jpeg'], test: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff },
  { extensions: ['.gif'], test: (buf) => buf.slice(0, 6).toString('latin1') === 'GIF87a' || buf.slice(0, 6).toString('latin1') === 'GIF89a' },
  { extensions: ['.docx'], test: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04 },
  { extensions: ['.doc'], test: (buf) => buf.length >= 8 && buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 && buf[4] === 0xa1 && buf[5] === 0xb1 && buf[6] === 0x1a && buf[7] === 0xe1 },
  { extensions: ['.webp'], test: (buf) => buf.length >= 12 && buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP' },
];

function matchesMagicBytes(filePath, ext) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    const read = fs.readSync(fd, buf, 0, buf.length, 0);
    const signature = buf.subarray(0, read);
    return MAGIC_BY_RULES.some((rule) => rule.extensions.includes(ext) && rule.test(signature));
  } finally {
    fs.closeSync(fd);
  }
}

export function sanitizeFileName(name) {
  const base = String(name || 'file')
    .replace(/[\\/]/g, '-')
    .replace(/[\x00-\x1f]/g, '')
    .trim();
  return base.slice(0, 180) || 'file';
}

export const uploadAssignmentFile = multer({
  storage: multer.diskStorage({
    destination: assignmentsUploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(ApiError.badRequest('Unsupported file type. Allowed types: PDF, DOC, DOCX, TXT, PNG, JPG, GIF, WEBP'));
    }
    cb(null, true);
  },
});

export function uploadAssignmentFileMiddleware(req, res, next) {
  uploadAssignmentFile.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File is too large. Maximum size is 10 MB'));
        }
        return next(ApiError.badRequest(`Upload failed: ${err.message}`));
      }
      return next(err);
    }

    // Verify the file content matches its extension before accepting it.
    if (req.file && path.extname(req.file.originalname).toLowerCase() !== '.txt') {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!matchesMagicBytes(req.file.path, ext)) {
        fs.unlink(req.file.path, () => {});
        return next(ApiError.badRequest('The uploaded file contents do not match its type'));
      }
    }
    next();
  });
}

export function resolveUploadPath(relativeUrl) {
  const clean = String(relativeUrl || '').replace(/^\/+/, '');
  const serverRoot = path.dirname(uploadsRoot);
  const filePath = path.resolve(serverRoot, clean);
  if (!filePath.startsWith(uploadsRoot)) {
    throw ApiError.badRequest('Invalid file path');
  }
  return filePath;
}