import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) { }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const existing = await this.authorsRepository.findOne({
      where: { firstName: createAuthorDto.firstName, lastName: createAuthorDto.lastName },
    });
    if (existing) throw new ConflictException('Author with this name already exists');
    const author = this.authorsRepository.create(createAuthorDto);
    return this.authorsRepository.save(author);
  }

  async findAll(query: QueryAuthorDto): Promise<PaginatedResponse<Author>> {
    const { page = 1, limit = 10, search } = query;
    const where = search
      ? [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ]
      : {};
    const [data, total] = await this.authorsRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Author | null> {
    return this.authorsRepository.findOne({ where: { id }, relations: ['books'] });
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author | null> {
    const author = await this.findOne(id);
    if (!author) return null;
    Object.assign(author, updateAuthorDto);
    return this.authorsRepository.save(author);
  }

  async remove(id: number): Promise<boolean> {
    const author = await this.findOne(id);
    if (!author) return false;
    if (author.books && author.books.length > 0) {
      throw new ConflictException('Cannot delete author with associated books');
    }
    await this.authorsRepository.remove(author);
    return true;
  }
}