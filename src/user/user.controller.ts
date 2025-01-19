import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator';
import { User } from 'src/entities';
import { JwtGuard } from 'src/auth/guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@GetUser() user: User) {
    try {
      return await this.userService.getProfile(user.id);
    } catch (error) {
      console.error(`Error fetching profile for user ${user.id}:`, error);
      throw error;
    }
  }
}
