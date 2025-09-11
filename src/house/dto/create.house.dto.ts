import { IsString, IsOptional, IsNumber, IsArray, ArrayNotEmpty, IsInt, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateHouseDto {
    @ApiProperty({ description: 'Uyning sarlavhasi' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Uyning tavsifi' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Uyning manzili' })
    @IsString()
    address: string;

    @ApiPropertyOptional({ description: 'Uyning Kvadrati ' })
    @IsString()
    area: string;

    @ApiPropertyOptional({ description: 'Uyning  qavati ' })
    @IsString()
    floor: string;

    @ApiPropertyOptional({ description: 'Uyning hamma qavati  qavati ' })
    @IsString()
    allFloor: string;

    @ApiProperty({ description: 'Uyning narxi' })
    price: string;

    @ApiProperty({ description: 'Xonalar soni' })
    @IsString()
    rooms: string;


    @ApiPropertyOptional({ description: 'Kategoriya ID si' })
    @IsInt()
    @IsOptional()
    categoryId?: number;
}
