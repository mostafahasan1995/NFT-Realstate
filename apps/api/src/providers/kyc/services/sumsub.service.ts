import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class SumsubService {



  async uploadDocument(applicantId: string, filePath: string) {
    const formData = new FormData();
    let stream
    fs.createReadStream(filePath).on('end', (data: Buffer) => {
      stream = new Blob([data])
    })
    formData.append('content', new Blob(stream));
    formData.append('metadata', JSON.stringify({ idDocType: 'PASSPORT' }));

    const response = await axios.post(
      `https://api.sumsub.com/resources/applicants/${process.env.SUMSUB_APPLICANT}/info/idDoc`,
      formData,
      {
        headers: {
          'X-App-Token': process.env.SUMSUB_TOKEN,
          'Content-Type': 'multipart/form-data',
          'X-Return-Doc-Warnings': true
        },
      },
    );

    return response.data;
  }
}
