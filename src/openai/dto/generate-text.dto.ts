// src/openai/dto/generate-text.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTextDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}