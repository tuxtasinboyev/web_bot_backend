import { Module } from '@nestjs/common';
import { SeadersService } from './seaders.service';

@Module({
  providers: [SeadersService],
  controllers: []
})
export class SeadersModule {}
