import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateRandomString } from '../../common/utils/random-string-generator.util';

@Injectable()
export class S3Service {
  private awsRegion = process.env.AWS_REGION;
  private awsPrivetBucket = process.env.AWS_PRIVET_BUCKET;
  private awsPublicBucket = process.env.AWS_PUBLIC_BUCKET;
  private awsStreamBucket = process.env.AWS_STREAM_BUCKET;
  private awsInvoiceBucket = process.env.AWS_INVOICE_BUCKET;

  private s3Client = new S3Client({
    region: this.awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
 
    }
  });

  async uploadPublicFile(fileBuffer, fileMimetype) {
    const fileName = this.generateFileName(32);

    const uploadParams = {
      Bucket: this.awsPublicBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileMimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    return {
      fileName,
      url: `https://${this.awsPublicBucket}.s3.${this.awsRegion}.amazonaws.com/${fileName}`,
    };
  }

  async uploadPrivetFile(fileBuffer, fileMimetype) {
    const fileName = this.generateFileName(32);

    const uploadParams = {
      Bucket: this.awsPrivetBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileMimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    return {
      fileName,
      url: `https://${this.awsPrivetBucket}.s3.${this.awsRegion}.amazonaws.com/${fileName}`,
    };
  }

  async uploadInvoiceFile(fileBuffer, fileMimetype) {
    const fileName = this.generateFileName(32);

    const uploadParams = {
      Bucket: this.awsInvoiceBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileMimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    const signedUrl = await this.getInvoiceObjectSignedUrl(fileName);

    return {
      fileName,
      url: `${signedUrl}`,
    };
  }

  async uploadPdfFileForStreamUe(fileBuffer, fileMimetype) {
    const fileName = this.generateFileName(10) + '.pdf';

    const uploadParams = {
      Bucket: this.awsStreamBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileMimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    return {
      fileName,
      url: `https://${this.awsStreamBucket}.s3.${this.awsRegion}.amazonaws.com/${fileName}`,
    };
  }

  async uploadExcelFileForStreamUe(fileBuffer, fileMimetype) {
    const fileName = this.generateFileName(10) + '.xlsx';

    const uploadParams = {
      Bucket: this.awsStreamBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileMimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    return {
      fileName,
      url: `https://${this.awsStreamBucket}.s3.${this.awsRegion}.amazonaws.com/${fileName}`,
    };
  }

  async getObjectSignedUrl(
    fileName: string,
    bucketName: string,
    expiresTime?: number
  ) {
    const expiresIn = expiresTime !== undefined ? expiresTime : 60 * 60 * 24;
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn,
    });

    return url;
  }

  async getInvoiceObjectSignedUrl(fileName: string) {
    return await this.getObjectSignedUrl(fileName, this.awsInvoiceBucket);
  }

  async deleteFile(fileName: string) {
    const deleteParams = {
      Bucket: this.awsPublicBucket,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(deleteParams);

    await this.s3Client.send(command);
  }

  private generateFileName(size = 32): string {
    return generateRandomString(size);
  }
}
