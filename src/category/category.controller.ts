import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, InternalServerErrorException, Query, Get, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CategoryQueryDto } from './dto/category-query.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      if (!createCategoryDto.name) {
        throw new BadRequestException('Name is required');
      }

      const category = await this.categoryService.create(createCategoryDto.name);
      return {
        message: 'Category created successfully',
        category,
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

  // get

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCategories(@Query()query:CategoryQueryDto){

    try{

      return await this.categoryService.getAllCategories(query);
    }
    catch(error){
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
