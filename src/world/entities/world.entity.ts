import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { Season } from '../../common/constants/game.constants';

@Entity('world')
export class WorldEntity {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ type: 'float', default: 0 })
  sunAngle: number;

  @Column({ type: 'float', default: 90 })
  optimalSunAngle: number;

  @Column({ type: 'float', default: 0 })
  sunlightIntensity: number;

  @Column({ default: true })
  isDaytime: boolean;

  @Column({ type: 'varchar', default: 'spring' })
  season: Season;

  @Column({ type: 'float', default: 0 })
  dayProgress: number;

  @Column({ type: 'float', default: 100 })
  currentWater: number;

  @Column({ type: 'float', default: 100 })
  maxWater: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastWaterRefill: Date;

  @Column({ type: 'float', default: 0 })
  availableFertilizer: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastSheepVisit: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  nextSheepVisit: Date | null;

  @Column({ default: false })
  sheepPresent: boolean;

  @Column({ type: 'int', default: 0 })
  simulationTicks: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastUpdatedAt: Date;
}
