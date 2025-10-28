import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ConflictException } from '@nestjs/common';
import { QueryAuthorDto } from './dto/query-author.dto';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let repository: Repository<Author>;

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getRepositoryToken(Author), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repository = module.get<Repository<Author>>(getRepositoryToken(Author));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an author', async () => {
      const createDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const author = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        books: []
      };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(author);
      mockRepository.save.mockResolvedValue(author);

      const result = await service.create(createDto);
      expect(result).toEqual(author);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(author);
    });

    it('should throw ConflictException if author exists', async () => {
      const createDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe'
      };
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        ...createDto
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should find all authors with pagination', async () => {
      const query: QueryAuthorDto = { page: 1, limit: 10, search: 'John' };
      const authors = [
        { id: 1, firstName: 'John', lastName: 'Doe', books: [] },
      ];
      mockRepository.findAndCount.mockResolvedValue([authors, 1]);

      const result = await service.findAll(query);
      expect(result).toEqual({ data: authors, total: 1, page: 1, limit: 10 });
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find one author', async () => {
      const author = { id: 1, firstName: 'John', lastName: 'Doe', books: [] };
      mockRepository.findOne.mockResolvedValue(author);

      const result = await service.findOne(1);
      expect(result).toEqual(author);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['books'] });
    });

    it('should return null if author not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(1);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updateDto: UpdateAuthorDto = { bio: 'Updated bio' };
      const author = { id: 1, firstName: 'John', lastName: 'Doe', books: [] };
      const updatedAuthor = { ...author, ...updateDto, updatedAt: new Date() };
      mockRepository.findOne.mockResolvedValue(author);
      mockRepository.save.mockResolvedValue(updatedAuthor);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(updatedAuthor);
      expect(mockRepository.save).toHaveBeenCalledWith({ ...author, ...updateDto });
    });
    it('should return null if author not found', async () => {
      const updateDto: UpdateAuthorDto = { bio: 'Updated bio' };
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.update(1, updateDto);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete an author without books', async () => {
      const author = { id: 1, firstName: 'John', lastName: 'Doe', books: [] };
      mockRepository.findOne.mockResolvedValue(author);
      mockRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);
      expect(result).toBe(true);
      expect(mockRepository.remove).toHaveBeenCalledWith(author);
    });

    it('should throw ConflictException if author has books', async () => {
      const author = { id: 1, firstName: 'John', lastName: 'Doe', books: [{ id: 1 }] };
      mockRepository.findOne.mockResolvedValue(author);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});