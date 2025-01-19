import { Module } from '@nestjs/common';
import { ElsearchController } from './elsearch.controller';
import { ElsearchService } from './elsearch.service';
import { Article } from 'src/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>(
          'ELASTICSEARCH_NODE',
          'http://localhost:9200',
        ),
        auth: {
          username: configService.get<string>(
            'ELASTICSEARCH_USERNAME',
            'elastic',
          ),
          password: configService.get<string>(
            'ELASTICSEARCH_PASSWORD',
            'changeme',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ElsearchController],
  providers: [ElsearchService],
})
export class ElsearchModule {}
