import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { uploadAdminOptions, uploadInvoiceOptions } from './multer.config';
import { File } from './schemas/file.schema';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { S3Service } from '../aws/s3/s3.service';
import { IUploadedFile } from './interfaces/uploaded-file.interface';
import { CreateURLFileDto } from './dto/file-url.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/files')
@Controller('admin/files')
export class AdminFileController {
  constructor(
    private readonly fileService: FileService,
    private readonly s3Service: S3Service
  ) { }

  @Get()
  async findAll(): Promise<File[]> {
    return await this.fileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<File> {
    return await this.fileService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', uploadAdminOptions))
  async uploadFile(
    @UploadedFile() file: IUploadedFile,
    @Body('caption') caption: string
  ) {
    try {
      const updatedCaption =
        caption || this.fileService.extractFileName(file.originalname);
      const uploadedFile = await this.s3Service.uploadPublicFile(
        file.buffer,
        file.mimetype
      );
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

  @Post('upload/multi')
  @UseInterceptors(FilesInterceptor('files', 20, uploadAdminOptions))
  async uploadMultipleFiles(@UploadedFiles() files: IUploadedFile[]) {
    try {
      const savedFiles = [];
      for (const file of files) {

        const caption = this.fileService.extractFileName(file.originalname);
        const uploadedFile = await this.s3Service.uploadPublicFile(
          file.buffer,
          file.mimetype
        );
        const fileData = {
          originalname: file.originalname,
          filename: uploadedFile.fileName,
          caption: caption,
          url: uploadedFile.url,
        };
        const savedFile = await this.fileService.create(fileData);
        savedFiles.push(savedFile);
      }

      return savedFiles;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file');
    }
  }

  @Post('upload/url')
  async uploadExcelFileForStreamUe(@Body() CreateUrlDto: CreateURLFileDto) {
    try {
      const fileData = {
        originalname: CreateUrlDto.name,
        url: CreateUrlDto.url,
      };
      return await this.fileService.create(fileData);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file');
    }
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return await this.fileService.delete(id);
  }
}
