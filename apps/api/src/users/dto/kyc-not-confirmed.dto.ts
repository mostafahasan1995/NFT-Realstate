export interface ClaimDto {
  nationality: string;
  idCardImage: string;
  residence: string;
  birthCountry: string;
  idDocType: string;
  photoCamera: string;
  status: string;
}

export interface KycNotConfirmedDto {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  claim: ClaimDto;
  createdAt: Date;
} 