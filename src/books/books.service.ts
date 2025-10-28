import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Book } from './entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) { }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authorsRepository.findOneBy({ id: createBookDto.authorId });
    if (!author) throw new BadRequestException('Author does not exist');

    const existingBook = await this.booksRepository.findOne({ where: { isbn: createBookDto.isbn } });
    if (existingBook) throw new ConflictException('ISBN already exists');

    const book = this.booksRepository.create({ ...createBookDto, author });
    return this.booksRepository.save(book);
  }

  async findAll(query: QueryBookDto): Promise<PaginatedResponse<Book>> {
    const { page = 1, limit = 10, search, authorId } = query;
    const where: FindOptionsWhere<Book>[] = [];
    if (search) {
      where.push({ title: Like(`%${search}%`) }, { isbn: Like(`%${search}%`) });
    }
    if (authorId) {
      where.push({ ...(where[0] as FindOptionsWhere<Book>), author: { id: authorId } });
    }
    const [data, total] = await this.booksRepository.findAndCount({
      where: where.length ? where : undefined,
      relations: ['author'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id }, relations: ['author'] });
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book | null> {
    const book = await this.findOne(id);
    if (!book) return null;
    if (updateBookDto.authorId) {
      const author = await this.authorsRepository.findOneBy({ id: updateBookDto.authorId });
      if (!author) throw new BadRequestException('Author does not exist');
      book.author = author;
    }
    if (updateBookDto.isbn) {
      const existingBook = await this.booksRepository.findOneBy({ isbn: updateBookDto.isbn });
      if (existingBook && existingBook.id !== id) {
        throw new ConflictException('ISBN already exists');
      }
    }
    Object.assign(book, updateBookDto);
    return this.booksRepository.save(book);
  }

  async remove(id: number): Promise<boolean> {
    const book = await this.findOne(id);
    if (!book) return false;
    await this.booksRepository.remove(book);
    return true;
  }
}