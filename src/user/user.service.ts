import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User, Favorite } from 'src/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getProfile(userId: number) {
    try {
      if (!userId || typeof userId !== 'number') {
        throw new BadRequestException('Invalid user ID');
      }

      const cachedProfile = await this.cacheManager.get(`profile-${userId}`);
      if (cachedProfile) {
        console.log('Returning cached profile');
        return cachedProfile;
      }

      console.log('Fetching profile from database');
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          patronimic: true,
        },
        relations: ['favorites', 'favorites.article'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const { id, ...profile } = user;

      await this.cacheManager.set(`profile-${userId}`, profile, 60000);

      return profile;
    } catch (error) {
      console.error(`Error retrieving profile for user ID ${userId}:`, error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while retrieving the user profile. Please try again later.',
      );
    }
  }
}
