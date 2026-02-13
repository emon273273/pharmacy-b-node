import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, InternalServerErrorException, UseGuards, Get, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    try {
      if (!createSupplierDto.name) {
        throw new BadRequestException('Name is required');
      }

      return this.supplierService.create(createSupplierDto);

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

  // get all
  @Get()
  @UseGuards(JwtAuthGuard)

  async getAllSupplier(@Query() query: any) {
    try {
      return this.supplierService.getAllSupplier(query);
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
