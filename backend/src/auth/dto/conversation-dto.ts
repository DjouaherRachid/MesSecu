import { IsString, IsOptional, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  picture_url?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  participants: number[];
}
