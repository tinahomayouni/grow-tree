import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerModule } from '../fertilizer/fertilizer.module';
import { PlantEntity } from '../plant/entities/plant.entity';
import { SunlightModule } from '../sunlight/sunlight.module';
import { WaterModule } from '../water/water.module';
import { WorldEntity } from './entities/world.entity';
import { WorldRepository } from './repositories/world.repository';
import { WorldController } from './world.controller';
import { WorldService } from './world.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorldEntity, PlantEntity]),
    SunlightModule,
    WaterModule,
    FertilizerModule,
  ],
  controllers: [WorldController],
  providers: [WorldRepository, WorldService],
  exports: [WorldRepository, WorldService],
})
export class WorldModule {}
