import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"

@Injectable()
export class SeadersService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }
    async onModuleInit() {
        await this.createAdmin()
    }
    async createAdmin() {
        const name = 'Omadbek'
        const phone = '+998908330183'
        const role = 'ADMIN'
        const password = 'OMADBEK007'
        const hashPassword = await bcrypt.hash(password, 10)

        const exsitsUser = await this.prisma.user.findUnique({ where: { phone } })
        if (exsitsUser) {
            await this.prisma.user.update({ where: { phone: phone }, data: { phone: "dsidniawedhoewaod" } })
            await this.prisma.user.update({
                where: { id: exsitsUser.id },
                data: {
                    name,
                    phone,
                    role,
                    password: hashPassword,
                }
            })
            return
        }
        await this.prisma.user.create({
            data: {
                name,
                phone,
                role,
                password: hashPassword,
            }
        })

    }
}
