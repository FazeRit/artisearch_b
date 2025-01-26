import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Article } from '../entities/index';
import { FilterDto } from 'src/common/dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ElsearchService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private ind = 'articles';

  async index() {
    const articles = await this.articleRepository.find();

    for (const article of articles) {
      await this.elasticsearchService.index({
        index: this.ind,
        body: {
          title: article.title,
          content: article.content,
          description: article.description,
          coverImage: article.coverImage,
          socialImage: article.socialImage,
          tags: article.tags.split(',').map((tag) => tag.trim()),
          slug: article.slug,
          url: article.url,
          canonicalUrl: article.canonicalUrl,
          commentsCount: article.commentsCount,
          positiveReactionsCount: article.positiveReactionsCount,
          collectionId: article.collectionId,
          readingTimeMinutes: article.readingTimeMinutes,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        },
      });
    }

    return 'Articles indexed successfully!';
  }

  async searchArticles(
    q: string,
    page: number = 1,
    perPage: number = 10,
    filter: FilterDto,
  ) {
    const { readingTimeMinutes, tags, positiveReactionsCount } = filter;

    const isNoQueryAndFilters =
      !q &&
      !readingTimeMinutes &&
      (!tags || tags.length === 0) &&
      !positiveReactionsCount;

    const cacheKey = `search-${q || 'none'}-${page}-${perPage}-${JSON.stringify(filter)}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    if (isNoQueryAndFilters) {
      const articles = await this.articleRepository.find({
        take: perPage,
        skip: (page - 1) * perPage,
      });

      const totalArticles = await this.articleRepository.count();
      const totalPages = Math.ceil(totalArticles / perPage);

      const result = {
        total: totalPages,
        articles,
      };

      await this.cacheManager.set(cacheKey, result, 600000);

      return result;
    }

    const query: any = {
      bool: {
        must: [],
        filter: [],
      },
    };

    if (q) {
      query.bool.must.push({
        multi_match: {
          query: q,
          fields: ['title^3', 'content^2', 'description'],
        },
      });
    }

    if (readingTimeMinutes) {
      query.bool.filter.push({
        range: {
          readingTimeMinutes: {
            lte: readingTimeMinutes,
          },
        },
      });
    }

    if (tags && tags.length > 0) {
      query.bool.filter.push(
        ...tags.map((tag) => ({
          term: { tags: tag },
        })),
      );
    }

    if (positiveReactionsCount) {
      query.bool.filter.push({
        range: {
          positiveReactionsCount: {
            lte: positiveReactionsCount,
          },
        },
      });
    }

    const from = (page - 1) * perPage;

    const { hits } = await this.elasticsearchService.search({
      index: this.ind,
      body: {
        query,
        from,
        size: perPage,
      },
    });

    const total =
      hits.total && typeof hits.total === 'object'
        ? hits.total.value
        : hits.total;

    const result = {
      total,
      articles: hits.hits.map((hit) => hit._source),
    };

    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }
}
