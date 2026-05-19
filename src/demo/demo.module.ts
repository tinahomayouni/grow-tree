import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantEntity } from '../plant/entities/plant.entity';
import { PlantModule } from '../plant/plant.module';
import { WorldModule } from '../world/world.module';
import { DemoController } from './demo.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantEntity]),
    PlantModule,
    WorldModule,
  ],
  controllers: [DemoController],
})
export class DemoModule {}
