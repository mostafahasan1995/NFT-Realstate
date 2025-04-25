import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './schemas/file.schema';
import { S3Service } from '../aws/s3/s3.service';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private readonly s3Service: S3Service
  ) { }

  async create(file): Promise<File> {
    return await this.fileModel.create(file);
  }

  async findAll(): Promise<File[]> {
    return await this.fileModel.find();
  }

  async findOne(id: string) {
    return await this.fileModel.findById(id);
  }

  async findByFilename(filename: string) {
    const file = await this.fileModel.findOne({ filename });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async delete(id: string) {
    const deletedFile = await this.fileModel.findByIdAndDelete(id);

    if (!deletedFile) {
      throw new NotFoundException('File not found');
    }

    // Delete file from AWS S3
    try {
      await this.s3Service.deleteFile(deletedFile.filename);
    } catch (e) {
      throw new HttpException('the file not found in s3', 201)
    }

    return deletedFile;
  }

  async findFileByUrl(url: string) {
    const file = await this.fileModel.findOne({ url }).exec()
    return file
  }

  extractFileName(filename: string) {
    return filename.split('.').slice(0, -1).join('.');
  }
}
