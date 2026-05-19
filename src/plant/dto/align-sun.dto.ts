import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class AlignSunDto {
  @ApiProperty({
    example: 90,
    description: 'Sun alignment angle in degrees (0–360)',
    minimum: 0,
    maximum: 360,
  })
  @IsNumber()
  @Min(0)
  @Max(360)
  angle: number;
}
