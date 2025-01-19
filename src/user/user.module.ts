import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite, User } from 'src/entities/index';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
