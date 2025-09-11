import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GuardsService implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token yo‘q');
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_ACCESS_SECRET_KEY;
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload;
      return true;
    } catch (err) {
      console.log(err['message'])

      throw new UnauthorizedException('Token noto‘g‘ri yoki muddati tugagan');
    }
  }
}
