import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createUser(@Body() dto: { name: string; phone: string; role: Role }) {
    return this.prisma.user.create({
      data: dto,
    });
  }
}
