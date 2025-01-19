import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from 'src/common/dto/index';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use.');
      }

      const hash = await argon.hash(dto.password);

      const user = this.usersRepository.create({
        ...dto,
        password: hash,
      });

      const savedUser = await this.usersRepository.save(user);

      return this.signToken(savedUser.id, savedUser.email);
    } catch (error) {
      throw new InternalServerErrorException(
        `Signup failed: ${error.message || 'Unexpected error occurred.'}`,
      );
    }
  }

  async signin(dto: SignInDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('Invalid credentials.');
      }

      const passMatch = await argon.verify(user.password, dto.password);

      if (!passMatch) {
        throw new ForbiddenException('Invalid credentials.');
      }

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error; // Re-throw forbidden errors.
      }
      throw new InternalServerErrorException(
        `Signin failed: ${error.message || 'Unexpected error occurred.'}`,
      );
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = { sub: userId, email };

      const secret = this.config.get<string>('JWT_SECRET');
      if (!secret) {
        throw new InternalServerErrorException('JWT secret is not configured.');
      }

      const token = await this.jwt.signAsync(payload, {
        expiresIn: '60m',
        secret,
      });

      return { access_token: token };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate access token: ${error.message || 'Unexpected error occurred.'}`,
      );
    }
  }
}
