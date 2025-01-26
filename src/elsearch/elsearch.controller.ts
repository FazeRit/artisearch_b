import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ElsearchService } from './elsearch.service';
import { JwtGuard } from 'src/auth/guard/index';
import { FilterDto } from 'src/common/dto';

@Controller('elsearch')
export class ElsearchController {
  constructor(private elsearchService: ElsearchService) {}

  @UseGuards(JwtGuard)
  @Post('index')
  async index() {
    return await this.elsearchService.index();
  }

  @Post('search')
  async searchArticles(@Body() filter: FilterDto) {
    const filterWithDefaults: FilterDto = {
      page: filter.page ?? 1,
      perPage: filter.perPage ?? 10,
      ...filter,
    };

    return this.elsearchService.searchArticles(
      filterWithDefaults.q,
      filterWithDefaults.page,
      filterWithDefaults.perPage,
      filterWithDefaults,
    );
  }
}
