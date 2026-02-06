import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Feature Modules
import { UserModule } from './user/user.module';
import { SettingsModule } from './settings/settings.module';
import { CategoryModule } from './category/category.module';
import { SupplierModule } from './supplier/supplier.module';
import { MedicineModule } from './medicine/medicine.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate Limiting (equivalent to express-rate-limit)
    ThrottlerModule.forRoot([{
      ttl: 15 * 60 * 1000, // 15 minutes
      limit: 100, // 100 requests per window
    }]),
    
    // Core Modules
    PrismaModule,
    AuthModule,
    
    // Feature Modules
    UserModule,
    SettingsModule,
    CategoryModule,
    SupplierModule,
    MedicineModule,
  ],
})
export class AppModule {}
