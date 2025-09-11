import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const roles = (...roles: Role[]) => SetMetadata('role', roles);
