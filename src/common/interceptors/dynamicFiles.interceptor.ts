import { Request } from 'express';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'; // Import FilesInterceptor
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * DynamicFileInterceptor for handling single or multiple file uploads.
 *
 * @param fieldName The name of the field in the form data that contains the file(s).
 * @param getPath A function that returns the destination path for storing files, based on the request.
 * @param options An optional object to configure the interceptor.
 * - multiple: boolean (default: false) - Set to true to allow multiple files.
 * - maxCount: number (optional) - The maximum number of files to accept when 'multiple' is true.
 * - fileSize: number (optional) - Maximum file size in bytes (e.g., 5 * 1024 * 1024 for 5MB).
 * - allowedMimes: string[] (optional) - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']).
 */
export function DynamicFilesInterceptor(
  fieldName: string,
  getPath: (req: Request) => string,
  options?: {
    multiple?: boolean;
    maxCount?: number;
    fileSize?: number;
    allowedMimes?: string[];
  },
) {
  const defaultAllowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  const defaultFileSize = 5 * 1024 * 1024; // 5 MB

  const interceptor = options?.multiple
    ? FilesInterceptor(fieldName, options.maxCount, {
        // Use FilesInterceptor for multiple files
        storage: diskStorage({
          destination: (req, _file, cb) => {
            const dest = getPath(req);
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
          },
          filename: (_req, file, cb) => {
            if (!file || !file.originalname) {
              return cb(new Error('Invalid file input'), '');
            }
            const uniqueSuffix = uuidv4();
            const extension = extname(file.originalname);
            const filename = `${uniqueSuffix}${extension}`;
            cb(null, filename);
          },
        }),
        fileFilter: (_req, file, cb) => {
          const allowedMimes = options?.allowedMimes || defaultAllowedMimes;
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new Error(
                `Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`,
              ),
              false,
            );
          }
        },
        limits: {
          fileSize: options?.fileSize || defaultFileSize,
        },
      })
    : FileInterceptor(fieldName, {
        // Keep FileInterceptor for single file uploads
        storage: diskStorage({
          destination: (req, _file, cb) => {
            const dest = getPath(req);
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
          },
          filename: (_req, file, cb) => {
            if (!file || !file.originalname) {
              return cb(new Error('Invalid file input'), '');
            }
            const uniqueSuffix = uuidv4();
            const extension = extname(file.originalname);
            const filename = `${uniqueSuffix}${extension}`;
            cb(null, filename);
          },
        }),
        fileFilter: (_req, file, cb) => {
          const allowedMimes = options?.allowedMimes || defaultAllowedMimes;
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new Error(
                `Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`,
              ),
              false,
            );
          }
        },
        limits: {
          fileSize: options?.fileSize || defaultFileSize,
        },
      });

  return applyDecorators(UseInterceptors(interceptor));
}
