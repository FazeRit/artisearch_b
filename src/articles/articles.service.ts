import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { firstValueFrom } from 'rxjs';
import { Tag } from 'src/entities';
import { AxiosError } from 'axios';

@Injectable()
export class ArticlesService {
  private readonly apiUrl = 'https://dev.to/api';

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private httpService: HttpService,
  ) {}

  async fetchArticles(): Promise<Article[]> {
    const tag = 'backend';
    const perPage = 100;
    let page = 1;
    let allArticles = [];
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(this.apiUrl + '/articles', {
            params: {
              tag,
              page,
              per_page: perPage,
            },
          }),
        );

        const data = response.data;

        if (!Array.isArray(data)) {
          throw new Error(
            `Invalid response format. Expected an array, got ${typeof data}.`,
          );
        }

        allArticles = allArticles.concat(data);
        page++;

        if (data.length < perPage) {
          hasMore = false;
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new InternalServerErrorException(
            `Failed to fetch articles from external API: ${error.message}`,
          );
        }
        throw new InternalServerErrorException(
          `Unexpected error occurred while fetching articles: ${error.message}`,
        );
      }
    }

    try {
      const articles = allArticles.map((apiArticle) =>
        this.articlesRepository.create({
          id: apiArticle.id,
          title: apiArticle.title,
          content: apiArticle.description || '',
          description: apiArticle.description || '',
          coverImage: apiArticle.cover_image,
          socialImage: apiArticle.social_image,
          tags: apiArticle.tags || '',
          slug: apiArticle.slug,
          url: apiArticle.url,
          canonicalUrl: apiArticle.canonical_url,
          commentsCount: apiArticle.comments_count,
          positiveReactionsCount: apiArticle.positive_reactions_count,
          collectionId: apiArticle.collection_id,
          readingTimeMinutes: apiArticle.reading_time_minutes,
          createdAt: new Date(apiArticle.created_at),
        }),
      );

      await this.articlesRepository.save(articles);

      return articles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save articles to the database: ${error.message}`,
      );
    }
  }

  async fetchTags(): Promise<Tag[]> {
    try {
      const articles = await this.articlesRepository.find();

      const uniqueTags = new Set<string>();

      articles.forEach((article) => {
        article.tags.split(',').forEach((tag) => {
          uniqueTags.add(tag.trim());
        });
      });

      const tagEntities = Array.from(uniqueTags).map((tag) =>
        this.tagsRepository.create({ name: tag }),
      );

      const savedTags = await this.tagsRepository.save(tagEntities);

      return savedTags;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to process or save tags: ${error.message}`,
      );
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      const tags = await this.tagsRepository.find();

      if (!tags) {
        throw new InternalServerErrorException(
          'No tags found in the database.',
        );
      }

      return tags;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve tags from the database: ${error.message}`,
      );
    }
  }
}
