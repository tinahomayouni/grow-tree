import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlantRepository } from '../plant/repositories/plant.repository';
import { PlantService } from '../plant/plant.service';
import { WorldService } from '../world/world.service';

@Injectable()
export class GrowthCycleService {
  private readonly logger = new Logger(GrowthCycleService.name);

  constructor(
    private readonly plantService: PlantService,
    private readonly plantRepository: PlantRepository,
    private readonly worldService: WorldService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleGrowthCycle(): Promise<void> {
    const world = await this.worldService.getWorld();
    this.worldService.advanceSimulation(world);

    const plant = await this.plantRepository.findOne();
    if (plant) {
      const result = await this.plantService.runGrowthCycle(world, plant);
      if (result.grew) {
        this.logger.log(
          `Growth +${result.points.toFixed(1)} pts — level ${plant.level}, ${plant.growthPoints.toFixed(0)} total`,
        );
      }
    }

    await this.worldService.save(world);
  }
}
