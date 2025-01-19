import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UserModule } from './user/user.module';
import { ElsearchModule } from './elsearch/elsearch.module';
import { postgresConfig } from './databases/index';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(postgresConfig),
    AuthModule,
    ArticlesModule,
    FavoritesModule,
    UserModule,
    ElsearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
