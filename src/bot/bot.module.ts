import { Module } from '@nestjs/common';
import { UserController } from './bot.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './bot.service';

@Module({
  imports: [JwtModule],
  controllers: [UserController],
  providers: [UserService]
})
export class BotModule { }
