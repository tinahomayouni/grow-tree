import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoModule } from './demo/demo.module';
import { PlantModule } from './plant/plant.module';
import { PlantEntity } from './plant/entities/plant.entity';
import { SchedulerModule } from './scheduler/scheduler.module';
import { WorldModule } from './world/world.module';
import { WorldEntity } from './world/entities/world.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'grow'),
        entities: [PlantEntity, WorldEntity],
        synchronize: config.get('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    DemoModule,
    WorldModule,
    PlantModule,
    SchedulerModule,
  ],
})
export class AppModule {}
