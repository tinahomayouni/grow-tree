import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantEntity } from '../entities/plant.entity';

@Injectable()
export class PlantRepository {
  constructor(
    @InjectRepository(PlantEntity)
    private readonly repo: Repository<PlantEntity>,
  ) {}

  findOne(): Promise<PlantEntity | null> {
    return this.repo.findOne({ where: {}, order: { createdAt: 'ASC' } });
  }

  findById(id: string): Promise<PlantEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<PlantEntity>): Promise<PlantEntity> {
    const plant = this.repo.create(data);
    return this.repo.save(plant);
  }

  save(plant: PlantEntity): Promise<PlantEntity> {
    return this.repo.save(plant);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
