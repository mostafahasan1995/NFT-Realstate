import {Injectable} from '@nestjs/common';
import {OAuth2Client} from 'google-auth-library';

@Injectable()
export class GoogleService {
  private googleClientId = process.env.GOOGLE_CLIENT_ID;

  async verifyGoogleAuth(token: string) {
    try {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.error('Error verifying Google Auth', error);
      throw new Error('Error verifying Google Auth');
    }
  }
}
