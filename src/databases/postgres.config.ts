import { TypeOrmModule } from '@nestjs/typeorm';
import { Article, User, Favorite, Tag } from '../entities/index';

export const postgresConfig: TypeOrmModule = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1',
  database: 'artisearch',
  entities: [User, Article, Favorite, Tag],
  synchronize: true,
};
