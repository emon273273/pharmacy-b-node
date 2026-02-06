import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePermissionDto {
  @IsInt()
  @IsNotEmpty()
  role: number;

  @IsArray()
  @IsInt({ each: true })
  permissionId: number[];
}
