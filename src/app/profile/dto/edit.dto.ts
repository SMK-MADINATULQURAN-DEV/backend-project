import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
 
export class EditDto {
  @IsNotEmpty()
  name: string;
 
  @IsOptional()
  avatar: string;
 
  @IsOptional()
  bio: string;
 
  @IsOptional()
  sampul: string;
 
  @IsOptional()
  location: string;
}