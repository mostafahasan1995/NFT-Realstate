import {ThirdPartyProvider} from './third-party-provider.interface';

export interface ExternalUserData {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  referrerCode: string;
  thirdPartyProviders: ThirdPartyProvider[];
}
