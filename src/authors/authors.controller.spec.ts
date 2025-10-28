import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { Author } from './entities/author.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: AuthorsService;

  const mockAuthorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: mockAuthorsService,
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    service = module.get<AuthorsService>(AuthorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an author and return it', async () => {
      const createAuthorDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test author',
        birthDate: '1970-01-01',
      };
      const author: Author = {
        id: 1,
        ...createAuthorDto,
        bio: 'Test author',
        birthDate: new Date('1970-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        books: [],
      };
      mockAuthorsService.create.mockResolvedValue(author);

      const result = await controller.create(createAuthorDto);

      expect(result).toEqual(author);
      expect(mockAuthorsService.create).toHaveBeenCalledWith(createAuthorDto);
    });

    it('should throw ConflictException if author already exists', async () => {
      const createAuthorDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
      };
      mockAuthorsService.create.mockRejectedValue(new ConflictException('Author with this name already exists'));

      await expect(controller.create(createAuthorDto)).rejects.toThrow(ConflictException);
      expect(mockAuthorsService.create).toHaveBeenCalledWith(createAuthorDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of authors', async () => {
      const query: QueryAuthorDto = { page: 1, limit: 10, search: 'John' };
      const paginatedResponse: PaginatedResponse<Author> = {
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Test author',
            birthDate: new Date('1970-01-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
            books: []
          }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockAuthorsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResponse);
      expect(mockAuthorsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return an author by ID', async () => {
      const author: Author = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test author',
        birthDate: new Date('1970-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        books: [],
      };
      mockAuthorsService.findOne.mockResolvedValue(author);

      const result = await controller.findOne(1);

      expect(result).toEqual(author);
      expect(mockAuthorsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if author not found', async () => {
      mockAuthorsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockAuthorsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return an author', async () => {
      const updateAuthorDto: UpdateAuthorDto = { bio: 'Updated bio' };
      const author: Author = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Updated bio',
        birthDate: new Date('1970-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        books: [],
      };
      mockAuthorsService.update.mockResolvedValue(author);

      const result = await controller.update(1, updateAuthorDto);

      expect(result).toEqual(author);
      expect(mockAuthorsService.update).toHaveBeenCalledWith(1, updateAuthorDto);
    });

    it('should throw NotFoundException if author not found', async () => {
      const updateAuthorDto: UpdateAuthorDto = { bio: 'Updated bio' };
      mockAuthorsService.update.mockResolvedValue(null);

      await expect(controller.update(1, updateAuthorDto)).rejects.toThrow(NotFoundException);
      expect(mockAuthorsService.update).toHaveBeenCalledWith(1, updateAuthorDto);
    });
  });

  describe('remove', () => {
    it('should delete an author and return nothing', async () => {
      mockAuthorsService.remove.mockResolvedValue(true);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(mockAuthorsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if author not found', async () => {
      mockAuthorsService.remove.mockResolvedValue(false);

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockAuthorsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ConflictException if author has associated books', async () => {
      mockAuthorsService.remove.mockRejectedValue(new ConflictException('Cannot delete author with associated books'));

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
      expect(mockAuthorsService.remove).toHaveBeenCalledWith(1);
    });
  });
});