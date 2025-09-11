import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[JwtModule],
  providers: [CategoryService],
  controllers: [CategoryController]
})
export class CategoryModule {}
