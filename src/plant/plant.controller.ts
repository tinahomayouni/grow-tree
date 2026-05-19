import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AlignSunDto } from './dto/align-sun.dto';
import { CreatePlantDto } from './dto/create-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import { PlantService } from './plant.service';

@ApiTags('plant')
@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post('create')
  @ApiOperation({ summary: 'Plant a new seed' })
  @ApiBody({ type: CreatePlantDto })
  @ApiConflictResponse({ description: 'A plant already exists' })
  create(@Body() dto: CreatePlantDto) {
    return this.plantService.create(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get plant and resource status' })
  @ApiNotFoundResponse({ description: 'No plant created yet' })
  status() {
    return this.plantService.getStatus();
  }

  @Post('water')
  @ApiOperation({ summary: 'Water the plant from the tank' })
  @ApiBody({ type: WaterPlantDto })
  @ApiNotFoundResponse({ description: 'No plant created yet' })
  water(@Body() dto: WaterPlantDto) {
    return this.plantService.water(dto);
  }

  @Post('align-sun')
  @ApiOperation({ summary: 'Align sunlight to the optimal angle' })
  @ApiBody({ type: AlignSunDto })
  @ApiNotFoundResponse({ description: 'No plant created yet' })
  alignSun(@Body() dto: AlignSunDto) {
    return this.plantService.alignSun(dto);
  }

  @Post('collect-fertilizer')
  @ApiOperation({ summary: 'Collect available sheep fertilizer' })
  @ApiNotFoundResponse({ description: 'No plant created yet' })
  collectFertilizer() {
    return this.plantService.collectFertilizer();
  }
}
