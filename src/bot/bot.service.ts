import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ConflictException } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { PrismaService } from "src/prisma/prisma.service";
import ms, { StringValue } from "ms";
import { CreateUserDto, CreateUserForAdminDto } from "./dto/create.user.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { urlGenerator } from "src/common/types/generator.types";
import { unlinkFile } from "src/common/types/file.cotroller.typpes";

@Injectable()
export class UserService {
    private readonly accessSecret: Secret;
    private readonly refreshSecret: Secret;
    private readonly accessDuration: StringValue;
    private readonly refreshDuration: StringValue;

    constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
        if (!process.env.JWT_ACCESS_SECRET_KEY || !process.env.JWT_REFRESH_SECRET_KEY) {
            throw new NotFoundException("❌ JWT secret kalitlari .env faylida belgilanmagan!");
        }

        this.accessSecret = process.env.JWT_ACCESS_SECRET_KEY as Secret;
        this.refreshSecret = process.env.JWT_REFRESH_SECRET_KEY as Secret;
        this.accessDuration = (process.env.JWT_ACCESS_DURATION || "100y") as StringValue;
        this.refreshDuration = (process.env.JWT_REFRESH_DURATION || "100y") as StringValue;
    }

    public generateAccessToken(user: { id: number; phone: string; name: string; role: Role }): string {
        const payload: JwtPayload = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
        };
        const options: SignOptions = { expiresIn: Math.floor(ms(this.accessDuration) / 1000) };
        return jwt.sign(payload, this.accessSecret, options);
    }

    public generateRefreshToken(user: { id: number }): string {
        const payload: JwtPayload = { id: user.id };
        const options: SignOptions = { expiresIn: Math.floor(ms(this.refreshDuration) / 1000) };
        return jwt.sign(payload, this.refreshSecret, options);
    }

    async registerUser(payload: CreateUserDto) {
        const exitUser = await this.prisma.user.findUnique({
            where: { phone: payload.phone },
        });
        if (exitUser) {
            throw new BadRequestException("Bunday foydalanuvchi mavjud");
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);
        const newUser = await this.prisma.user.create({
            data: {
                name: payload.name,
                phone: payload.phone,
                password: hashPassword,
                role: payload.role as Role,
            },
        });

        const accessToken = this.generateAccessToken({
            id: newUser.id,
            phone: newUser.phone,
            name: newUser.name,
            role: newUser.role,
        });
        const refreshToken = this.generateRefreshToken({ id: newUser.id });

        return { message: "Foydalanuvchi muvaffaqiyatli yaratildi", newUser, accessToken, refreshToken };
    }

    async loginUser(phone: string, password: string) {
        console.log(phone, password);
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            throw new NotFoundException("Bunday foydalanuvchi mavjud emas");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException("Parol xato");
        }

        const accessToken = this.generateAccessToken({
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
        });
        const refreshToken = this.generateRefreshToken({ id: user.id });

        const { password: salomnn, ...safeUSer } = user
        return { message: "Foydalanuvchi muvaffaqiyatli tizimga kirdi", safeUSer, accessToken, refreshToken };
    }
    async createUserForAdmin(payload: CreateUserForAdminDto, image?: string) {
        const existsPhone = await this.prisma.user.findMany({ where: { phone: payload.phone } });
        if (existsPhone.length > 0) {
            throw new ConflictException('foydalanuvchi allaqachon mavjud');
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);
        const imgUrl = image ? urlGenerator(this.config, image) : "https://example.com/default-avatar.jpg";

        const createUser = await this.prisma.user.create({
            data: {
                name: payload.name,
                password: hashPassword,
                phone: payload.phone,
                role: payload.role,
                imgUrl
            }
        });

        const { password, ...data } = createUser;
        return data;
    }

    async getAllUsers(page?: number, limit?: number, search?: string, price?: string) {
        const where: any = {};

        // Search bo'yicha filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        // Price bo'yicha filter
        if (price) {
            const [operator, value] = price.split(":");
            const priceValue = parseInt(value, 10);
            if (!isNaN(priceValue)) {
                const priceFilter: any = {};
                switch (operator) {
                    case "gte":
                        priceFilter.gte = priceValue;
                        break;
                    case "lte":
                        priceFilter.lte = priceValue;
                        break;
                    case "eq":
                        priceFilter.equals = priceValue;
                        break;
                }
                where.houses = { some: { price: priceFilter } };
            }
        }

        // pagination
        const options: any = {
            where,
            include: {
                houses: {
                    select: {
                        id: true,
                        address: true,
                        price: true,
                        description: true,
                        images: true,
                        Category: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        };

        if (page && limit) {
            options.skip = (page - 1) * limit;
            options.take = Math.min(limit, 50);
        }

        const users = await this.prisma.user.findMany(options);
        const total = await this.prisma.user.count({ where });

        return {
            users,
            total,
            page,
            limit: options.take,
        };
    }


    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                imgUrl: true,
                name: true,
                role: true,
                phone: true,
                houses: {
                    select: {
                        id: true,
                        address: true,
                        price: true,
                        description: true,
                        images: true,
                        Category: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }
        return user;
    }
    async getUserMe(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                imgUrl: true,
                name: true,
                role: true,
                phone: true,
                houses: {
                    select: {
                        id: true,
                        address: true,
                        price: true,
                        description: true,
                        images: true,
                        Category: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }
        return user;
    }

    async updateUser(id: number, payload: Partial<CreateUserDto>, image?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }

        if (user.imgUrl) {
            const fileName = user.imgUrl.split("/").at(-1)
            unlinkFile(fileName || "")
        }

        const query: Partial<User> = { ...payload }
        if (payload.password) {
            const hashPassword = await bcrypt.hash(payload.password, 10);
            payload = { ...payload, password: hashPassword };
        }

        if (payload.phone && payload.phone !== user.phone) {
            const phoneExists = await this.prisma.user.findUnique({
                where: { phone: payload.phone },
            });
            if (phoneExists && phoneExists.id !== id) {
                throw new BadRequestException("Bunday telefon raqam mavjud");
            }
        }

        if (image) {
            query.imgUrl = urlGenerator(this.config, image)

        }

        const updatedUser = await this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                name: payload.name,
                password: payload.password,
                phone: payload.phone,
                role: payload.role,
                imgUrl: query.imgUrl
            },
        });

        const { password, ...safeUser } = updatedUser
        return safeUser;
    }


    async deleteUser(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }


        if (user.imgUrl) {
            const fileName = user.imgUrl.split("/").at(-1)
            unlinkFile(fileName || "")
        }
        await this.prisma.user.delete({ where: { id: Number(id) } });

        return { message: "Foydalanuvchi muvaffaqiyatli o'chirildi" };
    }
    async updateMe(id: number, payload: Partial<CreateUserDto>, image?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

        if (user.imgUrl && image) {
            const fileName = user.imgUrl.split("/").at(-1);
            unlinkFile(fileName || "");
        }

        const query: Partial<User> = { ...payload };
        if (image) {
            query.imgUrl = urlGenerator(this.config, image);
        }
        if (payload.password) {
            query.password = await bcrypt.hash(payload.password, 10);
        }

        if (payload.phone && payload.phone !== user.phone) {
            const exists = await this.prisma.user.findUnique({
                where: { phone: payload.phone },
            });

            if (exists && exists.id !== id) {
                throw new ConflictException('Bu telefon raqam boshqa foydalanuvchida mavjud');
            }
        }

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: Number(id) },
                data: query,
            });
            return updatedUser;
        } catch (err: any) {
            if (err.code === 'P2002') {
                throw new ConflictException('Bu telefon raqam boshqa foydalanuvchida mavjud');
            }
            throw err;
        }
    }




}
