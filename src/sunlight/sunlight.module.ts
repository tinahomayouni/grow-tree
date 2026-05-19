import { Module } from '@nestjs/common';
import { SunlightService } from './sunlight.service';

@Module({
  providers: [SunlightService],
  exports: [SunlightService],
})
export class SunlightModule {}
