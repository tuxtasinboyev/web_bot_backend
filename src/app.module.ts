import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { PrismaModule } from './prisma/prisma.module';
import { BotService } from './botservice';

@Module({
  imports: [BotModule, PrismaModule],
  controllers: [],
  providers: [BotService],
})
export class AppModule { }
