import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/entities';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user as User;
    console.log(user);
    if (!user) {
      throw new ForbiddenException('No user found');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('You need to have admin role');
    }

    return true;
  }
}
