import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  UploadedFiles
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { uploadAttachmentOptions, uploadImageOptions, uploadInvoiceOptions, uploadStreamOptions } from './multer.config';
import { S3Service } from '../aws/s3/s3.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guard/api-key-auth.guard';
import { PdfService } from './pdf.service';
import { IUploadedFile } from './interfaces/uploaded-file.interface';
import { JwtService } from '../auth/jwt.service';
import { RekognitionService } from '../aws/rekognition/rekognition.service';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly pdfService: PdfService,
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtService,
    private readonly rekognitionService: RekognitionService
  ) { }

  @Post('upload/invoice')
  @UseInterceptors(FileInterceptor('file', uploadInvoiceOptions))
  async uploadInvoice(@UploadedFile() file: IUploadedFile) {
    try {
      const uploadedFile = await this.s3Service.uploadInvoiceFile(
        file.buffer,
        file.mimetype
      );

      const fileData = {
        originalname: file.originalname,
        filename: uploadedFile.fileName,
        url: uploadedFile.url,
      };
      return await this.fileService.create(fileData);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file');
    }
  }

  @Public()
  @UseGuards(ApiKeyGuard)
  @Post('upload/stream-ue/image-convert-pdf')
  @UseInterceptors(FileInterceptor('uploadFile', uploadStreamOptions))
  async uploadPdfFileForStreamUe(@UploadedFile() uploadFile) {
    try {
      // Convert png to pdf, then upload to s3
      const pdfBuffer = await this.pdfService.convertPngToPdf(
        uploadFile.buffer
      );

      const uploadedFile = await this.s3Service.uploadPdfFileForStreamUe(
        pdfBuffer,
        'application/pdf'
      );
      const fileData = {
        originalname: uploadFile.originalname,
        filename: uploadedFile.fileName,
        url: uploadedFile.url,
      };

      return await this.fileService.create(fileData);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file');
    }
  }


  @Post('upload')
  @UseInterceptors(FileInterceptor('file', uploadImageOptions))
  async uploadImage(@UploadedFile() file: IUploadedFile) {
    return await this.uploadFile(file);
  }

  @Post('upload/privet-file')
  @UseInterceptors(FileInterceptor('file', uploadImageOptions))
  async uploadPrivetFiles(@UploadedFile() file: IUploadedFile) {
    return await this.uploadFile(file, true);
  }

  @Post('upload/privet-file-aicheck')
  @UseInterceptors(FileInterceptor('file', uploadImageOptions))
  async uploadPrivetFileWithFaceCheck(@UploadedFile() file: IUploadedFile) {
    try {
      // First upload the file to S3
      const uploadedFile = await this.s3Service.uploadPrivetFile(file.buffer, file.mimetype);
      
      // Create file record first
      const fileData = {
        originalname: file.originalname,
        filename: uploadedFile.fileName,
        caption: this.fileService.extractFileName(file.originalname),
        url: uploadedFile.url,
      };

      const createdFile = await this.fileService.create(fileData);
      const baseResponse = createdFile.toJSON();
      
      // Detect faces in the image
      const faceDetails = await this.rekognitionService.detectFaces(file.buffer);
      
      if (!faceDetails || faceDetails.length === 0) {
        return {
          ...baseResponse,
          validation: {
            error: 'No faces detected in the image',
            description: 'Please provide an image containing at least one face',
            matched: false
          }
        };
      }

      if (faceDetails.length !== 2) {
        return {
          ...baseResponse,
          validation: {
            error: 'Invalid number of faces',
            description: 'The image should contain exactly two faces - one of the person and one from the ID card',
            matched: false,
            faceCount: faceDetails.length
          }
        };
      }

      // Compare the faces
      const faceMatches = await this.rekognitionService.compareFaces(
        file.buffer,
        file.buffer
      );

      const isMatch = faceMatches && faceMatches.length > 0 && faceMatches[0].Similarity >= 90;

      if (!isMatch) {
        return {
          ...baseResponse,
          validation: {
            error: 'Face mismatch',
            description: 'The face in the ID card does not match the person in the image',
            matched: false,
            faceCount: faceDetails.length,
            similarity: faceMatches?.[0]?.Similarity || 0
          }
        };
      }

      // If faces match, return success response
      return {
        ...baseResponse,
        validation: {
          matched: true,
          faceCount: faceDetails.length,
          similarity: faceMatches[0].Similarity
        }
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error processing file');
    }
  }

  @Public()
  @Post('upload/attachment')
  @UseInterceptors(FilesInterceptor('files', 20, uploadAttachmentOptions))
  async uploadAttachment(@UploadedFiles() files: IUploadedFile[], @Body('token') token: string) {
    await this.validateToken(token)
    const savedFiles = [];
    for (const file of files) {
      const createdFile = await this.uploadFile(file);
      savedFiles.push(createdFile);
    }
    return { data: savedFiles };
  }

  private async uploadFile(file: IUploadedFile, isPrivet = false) {
    try {
      const updatedCaption = this.fileService.extractFileName(file.originalname);

      const uploadedFile =
        isPrivet ?
          await this.s3Service.uploadPrivetFile(file.buffer, file.mimetype) :
          await this.s3Service.uploadPublicFile(file.buffer, file.mimetype)

      const fileData = {
        originalname: file.originalname,
        filename: uploadedFile.fileName,
        caption: updatedCaption,
        url: uploadedFile.url,
      };
      return await this.fileService.create(fileData);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file');
    }
  }

  private async validateToken(token: string) {
    try {
      return this.jwtService.verifyToken(token, 'funding-request-token')
    }
    catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
