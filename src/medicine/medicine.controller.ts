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
@UseGuards(JwtAuthGuard)
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) { }

  // get all medicine
  @Get()
  async getAllMedicine(@Query() query: MedicineQueryDto) {
    return this.medicineService.getAllMedicine(query);
  }

  // create medicine
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createMedicine(
    @Query('query') queryType: string,
    @Body() createMedicineDto: CreateMedicineDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {

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

  }

  // get single medicine

  @Get(':id')
  async getSingleMedicine(@Param('id', ParseIntPipe) id: number) {

    return this.medicineService.getSingleMedicine(id);
  }



}
