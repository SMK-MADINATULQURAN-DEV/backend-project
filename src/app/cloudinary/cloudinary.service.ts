import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary.response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          
          // Pastikan result tidak undefined
          if (!result) return reject(new Error('Cloudinary upload result is undefined'));

          // Gabungkan data asli cloudinary dengan custom field kita
          // Gunakan 'as any' jika ingin memaksa atau update Interface Anda
          resolve({
            ...result,
            file_url: result.secure_url,
            file_name: `${result.public_id}.${result.format}`,
            file_size: result.bytes,
          } as CloudinaryResponse); 
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}