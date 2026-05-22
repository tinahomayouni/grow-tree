import { BadRequestException, Injectable } from '@nestjs/common';
import { GROWTH, WATER } from '../common/constants/game.constants';
import { PlantEntity } from '../plant/entities/plant.entity';
import { WorldEntity } from '../world/entities/world.entity';

export interface WaterStatus {
  currentWater: number;
  maxWater: number;
  lastRefill: Date;
  plantHydration: number;
  efficiency: number;
  refillIntervalMs: number;
  msUntilRefill: number;
}

@Injectable()
export class WaterService {
  refillIfNeeded(world: WorldEntity): boolean {
    const elapsed = Date.now() - new Date(world.lastWaterRefill).getTime();
    if (elapsed >= WATER.REFILL_INTERVAL_MS) {
      world.currentWater = world.maxWater;
      world.lastWaterRefill = new Date();
      return true;
    }
    return false;
  }

  msUntilRefill(world: WorldEntity): number {
    const elapsed = Date.now() - new Date(world.lastWaterRefill).getTime();
    return Math.max(0, WATER.REFILL_INTERVAL_MS - elapsed);
  }

  getStatus(world: WorldEntity, plant: PlantEntity | null): WaterStatus {
    return {
      currentWater: world.currentWater,
      maxWater: world.maxWater,
      lastRefill: world.lastWaterRefill,
      plantHydration: plant?.hydration ?? 0,
      efficiency: plant ? this.waterBonus(plant) : 1,
      refillIntervalMs: WATER.REFILL_INTERVAL_MS,
      msUntilRefill: this.msUntilRefill(world),
    };
  }

  waterBonus(plant: PlantEntity): number {
    if (plant.hydration < WATER.MIN_HYDRATION_FOR_GROWTH) {
      return 0;
    }
    if (plant.hydration > WATER.OVERWATER_THRESHOLD) {
      return WATER.OVERWATER_PENALTY;
    }
    return 1;
  }

  async waterPlant(
    world: WorldEntity,
    plant: PlantEntity,
    amount: number = WATER.WATERING_AMOUNT,
  ): Promise<{ plant: PlantEntity; world: WorldEntity; used: number }> {
    this.refillIfNeeded(world);
    const used = Math.min(amount, world.currentWater);
    if (used <= 0) {
      const mins = Math.ceil(this.msUntilRefill(world) / 60000);
      throw new BadRequestException(
        `Tank is empty (${world.currentWater}/${world.maxWater}). Full refill in ~${mins} min.`,
      );
    }
    world.currentWater -= used;
    plant.hydration = Math.min(WATER.HYDRATION_MAX, plant.hydration + used);
  
    // اگه overwater بود از health کم میشه، وگرنه health gain داره
    if (plant.hydration > WATER.OVERWATER_THRESHOLD) {
      plant.health = Math.max(
        GROWTH.MIN_HEALTH,
        plant.health - GROWTH.HEALTH_DECAY_PER_CYCLE,
      );
    } else {
      plant.health = Math.min(
        GROWTH.MAX_HEALTH,
        plant.health + GROWTH.HEALTH_FROM_WATER,
      );
    }
  
    return { plant, world, used };
  }

  decayHydration(plant: PlantEntity): void {
    plant.hydration = Math.max(
      0,
      plant.hydration - WATER.HYDRATION_DECAY_PER_CYCLE,
    );
  }

  hasWaterForGrowth(plant: PlantEntity, world: WorldEntity): boolean {
    return (
      plant.hydration >= WATER.MIN_HYDRATION_FOR_GROWTH ||
      world.currentWater > 0
    );
  }
}
