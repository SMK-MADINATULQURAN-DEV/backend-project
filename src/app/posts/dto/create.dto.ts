import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum, IsUrl, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
 
class CreateMediaDto {
//   @IsUrl({}, { message: 'Format URL tidak valid' })
 
  @IsOptional()
  url: string;
 
  @IsEnum(['image', 'video'], { message: 'Type harus image atau video' })
  @IsOptional()
  type: 'image' | 'video';
}
 
export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'Konten tidak boleh kosong' })
  content: string;
 
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true }) // Validasi setiap objek di dalam array
  @Type(() => CreateMediaDto)      // Mengubah plain object menjadi instance class
  medias: CreateMediaDto[];
}