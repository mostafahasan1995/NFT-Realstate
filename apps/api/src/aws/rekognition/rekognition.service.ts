import { Injectable, BadRequestException } from '@nestjs/common';
import { RekognitionClient, DetectFacesCommand, CompareFacesCommand } from '@aws-sdk/client-rekognition';

@Injectable()
export class RekognitionService {
  private awsRegion = process.env.AWS_REGION;
  private rekognitionClient: RekognitionClient;

  constructor() {
    if (!this.awsRegion || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not properly configured');
    }

    this.rekognitionClient = new RekognitionClient({
      region: this.awsRegion,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async detectFaces(imageBuffer: Buffer) {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Invalid image buffer provided');
    }

    const command = new DetectFacesCommand({
      Image: {
        Bytes: new Uint8Array(imageBuffer)
      }
    });

    try {
      const response = await this.rekognitionClient.send(command);
      return response.FaceDetails;
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new BadRequestException('Failed to detect faces in the image');
    }
  }

  async compareFaces(sourceImageBuffer: Buffer, targetImageBuffer: Buffer) {
    if (!sourceImageBuffer || !targetImageBuffer || 
        sourceImageBuffer.length === 0 || targetImageBuffer.length === 0) {
      throw new BadRequestException('Invalid image buffers provided');
    }

    const command = new CompareFacesCommand({
      SourceImage: {
        Bytes: new Uint8Array(sourceImageBuffer)
      },
      TargetImage: {
        Bytes: new Uint8Array(targetImageBuffer)
      },
      SimilarityThreshold: 90 // 90% similarity threshold
    });

    try {
      const response = await this.rekognitionClient.send(command);
      return response.FaceMatches;
    } catch (error) {
      console.error('Error comparing faces:', error);
      throw new BadRequestException('Failed to compare faces in the images');
    }
  }
} 