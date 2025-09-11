import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Foydalanuvchi to‘liq ismi',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Foydalanuvchi telefon raqami (+998901234567 formatida)',
    example: '+998901234567',
  })
  @IsString()
  @IsPhoneNumber('UZ', { message: 'Phone number is invalid' })
  phone: string;

  @ApiProperty({
    description: 'Foydalanuvchi paroli (kamida 6 ta belgidan iborat)',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Foydalanuvchi roli (OWNER yoki TENANT)',
    enum: [Role],
    example: Role.TENANT,
  })
  @IsEnum(Role)
  role: Role;
}
export class CreateUserForAdminDto {
  @ApiProperty({
    description: 'Foydalanuvchi to‘liq ismi',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Foydalanuvchi telefon raqami (+998901234567 formatida)',
    example: '+998901234567',
  })
  @IsString()
  @IsPhoneNumber('UZ', { message: 'Phone number is invalid' })
  phone: string;

  @ApiProperty({
    description: 'Foydalanuvchi paroli (kamida 6 ta belgidan iborat)',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Foydalanuvchi roli (OWNER yoki TENANT)',
    enum: Role,
    example: Role.TENANT,
  })
  @IsEnum(Role)
  role: Role;
}

