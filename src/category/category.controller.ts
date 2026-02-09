import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, InternalServerErrorException, Query, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

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
  async getCategories(@Query('query')query:string){

    try{

      if(query==='all'){

        const categories =await this.categoryService.findAll();
        return {
          message:'Categories fetched successfully',
          categories
        }
      }
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
