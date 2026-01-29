import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
 
export class ResendDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;
 
 
}