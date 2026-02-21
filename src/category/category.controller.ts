import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Query, Get, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CategoryQueryDto } from './dto/category-query.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto.name) {
      throw new BadRequestException('Name is required');
    }
    return this.categoryService.create(createCategoryDto.name);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCategories(@Query() query: CategoryQueryDto) {
    return this.categoryService.getAllCategories(query);
  }
}
