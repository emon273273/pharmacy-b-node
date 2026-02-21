import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return {
      message: 'Supplier created successfully',
      supplier,
    };
  }

  async getAllSupplier(query: any) {
    if (query.query === 'all') {
      const supplier = await this.prisma.supplier.findMany({
        orderBy: {
          id: 'desc'
        }
      });

      return {
        message: 'Supplier fetched successfully',
        supplier,
      };
    }
  }
}
