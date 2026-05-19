import { Injectable } from '@nestjs/common';
import { SUN } from '../common/constants/game.constants';
import { angleDifference, normalizeAngle } from '../common/utils/angle.util';
import { PlantEntity } from '../plant/entities/plant.entity';
import { WorldEntity } from '../world/entities/world.entity';

export interface SunlightStatus {
  sunAngle: number;
  optimalSunAngle: number;
  playerAlignment: number;
  alignmentDelta: number;
  sunlightIntensity: number;
  growthMultiplier: number;
  alignmentLabel: 'perfect' | 'partial' | 'wrong';
  isDaytime: boolean;
}

@Injectable()
export class SunlightService {
  advanceSun(world: WorldEntity): void {
    world.sunAngle = normalizeAngle(
      world.sunAngle + SUN.ROTATION_PER_MINUTE,
    );
    world.optimalSunAngle = normalizeAngle(world.sunAngle);
    world.sunlightIntensity = world.isDaytime
      ? this.intensityForProgress(world.dayProgress)
      : 0;
  }

  updateDayNight(world: WorldEntity): void {
    world.dayProgress += 1 / 24;
    if (world.dayProgress >= 1) {
      world.dayProgress = 0;
    }
    world.isDaytime = world.dayProgress >= 0.25 && world.dayProgress < 0.85;
    world.sunlightIntensity = world.isDaytime
      ? this.intensityForProgress(world.dayProgress)
      : 0;
  }

  getStatus(world: WorldEntity, plant: PlantEntity | null): SunlightStatus {
    const playerAlignment = plant?.playerSunAlignment ?? 0;
    const delta = angleDifference(playerAlignment, world.optimalSunAngle);
    const growthMultiplier = world.isDaytime
      ? this.growthMultiplier(delta)
      : 0;
    return {
      sunAngle: world.sunAngle,
      optimalSunAngle: world.optimalSunAngle,
      playerAlignment,
      alignmentDelta: delta,
      sunlightIntensity: world.sunlightIntensity,
      growthMultiplier,
      alignmentLabel: this.alignmentLabel(delta),
      isDaytime: world.isDaytime,
    };
  }

  growthMultiplier(delta: number): number {
    if (delta <= SUN.PERFECT_THRESHOLD) {
      return SUN.PERFECT_MULTIPLIER;
    }
    if (delta <= SUN.PARTIAL_THRESHOLD) {
      return SUN.PARTIAL_MULTIPLIER;
    }
    return SUN.WRONG_MULTIPLIER;
  }

  private alignmentLabel(
    delta: number,
  ): 'perfect' | 'partial' | 'wrong' {
    if (delta <= SUN.PERFECT_THRESHOLD) return 'perfect';
    if (delta <= SUN.PARTIAL_THRESHOLD) return 'partial';
    return 'wrong';
  }

  private intensityForProgress(dayProgress: number): number {
    const midday = 0.55;
    const distance = Math.abs(dayProgress - midday);
    return Math.max(0.2, 1 - distance * 2);
  }
}
