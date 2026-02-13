import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateSupplierDto) {


    try {
      const supplier = this.prisma.supplier.create({
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
    } catch (error) {
      return error;

    }
  }

  async getAllSupplier(query: any) {
    try {

      if (query.query === 'all') {
        const supplier = await this.prisma.supplier.findMany({
          orderBy: {
            id: 'desc'
          }
        });

        return {
          message: 'Supplier fetched successfully',
          supplier,
        }
      }

    } catch (error) {
      return error;
    }
  }
}
