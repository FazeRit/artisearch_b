import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/index';
import { Tag } from 'src/entities/tag.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Article, Tag])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
