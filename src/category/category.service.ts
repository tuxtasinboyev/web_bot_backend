import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlinkFile } from 'src/common/types/file.cotroller.typpes';
import { urlGenerator } from 'src/common/types/generator.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService, private readonly config: ConfigService) { }

    async createCategory(name: string, image?: string) {
        const existsCategory = await this.prisma.category.findUnique({
            where: { name },
        });
        if (existsCategory) {
            throw new BadRequestException('Bunday kategoriya mavjud');
        }
        if (image) {
            image = urlGenerator(this.config, image)
        }

        const newCategory = await this.prisma.category.create({
            data: {
                name,
                imgUrl: image || "https://thumbs.dreamstime.com/b/effel-tower-night-paris-june-eiffel-june-paris-france-eiffel-neighborhood-metal-structure-eiffel-55011255.jpg",
            },
        });
        return newCategory;
    }

    async getAllCategories(page?: number, limit?: number, search?: string) {
        let skip
       if(page && limit){
          skip = (page - 1) * limit;
       }
        const where: any = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        return this.prisma.category.findMany({
            where,
            skip,
            take: limit,
        });
    }

    async getCategoryById(id: number) {
        const existsCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existsCategory) {
            throw new NotFoundException('Bunday kategoriya mavjud emas');
        }
        return existsCategory;
    }

    async updateCategory(id: number, name?: string, image?: string) {
        const existsCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existsCategory) {
            throw new NotFoundException('Bunday kategoriya mavjud emas');
        }
        if (existsCategory.imgUrl) {
            const fileName = existsCategory.imgUrl.split('/').at(-1)
            unlinkFile(fileName || "")
        }

        const data: any = {};

        if (name) {
            const nameExists = await this.prisma.category.findUnique({
                where: { name },
            });
            if (nameExists && nameExists.id !== id) {
                throw new BadRequestException('Bunday kategoriya nomi mavjud');
            }
            data.name = name;
        }

        if (image) {
            data.imgUrl = urlGenerator(this.config, image);
        }

        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data,
        });

        return updatedCategory;
    }

    async deleteCategory(id: number) {
        const existsCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existsCategory) {
            throw new NotFoundException('Bunday kategoriya mavjud emas');
        }
        if (existsCategory.imgUrl) {
            const fileName = existsCategory.imgUrl.split('/').at(-1)
            unlinkFile(fileName || "")
        }

        await this.prisma.category.delete({
            where: { id },
        });

        return { message: "Kategoriya muvaffaqiyatli o'chirildi" };
    }
    async getStatistika() {
        const [
            userCount,
            houseCount,
            ownersCount,
            tenantCount,
            average,
            categoryCount,
            adminCount
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.house.count(),
            this.prisma.user.count({ where: { role: 'OWNER' } }),
            this.prisma.user.count({ where: { role: 'OWNER' } }),
            this.prisma.house.aggregate({
                _avg: { price: true },
            }),
            this.prisma.category.count(),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
        ]);

        return {
            totalUsers: userCount,
            totalHouses: houseCount,
            totalOwners: ownersCount,
            totalTenants: tenantCount,
            averagePrice: average._avg.price || 0,
            totalCategories: categoryCount,
            adminCount
        };
    }
}
