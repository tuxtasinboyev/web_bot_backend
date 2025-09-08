import { Module } from '@nestjs/common';
import { UsersController } from './bot.controller';
// import { BotService } from './bot.service';

@Module({
  controllers: [UsersController],
  providers: []
})
export class BotModule {}
