import { Injectable } from '@nestjs/common';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

@Injectable()
export class KmsService {
  private awsRegion = process.env.AWS_REGION;
  private awsKeyId = process.env.AWS_KEY_ID;
  private kmsClient = new KMSClient({ region: this.awsRegion });

  // Encrypt Data
  async encryptData(data) {
    try {
      // Convert the text to binary data (Buffer)
      const binaryData = Buffer.from(data, 'utf-8');

      const input = {
        KeyId: this.awsKeyId,
        Plaintext: binaryData,
      };

      const encryptCommand = new EncryptCommand(input);

      const encryptResponse = await this.kmsClient.send(encryptCommand);

      // Retrieve the encrypted binary data
      const encryptedBinaryData = encryptResponse.CiphertextBlob;

      // Convert the encrypted binary data (Uint8Array) to a base64-encoded string
      const encryptedDataString =
        Buffer.from(encryptedBinaryData).toString('base64');

      return encryptedDataString;
    } catch (error) {
      console.error('Error encrypting data:', error);
    }
  }

  // Decrypt Data
  async decryptData(data) {
    try {
      // Convert the base64-encoded string back to a Uint8Array
      const retrievedEncryptedBinaryData = Buffer.from(data, 'base64');

      // Decrypt the retrieved binary data
      const input = {
        KeyId: this.awsKeyId,
        CiphertextBlob: retrievedEncryptedBinaryData,
      };

      const decryptCommand = new DecryptCommand(input);

      const decryptResponse = await this.kmsClient.send(decryptCommand);

      // Convert the decrypted binary data back to a string
      const decryptedText = String.fromCharCode.apply(
        null,
        decryptResponse.Plaintext
      );

      return decryptedText;
    } catch (error) {
      console.error('Error decrypting data:', error);
    }
  }
}
