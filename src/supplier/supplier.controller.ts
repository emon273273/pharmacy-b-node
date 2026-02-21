import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, UseGuards, Get, Query } from '@nestjs/common';
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
    if (!createSupplierDto.name) {
      throw new BadRequestException('Name is required');
    }
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllSupplier(@Query() query: any) {
    return this.supplierService.getAllSupplier(query);
  }
}
