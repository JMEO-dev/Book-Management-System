import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{
        provide: BooksService,
        useValue: mockBooksService,
      }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book and return it', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        isbn: '1234567890',
        authorId: 1,
      };
      const book = {
        id: 1,
        ...createBookDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBooksService.create.mockResolvedValue(book);

      const result = await controller.create(createBookDto);

      expect(result).toEqual(book);
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
    });
    it('should throw BadRequestException if author does not exist', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        isbn: '1234567890',
        authorId: 1,
      };
      mockBooksService.create.mockRejectedValue(new Error('Failed to create book'));

      await expect(controller.create(createBookDto)).rejects.toThrow('Failed to create book');
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
    });
  });
  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        { id: 1, title: 'Book 1', isbn: '1111111111', authorId: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, title: 'Book 2', isbn: '2222222222', authorId: 1, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockBooksService.findAll.mockResolvedValue({ data: books, total: 2, page: 1, limit: 10 });
      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({ data: books, total: 2, page: 1, limit: 10 });
      expect(mockBooksService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
  describe('findOne', () => {
    it('should return a book by id', async () => {
      const book = { id: 1, title: 'Book 1', isbn: '1111111111', authorId: 1, createdAt: new Date(), updatedAt: new Date() };
      mockBooksService.findOne.mockResolvedValue(book);
      const result = await controller.findOne(1);

      expect(result).toEqual(book);
      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    });
    it('should throw NotFoundException if book not found', async () => {
      mockBooksService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(1)).rejects.toThrow('Book not found');
      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    });
  });
  describe('update', () => {
    it('should update and return a book', async () => {
      const updateBookDto = { title: 'Updated Book' };
      const book = { id: 1, title: 'Updated Book', isbn: '1111111111', authorId: 1, createdAt: new Date(), updatedAt: new Date() };
      mockBooksService.update.mockResolvedValue(book);

      const result = await controller.update(1, updateBookDto);

      expect(result).toEqual(book);
      expect(mockBooksService.update).toHaveBeenCalledWith(1, updateBookDto);
    });
    it('should throw NotFoundException if book to update not found', async () => {
      const updateBookDto = { title: 'Updated Book' };
      mockBooksService.update.mockResolvedValue(null);

      await expect(controller.update(1, updateBookDto)).rejects.toThrow('Book not found');
      expect(mockBooksService.update).toHaveBeenCalledWith(1, updateBookDto);
    });
  });
  describe('remove', () => {
    it('should remove a book and return true', async () => {
      mockBooksService.remove.mockResolvedValue(true);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(mockBooksService.remove).toHaveBeenCalledWith(1);
    });
    it('should throw NotFoundException if book to remove not found', async () => {
      mockBooksService.remove.mockResolvedValue(false);

      await expect(controller.remove(1)).rejects.toThrow('Book not found');
      expect(mockBooksService.remove).toHaveBeenCalledWith(1);
    });
  });

});