import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePlantDto {
  @ApiPropertyOptional({
    example: 'Willow',
    description: 'Name for your plant',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;
}
