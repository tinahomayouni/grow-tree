import { BadRequestException, Injectable } from '@nestjs/common';
import { FERTILIZER } from '../common/constants/game.constants';
import { PlantEntity } from '../plant/entities/plant.entity';
import { WorldEntity } from '../world/entities/world.entity';

export interface FertilizerStatus {
  availableFertilizer: number;
  boostActive: boolean;
  boostExpiresAt: Date | null;
  boostMultiplier: number;
  boostMinutesLeft: number;
  sheepPresent: boolean;
  nextSheepVisit: Date | null;
  minutesUntilSheep: number;
}

@Injectable()
export class FertilizerService {
  processSheepEvents(world: WorldEntity): void {
    const now = new Date();
    if (world.nextSheepVisit && now >= world.nextSheepVisit) {
      world.sheepPresent = true;
      const amount =
        FERTILIZER.SPAWN_AMOUNT_MIN +
        Math.random() *
          (FERTILIZER.SPAWN_AMOUNT_MAX - FERTILIZER.SPAWN_AMOUNT_MIN);
      world.availableFertilizer += Math.round(amount);
      world.lastSheepVisit = now;
      world.sheepPresent = false;
      world.nextSheepVisit = this.scheduleNextSheepVisit();
    }
  }

  decayFertilizer(world: WorldEntity): void {
    if (world.availableFertilizer > 0) {
      world.availableFertilizer = Math.max(
        0,
        world.availableFertilizer - FERTILIZER.DECAY_PER_CYCLE,
      );
    }
  }

  fertilizerBonus(plant: PlantEntity, world: WorldEntity): number {
    if (this.isBoostActive(plant)) {
      return FERTILIZER.BOOST_MULTIPLIER;
    }
    return 1; // fertilizer نبودن دیگه گیاه رو بلاک نمی‌کنه
  }
  
  hasFertilizerForGrowth(_plant: PlantEntity, _world: WorldEntity): boolean {
    return true; // fertilizer شرط رشد نیست، فقط bonus هست
  }

  isBoostActive(plant: PlantEntity): boolean {
    return (
      !!plant.fertilizerBoostUntil &&
      plant.fertilizerBoostUntil > new Date()
    );
  }

  getStatus(world: WorldEntity, plant: PlantEntity | null): FertilizerStatus {
    const boostActive = plant ? this.isBoostActive(plant) : false;
    const boostExpiresAt = boostActive ? plant!.fertilizerBoostUntil : null;
    const boostMinutesLeft = boostExpiresAt
      ? Math.max(0, Math.ceil((boostExpiresAt.getTime() - Date.now()) / 60000))
      : 0;
    const minutesUntilSheep = world.nextSheepVisit
      ? Math.max(
          0,
          Math.ceil(
            (world.nextSheepVisit.getTime() - Date.now()) / 60000,
          ),
        )
      : 0;

    return {
      availableFertilizer: world.availableFertilizer,
      boostActive,
      boostExpiresAt,
      boostMultiplier: boostActive ? FERTILIZER.BOOST_MULTIPLIER : 1,
      boostMinutesLeft,
      sheepPresent: world.sheepPresent,
      nextSheepVisit: world.nextSheepVisit,
      minutesUntilSheep,
    };
  }

  async collectFertilizer(
    world: WorldEntity,
    plant: PlantEntity,
  ): Promise<{ plant: PlantEntity; world: WorldEntity; collected: number }> {
    if (world.availableFertilizer <= 0) {
      throw new BadRequestException('No fertilizer available to collect');
    }
    const collected = world.availableFertilizer;
    world.availableFertilizer = 0;
    plant.fertilizerBoostUntil = new Date(
      Date.now() + FERTILIZER.BOOST_DURATION_MS,
    );
    return { plant, world, collected };
  }

  private scheduleNextSheepVisit(): Date {
    const delay =
      FERTILIZER.SHEEP_MIN_INTERVAL_MS +
      Math.random() *
        (FERTILIZER.SHEEP_MAX_INTERVAL_MS -
          FERTILIZER.SHEEP_MIN_INTERVAL_MS);
    return new Date(Date.now() + delay);
  }

  trySpawnSheep(world: WorldEntity, isUserOnline: boolean): void {
    if (!isUserOnline) return; // کاربر نیست، sheep نمیاد
  
    const now = Date.now();
    if (now < world.nextSheepAt) return;
  
    const amount =
      FERTILIZER.SPAWN_AMOUNT_MIN +
      Math.random() * (FERTILIZER.SPAWN_AMOUNT_MAX - FERTILIZER.SPAWN_AMOUNT_MIN);
  
    world.availableFertilizer += amount;
    world.nextSheepAt =
      now +
      FERTILIZER.SHEEP_MIN_INTERVAL_MS +
      Math.random() *
        (FERTILIZER.SHEEP_MAX_INTERVAL_MS - FERTILIZER.SHEEP_MIN_INTERVAL_MS);
  }
}
