import { Injectable } from '@nestjs/common';
import { SEASON_MODIFIERS, SEASONS, Season } from '../common/constants/game.constants';
import { FertilizerService } from '../fertilizer/fertilizer.service';
import { PlantEntity } from '../plant/entities/plant.entity';
import { SunlightService } from '../sunlight/sunlight.service';
import { WaterService } from '../water/water.service';
import { WorldEntity } from './entities/world.entity';
import { WorldRepository } from './repositories/world.repository';

@Injectable()
export class WorldService {
  constructor(
    private readonly worldRepository: WorldRepository,
    private readonly sunlightService: SunlightService,
    private readonly waterService: WaterService,
    private readonly fertilizerService: FertilizerService,
  ) {}

  async getWorld(): Promise<WorldEntity> {
    return this.worldRepository.getOrCreate();
  }

  async getStatus(plant: PlantEntity | null) {
    const world = await this.getWorld();
    let dirty = false;
    if (this.waterService.refillIfNeeded(world)) dirty = true;
    const fertilizerBefore = world.availableFertilizer;
    this.fertilizerService.processSheepEvents(world);
    if (world.availableFertilizer !== fertilizerBefore) dirty = true;
    if (dirty) await this.worldRepository.save(world);
    return {
      sun: this.sunlightService.getStatus(world, plant),
      water: this.waterService.getStatus(world, plant),
      fertilizer: this.fertilizerService.getStatus(world, plant),
      season: world.season,
      seasonModifier: SEASON_MODIFIERS[world.season],
      dayProgress: world.dayProgress,
      isDaytime: world.isDaytime,
      sheepPresent: world.sheepPresent,
    };
  }

  async save(world: WorldEntity): Promise<WorldEntity> {
    return this.worldRepository.save(world);
  }

  advanceSimulation(world: WorldEntity): void {
    world.simulationTicks += 1;
    this.sunlightService.updateDayNight(world);
    this.sunlightService.advanceSun(world);
    this.waterService.refillIfNeeded(world);
    this.fertilizerService.processSheepEvents(world);
    this.fertilizerService.decayFertilizer(world);
    this.maybeRotateSeason(world);
  }

  getSeasonModifier(world: WorldEntity): number {
    return SEASON_MODIFIERS[world.season];
  }

  private maybeRotateSeason(world: WorldEntity): void {
    const ticksPerSeason = 100;
    if (world.simulationTicks > 0 && world.simulationTicks % ticksPerSeason === 0) {
      const idx = SEASONS.indexOf(world.season);
      world.season = SEASONS[(idx + 1) % SEASONS.length] as Season;
    }
  }
}
