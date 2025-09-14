import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
  UploadedFile,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './bot.service';
import { CreateUserDto, CreateUserForAdminDto } from './dto/create.user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { roles } from 'src/common/role/role.decorator';
import { GuardsService } from 'src/common/guards/guards.service';
import multer from 'multer';
import { fileStorages } from 'src/common/types/upload_types';
import { urlGenerator } from 'src/common/types/generator.types';
import { pay } from 'node_modules/telegraf/typings/button';
import type { Request } from 'express';
import { RoleGuard } from 'src/common/role/role.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  @ApiOperation({ summary: 'Foydalanuvchi ro‘yxatdan o‘tishi' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi yaratildi' })
  async register(@Body() payload: CreateUserDto) {
    return this.userService.registerUser(payload);
  }

  @Post('login')
  @ApiOperation({ summary: 'Foydalanuvchi tizimga kirishi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['phone', 'password'],
    },
  })
  async login(@Body('phone') phone: string, @Body('password') password: string) {
    return this.userService.loginUser(phone, password);
  }

  @UseGuards(GuardsService,RoleGuard)
  @roles(Role.ADMIN) // faqat adminlar ko‘ra oladi
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha foydalanuvchilarni olish (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'price', required: false, type: String, description: 'Misol: gte:1000' })
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('price') price?: string,
  ) {
    return this.userService.getAllUsers(Number(page), Number(limit), search, price);
  }

  @Get('me')
  @UseGuards(GuardsService,RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "O‘z profilini olish" })
  @ApiOkResponse({ description: 'Foydalanuvchi maʼlumotlari muvaffaqiyatli olindi' })
  async getMe(@Req() req) {

    return this.userService.getUserMe(req.user.id);
  }


  @Get(':id')
  @UseGuards(GuardsService,RoleGuard)

  @roles(Role.ADMIN) // faqat adminlar
  @ApiOperation({ summary: 'ID bo‘yicha foydalanuvchini olish (Admin)' })
  @ApiParam({ name: 'id', type: String })
  async getById(@Param('id') id: string) {
    return this.userService.getUserById(+id);
  }


  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'] },
        imgUrl: { type: 'string', format: 'binary' }, // fayl uchun
      },
    },
  })
  @Put(':id')
  @UseGuards(GuardsService,RoleGuard)
  @roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('imgUrl', fileStorages(["image"])))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() payload: Partial<CreateUserDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    if (file) {
      return this.userService.updateUser(+id, payload, file?.filename);
    } else {
      return this.userService.updateUser(+id, payload)
    }

  }
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'] },
        imgUrl: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseGuards(GuardsService,RoleGuard)
  @roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('imgUrl', fileStorages(["image"])))
  @ApiBearerAuth()
  async createUserForAdmin(
    @Req() req,
    @Body() payload: CreateUserForAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    if (file) {
      return this.userService.createUserForAdmin(payload, file?.filename);
    } else {
      return this.userService.createUserForAdmin(payload)
    }

  }

  @UseGuards(GuardsService,RoleGuard)
  @roles(Role.ADMIN) // faqat adminlar
  @Delete(':id')
  @ApiOperation({ summary: 'Foydalanuvchini o‘chirish (Admin)' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string) {
    return this.userService.deleteUser(+id);
  }

  @UseGuards(GuardsService,RoleGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('image', fileStorages(['image'])))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Foydalanuvchi ma`lumotlarini yangilash',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: [Role] },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'O`z profilini yangilash (rasm bilan)' })
  async updateMe(
    @Req() req: any,
    @Body() payload: Partial<CreateUserDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;

    if (file) {
      return this.userService.updateMe(userId, payload, file.filename);
    }
  }

}
