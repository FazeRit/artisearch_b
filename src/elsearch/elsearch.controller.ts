import { Controller, Post, UseGuards, Get, Query, Body } from '@nestjs/common';
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

  @UseGuards(JwtGuard)
  @Get('search')
  async searchArticles(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Body() filter: FilterDto,
  ) {
    return this.elsearchService.searchArticles(q, page, perPage, filter);
  }
}
