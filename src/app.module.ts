import { Global, Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { PrismaModule } from './prisma/prisma.module';
import { BotService } from './botservice';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
// import { CommonModule } from './common/common.module';
import { HouseModule } from './house/house.module';
import { CoreModule } from './core/core.module';
import { SeadersModule } from './seaders/seaders.module';

@Global()
@Module({
  imports: [CoreModule, BotModule, PrismaModule, CategoryModule, ConfigModule.forRoot({
    isGlobal: true,
  }), HouseModule, SeadersModule],
  controllers: [],
  providers: [BotService],
})
export class AppModule { }
