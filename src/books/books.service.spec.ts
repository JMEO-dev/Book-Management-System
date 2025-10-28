import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

describe('BooksService', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const mockRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthorRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockRepository },
        { provide: getRepositoryToken(Author), useValue: mockAuthorRepository },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a book', async () => {
    const createDto: CreateBookDto = { title: 'Test Book', isbn: '1234567890', authorId: 1 };
    const author = { id: 1, firstName: 'John', lastName: 'Doe', books: [] };
    const book = { id: 1, ...createDto, author, createdAt: new Date(), updatedAt: new Date() };
    mockAuthorRepository.findOneBy.mockResolvedValue(author);
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(book);
    mockRepository.save.mockResolvedValue(book);

    const result = await service.create(createDto);
    expect(result).toEqual(book);
    expect(mockRepository.create).toHaveBeenCalledWith({ ...createDto, author });
    expect(mockRepository.save).toHaveBeenCalledWith(book);
  });

  it('should throw BadRequestException if author does not exist', async () => {
    const createDto: CreateBookDto = {
      title: 'Test Book',
      isbn: '1234567890',
      authorId: 1
    };
    mockAuthorRepository.findOneBy.mockResolvedValue(null);

    await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if ISBN exists', async () => {
    const createDto: CreateBookDto = {
      title: 'Test Book',
      isbn: '1234567891',
      authorId: 2
    };
    const author = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      books: []
    };
    mockAuthorRepository.findOneBy.mockResolvedValue(author);
    mockRepository.findOne.mockResolvedValue({ id: 2, ...createDto, author });
    mockRepository.create.mockReturnValue({ ...createDto, author });

    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  });

  it('should update a book', async () => {
    const updateDto: UpdateBookDto = { title: 'Updated Book', authorId: 2 };
    const existingBook = {
      id: 1,
      title: 'Old Book',
      isbn: '1234567890',
      author: { id: 1, firstName: 'John', lastName: 'Doe', books: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedBook = { ...existingBook, ...updateDto, updatedAt: new Date() };
    mockRepository.findOne.mockResolvedValue(existingBook);
    mockRepository.save.mockResolvedValue(updatedBook);

    const result = await service.update(1, updateDto);
    expect(result).toEqual(updatedBook);
    expect(mockRepository.save).toHaveBeenCalledWith({ ...existingBook, ...updateDto });
  });
  it('should return null when updating non-existing book', async () => {
    const updateDto: UpdateBookDto = { title: 'Updated Book' };
    mockRepository.findOne.mockResolvedValue(null);
    const result = await service.update(999, updateDto);
    expect(result).toBeNull();
  });

  it('should delete a book', async () => {
    const existingBook = {
      id: 1,
      title: 'Book to Delete',
      isbn: '1234567890',
      author: { id: 1, firstName: 'John', lastName: 'Doe', books: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockRepository.findOne.mockResolvedValue(existingBook);
    mockRepository.remove.mockResolvedValue(existingBook);

    const result = await service.remove(1);
    expect(result).toBe(true);
    expect(mockRepository.remove).toHaveBeenCalledWith(existingBook);
  });

  it('should return false when deleting non-existing book', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const result = await service.remove(999);
    expect(result).toBe(false);
  });
});