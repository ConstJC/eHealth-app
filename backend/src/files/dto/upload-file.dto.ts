import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FileType {
  PATIENT_PHOTO = 'PATIENT_PHOTO',
  VISIT_ATTACHMENT = 'VISIT_ATTACHMENT',
  DOCUMENT = 'DOCUMENT',
}

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'File type',
    enum: FileType,
    example: FileType.PATIENT_PHOTO,
  })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiPropertyOptional({
    description: 'File description',
    example: 'Patient profile photo',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

