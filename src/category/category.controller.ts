import {
    Controller, Get, Post, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { GuardsService } from 'src/common/guards/guards.service';
import { roles } from 'src/common/role/role.decorator';
import { Role } from '@prisma/client';
import { fileStorages } from 'src/common/types/upload_types';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    // CREATE
    @Post()
    @UseGuards(GuardsService)
    @roles(Role.ADMIN,Role.OWNER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Yangi kategoriya yaratish (Admin)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Kategoriya nomi va rasm (kompyuterdan tanlanadi)',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                image: { type: 'string', format: 'binary' },
            },
            required: ['name'],
        },
    })
    @UseInterceptors(FileInterceptor('image', fileStorages(['image'])))
    async createCategory(
        @Body('name') name: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            return this.categoryService.createCategory(name, file.filename);
        }
        return this.categoryService.createCategory(name);
    }

    @Get('statistika')
    @ApiOperation({ summary: 'Umumiy statistikani olish' })
    async getStatistika() {
        return this.categoryService.getStatistika();
    }

    // GET ALL (barchaga ochiq)
    @Get()
    @ApiOperation({ summary: 'Barcha kategoriyalarni olish' })
    @ApiQuery({ name: 'page', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    async getAllCategories(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.categoryService.getAllCategories(Number(page), Number(limit), search);
    }

    // GET BY ID (barchaga ochiq)
    @Get(':id')
    @ApiOperation({ summary: 'ID bo‘yicha kategoriya olish' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 404, description: 'Kategoriya topilmadi' })
    async getCategoryById(@Param('id') id: string) {
        return this.categoryService.getCategoryById(+id);
    }

    // UPDATE (Admin)
    @Put(':id')
    @UseGuards(GuardsService)
    @roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kategoriya yangilash (Admin)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Yangi nom va rasm (kompyuterdan tanlanadi)',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('image'))
    async updateCategory(
        @Param('id') id: string,
        @Body('name') name?: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const base64Image = file ? file.buffer.toString('base64') : undefined;
        return this.categoryService.updateCategory(+id, name, base64Image);
    }

    // DELETE (Admin)
    @Delete(':id')
    @UseGuards(GuardsService)
    @roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kategoriya o‘chirish (Admin)' })
    @ApiParam({ name: 'id', type: String })
    async deleteCategory(@Param('id') id: string) {
        return this.categoryService.deleteCategory(+id);
    }


}
