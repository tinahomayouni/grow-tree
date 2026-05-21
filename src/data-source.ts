import { DataSource } from 'typeorm';
import { PlantEntity } from './plant/entities/plant.entity';
import { WorldEntity } from './world/entities/world.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'grow',
  entities: [PlantEntity, WorldEntity],
  migrations: ['src/migrations/*.ts'],
});