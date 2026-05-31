import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;
  private accountId: string;

  constructor() {
    this.accountId = process.env.S3_ACCOUNT_ID!;

    this.bucket = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.PUBLIC_URL!;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }

  async upload(file: Express.Multer.File) {
    const fileKey = `${Date.now()}-${file.originalname}`;
    // console.log({file})
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key: fileKey,
      url: `${this.publicUrl}/${fileKey}`,
    };
  }
}
