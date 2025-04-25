import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { File, FileSchema } from './schemas/file.schema';
import { S3Module } from '../aws/s3/s3.module';
import { PdfService } from './pdf.service';
import { RekognitionModule } from '../aws/rekognition/rekognition.module';
import { AdminFileController } from './file.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    S3Module,
    RekognitionModule,
    EmailModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [FileController, AdminFileController],
  providers: [FileService, PdfService],
  exports: [FileService],
})
export class FileModule {}
