import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../entities/index';

export const GetUser = createParamDecorator(
  (data: keyof undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User | undefined;
    if (user) {
      if (data) {
        return user[data];
      }
      return user;
    }
    return null;
  },
);
