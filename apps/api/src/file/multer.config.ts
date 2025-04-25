import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import multer from 'multer';

const storage = multer.memoryStorage();

function generateUploadOptions(fileSize: number, allowedExtensions: string[]) {
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => fileFilter(req, file, cb, allowedExtensions),
    limits: {
      fileSize: fileSize * 1024 * 1024,
    },
  });
}

function fileFilter(req, file, cb, allowedExtensions) {
  const ext = extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new BadRequestException(
        `File type not allowed! Only ${allowedExtensions.join(
          ', '
        )} are allowed.`
      ),
      false
    );
  }
  cb(null, true);
}

export const uploadAdminOptions = generateUploadOptions(10, [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.svg',
  '.pdf',
  '.xlsx',
]);

export const uploadStreamOptions = generateUploadOptions(10, [
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf',
  '.xlsx',
]);

export const uploadEmailOptions = generateUploadOptions(10, ['.html']);

export const uploadInvoiceOptions = generateUploadOptions(5, [
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf',
]);

export const uploadImageOptions = generateUploadOptions(5, [
  '.png',
  '.jpg',
  '.jpeg',
]);

export const uploadAttachmentOptions = generateUploadOptions(5, [
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf',
  '.xlsx',
  '.mb4',
  '.docx',
]);