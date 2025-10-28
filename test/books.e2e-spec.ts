import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BooksController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should create a book with valid author', async () => {
        // Create author first
        const authorResponse = await request(app.getHttpServer())
            .post('/authors')
            .send({ firstName: 'Jane', lastName: 'Doe' })
            .expect(201);

        const authorId = authorResponse.body.data.id;

        // Create book
        const createBook = {
            title: 'The Great Novel',
            isbn: '978-3-16-148410-0',
            publishedDate: '2020-01-01',
            genre: 'Fiction',
            authorId,
        };

        await request(app.getHttpServer())
            .post('/books')
            .send(createBook)
            .expect(201)
            .expect(res => {
                expect(res.body.data).toMatchObject({
                    title: 'The Great Novel',
                    isbn: '978-3-16-148410-0',
                    genre: 'Fiction',
                    author: { id: authorId },
                });
            });
    });

    it('should fail to create a book with invalid author', () => {
        return request(app.getHttpServer())
            .post('/books')
            .send({
                title: 'Invalid Book',
                isbn: '978-3-16-148410-1',
                authorId: 999,
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toMatchObject({
                    statusCode: 400,
                    message: 'Author does not exist',
                    error: 'Bad Request',
                });
            });
    });

    afterAll(async () => {
        await app.close();
    });
});