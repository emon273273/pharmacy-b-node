import { IsOptional, IsString } from "class-validator";


export class CategoryQueryDto{
     @IsOptional()
      @IsString()
      query?: string;
    
      @IsOptional()
      @IsString()
      key?: string;
    
      @IsOptional()
      @IsString()
      page?: string;
    
      @IsOptional()
      @IsString()
      count?: string;

}