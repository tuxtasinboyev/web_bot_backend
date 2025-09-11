import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[JwtModule],
  providers: [HouseService],
  controllers: [HouseController]
})
export class HouseModule {}
