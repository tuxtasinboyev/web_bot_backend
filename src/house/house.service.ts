import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHouseDto } from './dto/create.house.dto';
import { urlGenerator } from 'src/common/types/generator.types';
import { ConfigService } from '@nestjs/config';
import { unlinkFile } from 'src/common/types/file.cotroller.typpes';
import { Prisma } from '@prisma/client';

@Injectable()
export class HouseService {
    constructor(
        private readonly prisma: PrismaService, private config: ConfigService
    ) { }

    async createHouse(userId: number, payload: CreateHouseDto, image: string[]) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existsCategory = await this.prisma.category.findUnique({ where: { id: Number(payload.categoryId) } })
        if (!existsCategory) throw new NotFoundException('bunday id category mavjud emas')

        const uploadedImages = image.map((img) => urlGenerator(this.config, img))


        const newHouse = await this.prisma.house.create({
            data: {
                ...payload,
                price: Number(payload.price),
                floor: payload.floor,
                allFloor: payload.allFloor,
                rooms: payload.rooms,
                area: payload.area,
                categoryId: payload.categoryId,
                images: uploadedImages,
                ownerId: user.id,
            },
            include: {
                owner: { select: { id: true, name: true, phone: true, role: true } },
                Category: { select: { id: true, name: true } }
            }
        });


        return newHouse;
    }

    async getAllHouses(
        page?: number,
        limit?: number,
        search?: string,
        price?: string
    ) {
        let skip
        let take
        if (page && limit) {
            skip = (page - 1) * limit;
        }

        if (limit) {
            take = Math.min(limit, 50);
        }

        const where: any = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (price) {
            const [operator, value] = price.split(':');
            const priceValue = parseInt(value, 10);
            if (!isNaN(priceValue)) {
                const priceFilter: any = {};
                switch (operator) {
                    case 'gte': priceFilter.gte = priceValue; break;
                    case 'lte': priceFilter.lte = priceValue; break;
                    case 'eq': priceFilter.equals = priceValue; break;
                }
                where.price = priceFilter;
            }
        }

        const houses = await this.prisma.house.findMany({
            skip,
            take,
            where,
            include: {
                owner: { select: { id: true, name: true, phone: true, role: true } },
                Category: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await this.prisma.house.count({ where });

        return {
            data: houses,
            total,
            page,
            last_page: Math.ceil(total / take)
        };
    }

    async getHouseById(id: number) {
        const house = await this.prisma.house.findUnique({
            where: { id: Number(id) },
            include: {
                owner: { select: { id: true, name: true, phone: true, role: true } },
                Category: { select: { id: true, name: true } }
            }
        });
        if (!house) throw new NotFoundException('House not found');
        return house;
    }
    async getHouseMe(userId: number) {
        const house = await this.prisma.house.findMany({
            where: { ownerId: Number(userId) },
            include: {
                owner: { select: { id: true, name: true, phone: true, role: true } },
                Category: { select: { id: true, name: true } }
            }
        });
        if (!house) throw new NotFoundException('House not found');
        return house;
    }


    async updateHouse(
        id: number,
        userId: number,
        payload: Partial<CreateHouseDto>,
        image?: string[]
    ) {
        const house = await this.prisma.house.findUnique({ where: { id } });
        if (!house) throw new NotFoundException('House not found');

        if (house.ownerId !== userId) {
            throw new UnauthorizedException('Siz bu uyni yangilay olmaysiz');
        }

        // eski rasmlarni o‘chirish
        if (house.images && image) {
            house.images.forEach((img) => {
                const fileNameToDelete = img.split('/').at(-1) || '';
                if (house.images.includes(img)) {
                    unlinkFile(fileNameToDelete);
                }
            });
        }

        const images = image?.map((img) => urlGenerator(this.config, img));
        const dataToUpdate: any = {};

        if (payload.title) dataToUpdate.title = payload.title;
        if (payload.price !== undefined)
            dataToUpdate.price = Number(payload.price);           // 🔧
        if (payload.rooms !== undefined)
            dataToUpdate.rooms = Number(payload.rooms);           // 🔧
        if (payload.area !== undefined)
            dataToUpdate.area = Number(payload.area);             // 🔧
        if (payload.floor !== undefined)
            dataToUpdate.floor = Number(payload.floor);           // 🔧
        if (payload.allFloor !== undefined)
            dataToUpdate.allFloor = Number(payload.allFloor);     // 🔧
        if (payload.address) dataToUpdate.address = payload.address;
        if (payload.description) dataToUpdate.description = payload.description;
        if (payload.categoryId !== undefined)
            dataToUpdate.categoryId = Number(payload.categoryId); // 🔧
        if (images) dataToUpdate.images = images;

        dataToUpdate.ownerId = userId;

        return this.prisma.house.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: {
                owner: { select: { id: true, name: true, phone: true, role: true } },
                Category: { select: { id: true, name: true } },
            },
        });
    }

    async deleteHouse(id: number, userId: number) {
        const house = await this.prisma.house.findUnique({ where: { id: Number(id) } });
        if (!house) throw new NotFoundException('House not found');


        if (house.images) {
            house.images.map((img) => {
                const fileNames = img.split('/').at(-1)
                unlinkFile(fileNames || "")
            })
        }
        if (house.ownerId !== userId) throw new UnauthorizedException('Siz bu uyni o`chira olmaysiz');

        await this.prisma.house.delete({ where: { id } });

        return { message: 'House deleted successfully' };
    }
}
