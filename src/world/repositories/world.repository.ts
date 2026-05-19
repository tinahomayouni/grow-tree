import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FERTILIZER } from '../../common/constants/game.constants';
import { WorldEntity } from '../entities/world.entity';

const WORLD_ID = 1;

@Injectable()
export class WorldRepository {
  constructor(
    @InjectRepository(WorldEntity)
    private readonly repo: Repository<WorldEntity>,
  ) {}

  async getOrCreate(): Promise<WorldEntity> {
    let world = await this.repo.findOne({ where: { id: WORLD_ID } });
    if (!world) {
      world = this.repo.create({
        id: WORLD_ID,
        sunAngle: 0,
        optimalSunAngle: 90,
        sunlightIntensity: 0.5,
        isDaytime: true,
        season: 'spring',
        dayProgress: 0.25,
        currentWater: 100,
        maxWater: 100,
        lastWaterRefill: new Date(),
        availableFertilizer: 20,
        sheepPresent: false,
        nextSheepVisit: this.randomNextSheepVisit(),
      });
      world = await this.repo.save(world);
    }
    return world;
  }

  save(world: WorldEntity): Promise<WorldEntity> {
    return this.repo.save(world);
  }

  private randomNextSheepVisit(): Date {
    const delay =
      FERTILIZER.SHEEP_MIN_INTERVAL_MS +
      Math.random() *
        (FERTILIZER.SHEEP_MAX_INTERVAL_MS - FERTILIZER.SHEEP_MIN_INTERVAL_MS);
    return new Date(Date.now() + delay);
  }
}
