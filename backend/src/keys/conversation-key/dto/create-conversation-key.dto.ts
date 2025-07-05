import { IsNumber, IsString } from 'class-validator';

export class CreateConversationKeyDto {
  @IsNumber()
  conversation_id: number;

  @IsString()
  encrypted_aes_key: string;

  @IsNumber()
  user_id: number;
}
