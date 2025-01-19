import {
  Controller,
  Post,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtGuard } from 'src/auth/guard/index';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @UseGuards(JwtGuard)
  @Post('fetch-articles')
  async getArticles() {
    try {
      return await this.articlesService.fetchArticles();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch articles. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtGuard)
  @Post('fetch-tags')
  async fetchTags() {
    try {
      return await this.articlesService.fetchTags();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tags. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tags')
  async getTags() {
    try {
      return await this.articlesService.getTags();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tags. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
