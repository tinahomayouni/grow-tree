import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class WaterPlantDto {
  @ApiPropertyOptional({
    example: 25,
    description: 'Amount of water to use from the tank (1–50)',
    minimum: 1,
    maximum: 50,
    default: 25,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  amount?: number;
}
