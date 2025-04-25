import { BadRequestException } from '@nestjs/common';

export class SmartContractException extends BadRequestException {
  constructor(error: any) {
    if (error?.reason) {
      super(`Error due to reason: ${error.reason}`);
    } else if (error?.code) {
      super(`Error with code: ${error.code}`);
    } else {
      super();
    }
  }
}
