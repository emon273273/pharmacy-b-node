import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class BatchDto {
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  manufacturingDate?: string;

  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;
}

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @IsString()
  @IsNotEmpty()
  genericName: string;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  dosageType: string;

  @IsString()
  @IsNotEmpty()
  unitType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value) || 0)
  reorderLevel?: number;

  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchDto)
  batches: BatchDto[];
}
