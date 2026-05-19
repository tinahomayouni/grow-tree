import { Module } from '@nestjs/common';
import { PlantModule } from '../plant/plant.module';
import { WorldModule } from '../world/world.module';
import { GrowthCycleService } from './growth-cycle.service';

@Module({
  imports: [PlantModule, WorldModule],
  providers: [GrowthCycleService],
})
export class SchedulerModule {}
