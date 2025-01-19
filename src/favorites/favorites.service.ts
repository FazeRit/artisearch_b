import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from 'src/entities';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async addToFavorites(userId: number, articleId: number) {
    try {
      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          article: { id: articleId },
        },
      });

      if (existingFavorite) {
        throw new BadRequestException('Article is already in favorites.');
      }

      const favorite = this.favoriteRepository.create({
        user: { id: userId },
        article: { id: articleId },
      });

      await this.favoriteRepository.save(favorite);

      return { message: 'Article added to favorites' };
    } catch (error) {
      console.error('Error adding article to favorites:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Could not add article to favorites. Please try again later.',
      );
    }
  }

  async removeFromFavorites(userId: number, articleId: number) {
    try {
      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          article: { id: articleId },
        },
      });

      if (!existingFavorite) {
        throw new BadRequestException('Article is not in favorites.');
      }

      await this.favoriteRepository.delete(existingFavorite.id);

      return { message: 'Article removed from favorites' };
    } catch (error) {
      console.error('Error removing article from favorites:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Could not remove article from favorites. Please try again later.',
      );
    }
  }
}
