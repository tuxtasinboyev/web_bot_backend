
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UnsupportedMediaTypeException } from '@nestjs/common';
import { getPathInFileType } from './generator.types';
import { Request } from 'express';



export const fileStorages = (allowedMimes: string[]) => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const filePath = getPathInFileType(file.originalname);
      cb(null, filePath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: fileFilters(allowedMimes),
});

function fileFilters(allowedMimes: string[]) {
  return (req: Request, file: Express.Multer.File, cb) => {
    const mime = file.mimetype.split('/')[0];

    if (!allowedMimes.includes(mime)) {
      cb(
        new UnsupportedMediaTypeException(
          `Fayl turi [${allowedMimes.join(', ')}] bo'lishi kerak`
        ),
        false,
      );
    } else {
      cb(null, true);
    }
  };
}

