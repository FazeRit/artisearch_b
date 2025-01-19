import {
  Body,
  Controller,
  Res,
  Post,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignUpDto, SignInDto } from 'src/common/dto/index';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  @Post('signup')
  async signup(@Body() body: SignUpDto, @Res() res: Response) {
    try {
      const token = await this.authService.signup(body);

      if (!token || !token.access_token) {
        throw new InternalServerErrorException(
          'Failed to generate access token.',
        );
      }

      this.setCookie(res, token.access_token);

      return res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        `Signup failed: ${error.message || 'Unexpected error occurred.'}`,
      );
    }
  }

  @Post('signin')
  async signin(@Body() body: SignInDto, @Res() res: Response) {
    try {
      const token = await this.authService.signin(body);

      if (!token || !token.access_token) {
        throw new InternalServerErrorException(
          'Failed to generate access token.',
        );
      }

      this.setCookie(res, token.access_token);

      return res.status(200).json({ message: 'Signin successful' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Signin failed: ${error.message || 'Unexpected error occurred.'}`,
      );
    }
  }
}
