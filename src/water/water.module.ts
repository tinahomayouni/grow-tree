import { Module } from '@nestjs/common';
import { WaterService } from './water.service';

@Module({
  providers: [WaterService],
  exports: [WaterService],
})
export class WaterModule {}
