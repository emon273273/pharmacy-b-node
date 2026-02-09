import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.category.create({
      data: { name },
    });
  }

  //find all
  async findAll(){

    return this.prisma.category.findMany();
  }
}
