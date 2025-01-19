import {
  Controller,
  Post,
  UseGuards,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from 'src/entities';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @UseGuards(JwtGuard)
  @Post('/add')
  async addToFavorites(
    @GetUser() user: User,
    @Query('articleId') articleId: string,
  ) {
    const articleIdNumber = parseInt(articleId, 10);
    if (isNaN(articleIdNumber)) {
      throw new BadRequestException('Invalid articleId. Must be a number.');
    }

    return await this.favoritesService.addToFavorites(user.id, articleIdNumber);
  }

  @UseGuards(JwtGuard)
  @Delete('/remove')
  async removeFromFavorites(
    @GetUser() user: User,
    @Query('articleId') articleId: string,
  ) {
    const articleIdNumber = parseInt(articleId, 10);
    if (isNaN(articleIdNumber)) {
      throw new BadRequestException('Invalid articleId. Must be a number.');
    }

    return await this.favoritesService.removeFromFavorites(
      user.id,
      articleIdNumber,
    );
  }
}
