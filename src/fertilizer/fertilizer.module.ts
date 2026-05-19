import { Module } from '@nestjs/common';
import { FertilizerService } from './fertilizer.service';

@Module({
  providers: [FertilizerService],
  exports: [FertilizerService],
})
export class FertilizerModule {}
