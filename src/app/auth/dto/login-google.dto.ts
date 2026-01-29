import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
 
export class LoginGoogleDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

   @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  name: string;

    @IsNotEmpty({ message: 'Avagar tidak boleh kosong' })
  avatar: string;

 
 
}