import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { PassThrough } from 'stream';

@Injectable()
export class PdfService {
  async convertPngToPdf(imageBuffer: Buffer): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const pdfDoc = new PDFDocument({ autoFirstPage: false });
    const passThrough = new PassThrough();
    pdfDoc.pipe(passThrough);

    pdfDoc.addPage({ size: [metadata.width, metadata.height] });
    pdfDoc.image(imageBuffer, 0, 0, { fit: [metadata.width, metadata.height] });
    pdfDoc.end();

    const pdfChunks: Buffer[] = [];
    for await (const chunk of passThrough) {
      pdfChunks.push(chunk);
    }

    return Buffer.concat(pdfChunks);
  }
}
