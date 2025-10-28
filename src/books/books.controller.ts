import { Controller, Get, Post, Patch, Delete, Body, Query, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Book } from './entities/book.entity';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    try {
      return await this.booksService.create(createBookDto);
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Failed to create book');
    }
  }

  @Get()
  findAll(@Query() query: QueryBookDto): Promise<PaginatedResponse<Book>> {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Book> {
    const book = await this.booksService.findOne(id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.booksService.update(id, updateBookDto);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    const result = await this.booksService.remove(id);
    if (!result) throw new NotFoundException('Book not found');
  }
}