import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerModule } from '../fertilizer/fertilizer.module';
import { SunlightModule } from '../sunlight/sunlight.module';
import { WaterModule } from '../water/water.module';
import { WorldModule } from '../world/world.module';
import { PlantEntity } from './entities/plant.entity';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';
import { PlantRepository } from './repositories/plant.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantEntity]),
    WorldModule,
    SunlightModule,
    WaterModule,
    FertilizerModule,
  ],
  controllers: [PlantController],
  providers: [PlantRepository, PlantService],
  exports: [PlantRepository, PlantService],
})
export class PlantModule {}
