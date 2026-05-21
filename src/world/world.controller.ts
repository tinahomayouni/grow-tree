import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantEntity } from '../plant/entities/plant.entity';
import { WorldService } from './world.service';

@ApiTags('world')
@Controller('world')
export class WorldController {
  constructor(
    private readonly worldService: WorldService,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get world simulation status',
    description:
      'Day/night cycle, sun position, season, water tank, and fertilizer',
  })
  async status() {
    const plant = await this.plantRepo.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });
    return this.worldService.getStatus(plant);
  }
  @Post('world/heartbeat')
async heartbeat() {
  await this.worldService.heartbeat();
  return { ok: true };
}
}
