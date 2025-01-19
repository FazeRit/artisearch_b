import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Article } from '../entities/index';
import { FilterDto } from 'src/common/dto';

@Injectable()
export class ElsearchService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private readonly elasticsearchService: ElasticsearchService,
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

    const query: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
              fields: ['title^3', 'content^2', 'description'],
            },
          },
        ],
        filter: [],
      },
    };

    if (readingTimeMinutes) {
      query.bool.filter.push({
        range: {
          readingTimeMinutes: {
            gte: readingTimeMinutes,
          },
        },
      });
    }

    if (tags && tags.length > 0) {
      query.bool.filter.push({
        terms: {
          tags: tags,
        },
      });
    }

    if (positiveReactionsCount) {
      query.bool.filter.push({
        range: {
          positiveReactionsCount: {
            gte: positiveReactionsCount,
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

    return {
      total,
      articles: hits.hits.map((hit) => hit._source),
    };
  }
}
