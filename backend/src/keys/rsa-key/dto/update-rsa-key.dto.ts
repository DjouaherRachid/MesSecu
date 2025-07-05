import { IsString } from 'class-validator';

export class UpdateRsaKeyDto {
  @IsString()
  rsa_public_key: string;
}
