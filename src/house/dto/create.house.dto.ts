import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ description: 'Uyning Kvadrati' })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiPropertyOptional({ description: 'Uyning qavati' })
  @IsInt()
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ description: 'Uyning hamma qavati' })
  @IsInt()
  @IsOptional()
  allFloor?: number;

  @ApiProperty({ description: 'Uyning narxi' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Xonalar soni' })
  @IsInt()
  rooms: number;

  @ApiPropertyOptional({ description: 'Kategoriya ID si' })
  @IsInt()
  @IsOptional()
  categoryId?: number;
  @ApiProperty({ description: 'Ijara davomiyligi kunlarda (5–20)' })
  @IsInt()
  durationDays: number;
  
}
