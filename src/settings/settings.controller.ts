import { Controller, Get, Patch, Body, UseGuards, ForbiddenException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('allpermission')
  @UseGuards(JwtAuthGuard)
  async getAllPermission(@CurrentUser() user: CurrentUserPayload) {
    try {
      if (!user.roleId) {
        throw new UnauthorizedException('Unauthorized');
      }

      const permissionNames = await this.settingsService.getAllPermissions(user.roleId);
      return {
        message: 'All permission',
        data: permissionNames,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Get Permission Error:', err.message);
      throw new InternalServerErrorException({
        message: 'An error occurred while fetching permissions',
      });
    }
  }

  @Patch('updateotherpermission')
  @UseGuards(JwtAuthGuard)
  async updateOtherPermission(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      // Only admin can update other permission
      if (user.roleId !== 1) {
        throw new ForbiddenException('Only admin can update other permission');
      }

      const result = await this.settingsService.updateOtherPermission(
        updatePermissionDto.role,
        updatePermissionDto.permissionId,
      );

      return {
        message: 'Other permission updated successfully',
        data: result,
      };
    } catch (error) {
      const err = error as Error;
      if (err.name === 'ForbiddenException') {
        throw error;
      }
      console.error('Transaction Error:', err.message);
      throw new InternalServerErrorException({
        message: 'An error occurred while updating permissions',
      });
    }
  }
}
