import { Request } from 'express';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export function DynamicFileInterceptor(
  fieldName: string,
  getPath: (req: Request) => string,
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
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
          const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type'), false);
          }
        },
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      }),
    ),
  );
}
