import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlignSunDto } from '../plant/dto/align-sun.dto';
import { CreatePlantDto } from '../plant/dto/create-plant.dto';
import { WaterPlantDto } from '../plant/dto/water-plant.dto';
import { PlantEntity } from '../plant/entities/plant.entity';
import { PlantService } from '../plant/plant.service';
import { WorldService } from '../world/world.service';

@ApiExcludeController()
@Controller()
export class DemoController {
  constructor(
    private readonly plantService: PlantService,
    private readonly worldService: WorldService,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
  ) {}

  @Get()
  @Render('demo')
  async index(@Query('msg') msg?: string, @Query('err') err?: string) {
    const plant = await this.plantRepo.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    const world = await this.worldService.getStatus(plant);
    const status = plant ? await this.plantService.getStatus() : null;

    return {
      hasPlant: !!plant,
      status,
      world,
      msg: msg ?? null,
      err: err ?? null,
      growthChecklist: status ? this.buildGrowthChecklist(status, world) : null,
      plantEmoji: status ? this.plantEmoji(status.plant.level) : '🌰',
    };
  }

  @Get('docs')
  @Render('docs')
  docsPage() {
    return {
      title: 'Grow API',
      description: 'OpenAPI reference',
      swaggerJsonUrl: '/api-json',
    };
  }

  @Post('demo/create')
  @Redirect('/')
  async create(@Body() dto: CreatePlantDto) {
    try {
      await this.plantService.create(dto);
      return { url: '/?msg=Seed planted! Water it and align the sun.' };
    } catch (e) {
      return { url: `/?err=${encodeURIComponent((e as Error).message)}` };
    }
  }

  @Post('demo/water')
  @Redirect('/')
  async water(@Body() dto: WaterPlantDto) {
    try {
      const result = await this.plantService.water(dto);
      let msg = `Used ${result.used} water (tank: ${Math.round(result.status.water.currentWater)}/${result.status.water.maxWater}).`;
      if (result.used < result.requested) {
        msg += ' Tank was low — full refill in ~10 min.';
      }
      return { url: `/?msg=${encodeURIComponent(msg)}` };
    } catch (e) {
      return { url: `/?err=${encodeURIComponent((e as Error).message)}` };
    }
  }

  @Post('demo/align-sun')
  @Redirect('/')
  async alignSun(@Body() dto: AlignSunDto) {
    try {
      await this.plantService.alignSun(dto);
      return { url: '/?msg=Sun aligned.' };
    } catch (e) {
      return { url: `/?err=${encodeURIComponent((e as Error).message)}` };
    }
  }

  @Post('demo/collect-fertilizer')
  @Redirect('/')
  async collectFertilizer() {
    try {
      const result = await this.plantService.collectFertilizer();
      return {
        url: `/?msg=Collected ${result.collected} fertilizer — growth boost active!`,
      };
    } catch (e) {
      return { url: `/?err=${encodeURIComponent((e as Error).message)}` };
    }
  }

  private buildGrowthChecklist(
    status: Awaited<ReturnType<PlantService['getStatus']>>,
    world: Awaited<ReturnType<WorldService['getStatus']>>,
  ) {
    return [
      {
        label: 'Daytime',
        ok: world.isDaytime,
        hint: world.isDaytime ? 'Sun is up' : 'Wait for morning',
      },
      {
        label: 'Sun alignment',
        ok: status.sun.growthMultiplier > 0,
        hint: `${status.sun.alignmentLabel} (×${status.sun.growthMultiplier})`,
      },
      {
        label: 'Water',
        ok: status.water.plantHydration >= 5 || status.water.currentWater > 0,
        hint: `Hydration ${Math.round(status.water.plantHydration)}%`,
      },
      {
        label: 'Fertilizer',
        ok:
          status.fertilizer.boostActive ||
          status.fertilizer.availableFertilizer > 0,
        hint: status.fertilizer.boostActive
          ? `Boost ×${status.fertilizer.boostMultiplier} (${status.fertilizer.boostMinutesLeft} min left)`
          : status.fertilizer.availableFertilizer > 0
            ? `${Math.round(status.fertilizer.availableFertilizer)} on ground — collect it`
            : `Wait for sheep (~${status.fertilizer.minutesUntilSheep} min)`,
      },
    ];
  }

  private plantEmoji(level: number): string {
    if (level >= 5) return '🌳';
    if (level >= 3) return '🌿';
    if (level >= 2) return '🪴';
    return '🌱';
  }
  @Post('world/heartbeat')
async heartbeat() {
  await this.worldService.heartbeat();
  return { ok: true };
}
}
