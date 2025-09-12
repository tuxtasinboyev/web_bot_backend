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
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HouseService } from './house.service';
import { CreateHouseDto } from './dto/create.house.dto';
import { GuardsService } from 'src/common/guards/guards.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HouseApiBody, RequiredHouseApiBody } from 'src/common/types/api.body.types';
import { fileStorages } from 'src/common/types/upload_types';

@ApiTags('Houses')
@Controller('houses')
export class HouseController {
  constructor(private readonly houseService: HouseService) { }

  @UseGuards(GuardsService)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi uy yaratish (kamida 3 rasm bilan)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(RequiredHouseApiBody)
  @UseInterceptors(FilesInterceptor('images', 10, fileStorages(["image"])))
  async createHouse(
    @Req() req: any,
    @Body() payload: CreateHouseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length < 3) {
      throw new BadRequestException('Kamida 3 ta rasm yuklash kerak');
    }

    const userId = req.user.id;
    const file = files.map(img => img.filename)
    return this.houseService.createHouse(userId, payload, file);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha uylani olish' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'price', required: false, type: String, description: 'Misol: gte:1000' })
  async getAllHouses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('price') price?: string,
  ) {
    return this.houseService.getAllHouses(Number(page), Number(limit), search, price);
  }

  @Get('me')
  @UseGuards(GuardsService)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'uzini ularini olish' })
  async getHouseMe(@Req() req) {
    return this.houseService.getHouseMe(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo‘yicha uy olish' })
  @ApiParam({ name: 'id', type: String })
  async getHouseById(@Param('id') id: string) {
    return this.houseService.getHouseById(+id);
  }

  @UseGuards(GuardsService)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uy ma`lumotlarini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(HouseApiBody)
  @UseInterceptors(FilesInterceptor('images', 10, fileStorages(['image'])))
  async updateHouse(
    @Param('id') id: string,
    @Req() req: any,
    @Body() payload: Partial<CreateHouseDto>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = req.user.id;
    const file = files?.map(file => file.filename)
    if (file) {
      return this.houseService.updateHouse(+id, userId, payload, file);
    }
    return this.houseService.updateHouse(+id, userId, payload);
  }

  @UseGuards(GuardsService)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uyni o‘chirish (faqat egasi)' })
  @ApiParam({ name: 'id', type: String })
  async deleteHouse(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.houseService.deleteHouse(+id, userId);
  }
}
