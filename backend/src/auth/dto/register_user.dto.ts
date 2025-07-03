import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  username: string;
  email: string;
  password: string;

  // Champs pour Signal Protocol
  identity_public_key: string;
  signed_pre_key: string;
  signed_pre_key_signature: string;
}
