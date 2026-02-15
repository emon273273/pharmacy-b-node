import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicineService } from './medicine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) { }

  // get all medicine
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllMedicine(@Query() query: MedicineQueryDto) {
    try {
      return this.medicineService.getAllMedicine(query);
    } catch (error) {
      const err = error as Error;
      console.error('Get All Medicines Error:', err);
      throw new InternalServerErrorException({
        status: false,
        message: 'Server error',
        error: err.message,
      });
    }
  }

  // create medicine
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createMedicine(
    @Query('query') queryType: string,
    @Body() createMedicineDto: CreateMedicineDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (queryType === 'single') {
        return this.medicineService.createSingleMedicine(createMedicineDto);
      }

      if (queryType === 'createMany') {
        if (!file) {
          throw new BadRequestException('No file uploaded');
        }
        return this.medicineService.createBulkMedicine(file);
      }

      throw new BadRequestException('Invalid query type');
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

  // get single medicine

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSingleMedicine(@Param('id',ParseIntPipe)id:number){

    try{
      const medicine =await this.medicineService.getSingleMedicine(id);
      return medicine;
    }
    catch(error){
      const err = error as Error;
      console.error('Get Single Medicine Error:', err);
      throw new InternalServerErrorException({
        status: false,
        message: 'Server error',
        error: err.message,
      })
    }
  }



}
