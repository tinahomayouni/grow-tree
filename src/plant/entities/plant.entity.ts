import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plants')
export class PlantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Seedling' })
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'float', default: 0 })
  growthPoints: number;

  @Column({ type: 'float', default: 100 })
  health: number;

  @Column({ type: 'float', default: 50 })
  hydration: number;

  @Column({ type: 'float', default: 0 })
  playerSunAlignment: number;

  @Column({ type: 'timestamptz', nullable: true })
  fertilizerBoostUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastUpdatedAt: Date;
}
