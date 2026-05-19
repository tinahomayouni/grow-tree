import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GROWTH,
  LEVEL_THRESHOLDS,
  WATER,
} from '../common/constants/game.constants';
import { normalizeAngle } from '../common/utils/angle.util';
import { FertilizerService } from '../fertilizer/fertilizer.service';
import { SunlightService } from '../sunlight/sunlight.service';
import { WaterService } from '../water/water.service';
import { WorldRepository } from '../world/repositories/world.repository';
import { WorldEntity } from '../world/entities/world.entity';
import { WorldService } from '../world/world.service';
import { AlignSunDto } from './dto/align-sun.dto';
import { CreatePlantDto } from './dto/create-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import { PlantEntity } from './entities/plant.entity';
import { PlantRepository } from './repositories/plant.repository';

@Injectable()
export class PlantService {
  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly worldRepository: WorldRepository,
    private readonly worldService: WorldService,
    private readonly sunlightService: SunlightService,
    private readonly waterService: WaterService,
    private readonly fertilizerService: FertilizerService,
  ) {}

  async create(dto: CreatePlantDto): Promise<PlantEntity> {
    const existing = await this.plantRepository.count();
    if (existing > 0) {
      throw new ConflictException(
        'A plant already exists. Only one plant per garden.',
      );
    }
    return this.plantRepository.create({
      name: dto.name ?? 'Seedling',
      level: 1,
      growthPoints: 0,
      health: GROWTH.MAX_HEALTH,
      hydration: 40,
      playerSunAlignment: 0,
    });
  }

  async getPlant(): Promise<PlantEntity> {
    const plant = await this.plantRepository.findOne();
    if (!plant) {
      throw new NotFoundException(
        'No plant found. Create one with POST /plant/create',
      );
    }
    return plant;
  }

  async getStatus() {
    const plant = await this.getPlant();
    const world = await this.worldService.getWorld();
    const sun = this.sunlightService.getStatus(world, plant);
    const water = this.waterService.getStatus(world, plant);
    const fertilizer = this.fertilizerService.getStatus(world, plant);

    return {
      plant: {
        id: plant.id,
        name: plant.name,
        level: plant.level,
        growthPoints: plant.growthPoints,
        health: plant.health,
        hydration: plant.hydration,
        createdAt: plant.createdAt,
        lastUpdatedAt: plant.lastUpdatedAt,
      },
      growth: {
        nextLevelAt: this.nextLevelThreshold(plant.level),
        pointsToNextLevel: Math.max(
          0,
          this.nextLevelThreshold(plant.level) - plant.growthPoints,
        ),
      },
      sun,
      water,
      fertilizer,
    };
  }

  async water(dto: WaterPlantDto) {
    const plant = await this.getPlant();
    const world = await this.worldService.getWorld();
    const requested = dto.amount ?? WATER.WATERING_AMOUNT;
    const result = await this.waterService.waterPlant(
      world,
      plant,
      requested,
    );
    await this.plantRepository.save(result.plant);
    await this.worldRepository.save(result.world);
    return {
      status: await this.getStatus(),
      used: result.used,
      requested,
    };
  }

  async alignSun(dto: AlignSunDto) {
    const plant = await this.getPlant();
    plant.playerSunAlignment = normalizeAngle(dto.angle);
    await this.plantRepository.save(plant);
    return this.getStatus();
  }

  async collectFertilizer() {
    const plant = await this.getPlant();
    const world = await this.worldService.getWorld();
    const result = await this.fertilizerService.collectFertilizer(
      world,
      plant,
    );
    await this.plantRepository.save(result.plant);
    await this.worldRepository.save(result.world);
    return {
      collected: result.collected,
      status: await this.getStatus(),
    };
  }

  async runGrowthCycle(
    world: WorldEntity,
    plant: PlantEntity,
  ): Promise<{ grew: boolean; points: number }> {
    const sun = this.sunlightService.getStatus(world, plant);
    const sunlightBonus = sun.growthMultiplier;
    const waterBonus = this.waterService.waterBonus(plant);
    const fertilizerBonus = this.fertilizerService.fertilizerBonus(
      plant,
      world,
    );

    const canGrow =
      world.isDaytime &&
      sunlightBonus > 0 &&
      waterBonus > 0 &&
      fertilizerBonus > 0 &&
      this.waterService.hasWaterForGrowth(plant, world) &&
      this.fertilizerService.hasFertilizerForGrowth(plant, world);

    if (!canGrow) {
      this.waterService.decayHydration(plant);
      await this.plantRepository.save(plant);
      return { grew: false, points: 0 };
    }

    const seasonModifier = this.worldService.getSeasonModifier(world);
    const points =
      GROWTH.BASE_POINTS_PER_CYCLE *
      sunlightBonus *
      waterBonus *
      fertilizerBonus *
      seasonModifier;

    plant.growthPoints += points;
    plant.level = this.levelForPoints(plant.growthPoints);
    this.waterService.decayHydration(plant);
    await this.plantRepository.save(plant);

    return { grew: true, points };
  }

  private levelForPoints(points: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return level;
  }

  private nextLevelThreshold(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    }
    return LEVEL_THRESHOLDS[currentLevel];
  }
}
