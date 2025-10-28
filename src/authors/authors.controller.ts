import { Controller, Get, Post, Patch, Delete, Body, Query, Param, NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Author } from './entities/author.entity';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) { }

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  findAll(@Query() query: QueryAuthorDto): Promise<PaginatedResponse<Author>> {
    return this.authorsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Author> {
    const author = await this.authorsService.findOne(id);
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorsService.update(id, updateAuthorDto);
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    const result = await this.authorsService.remove(id);
    if (!result) throw new NotFoundException('Author not found');
  }
}