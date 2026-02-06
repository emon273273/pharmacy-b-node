import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    try {
      if (!createSupplierDto.name) {
        throw new BadRequestException('Name is required');
      }

      const supplier = await this.supplierService.create(createSupplierDto);
      return {
        message: 'Supplier created successfully',
        supplier,
      };
    } catch (error) {
      const err = error as Error;
      if (err.name === 'BadRequestException') {
        throw error;
      }
      throw new InternalServerErrorException({
        status: false,
        message: 'Server error',
        error: err.message,
      });
    }
  }
}
